import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createSchema = z.object({
  subject: z.string().trim().min(4).max(140),
  body: z.string().trim().min(10).max(5000),
  category: z.enum(["technical", "billing", "sales", "other"]).default("technical"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  service_id: z.string().uuid().optional().nullable(),
});

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => createSchema.parse(raw))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        user_id: userId,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        service_id: data.service_id ?? null,
        status: "open",
      })
      .select("id")
      .single();
    if (error || !ticket) throw new Error(error?.message ?? "Falha ao criar ticket");

    const { error: msgErr } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      author_id: userId,
      body: data.body,
    });
    if (msgErr) throw new Error(msgErr.message);

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "ticket",
      title: "Ticket aberto",
      body: `Seu ticket "${data.subject}" foi registrado. Nossa equipe responderá em breve.`,
      link: `/tickets/${ticket.id}`,
    });

    return { id: ticket.id };
  });

export const getTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("id, subject, status, category, priority, last_reply_at, created_at, closed_at, rating, service_id, user_id")
      .eq("id", data.id)
      .single();
    if (error || !ticket) throw new Error("Ticket não encontrado");
    if (ticket.user_id !== userId) throw new Error("Sem permissão");

    const { data: messages, error: mErr } = await supabase
      .from("ticket_messages")
      .select("id, body, author_id, is_internal_note, created_at")
      .eq("ticket_id", data.id)
      .eq("is_internal_note", false)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);

    return { ticket, messages: messages ?? [] };
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ ticket_id: z.string().uuid(), body: z.string().trim().min(2).max(5000) }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: t } = await supabase.from("tickets").select("user_id, status").eq("id", data.ticket_id).single();
    if (!t || t.user_id !== userId) throw new Error("Sem permissão");
    if (t.status === "closed") throw new Error("Ticket fechado. Abra um novo.");

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: data.ticket_id,
      author_id: userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);

    await supabase
      .from("tickets")
      .update({ status: "pending_staff", last_reply_at: new Date().toISOString() })
      .eq("id", data.ticket_id);

    return { ok: true };
  });

export const closeTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      ticket_id: z.string().uuid(),
      rating: z.number().int().min(1).max(5).optional(),
      rating_comment: z.string().max(500).optional(),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: t } = await supabase.from("tickets").select("user_id").eq("id", data.ticket_id).single();
    if (!t || t.user_id !== userId) throw new Error("Sem permissão");

    const { error } = await supabase
      .from("tickets")
      .update({
        status: "closed",
        closed_at: new Date().toISOString(),
        rating: data.rating ?? null,
        rating_comment: data.rating_comment ?? null,
      })
      .eq("id", data.ticket_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
