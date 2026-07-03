import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [servicesRes, invoicesRes, ticketsRes, notificationsRes] = await Promise.all([
      supabase
        .from("services")
        .select("id, name, status, next_due_at, plan:plans(name, type)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("invoices")
        .select("id, number, total_cents, status, due_at, description")
        .eq("user_id", userId)
        .in("status", ["pending", "overdue"])
        .order("due_at", { ascending: true })
        .limit(5),
      supabase
        .from("tickets")
        .select("id, subject, status, priority, last_reply_at")
        .eq("user_id", userId)
        .not("status", "in", "(closed,resolved)")
        .order("last_reply_at", { ascending: false })
        .limit(5),
      supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .is("read_at", null),
    ]);

    return {
      services: servicesRes.data ?? [],
      pendingInvoices: invoicesRes.data ?? [],
      openTickets: ticketsRes.data ?? [],
      unreadNotifications: notificationsRes.data?.length ?? 0,
    };
  });

export const listMyServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("services")
      .select("id, name, status, billing_cycle, price_cents, next_due_at, ip_address, port, node_name, plan:plans(name, type, ram_mb, cpu_cores, disk_gb)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMyInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("invoices")
      .select("id, number, description, total_cents, status, due_at, paid_at, payment_method")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMyTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("tickets")
      .select("id, subject, category, priority, status, last_reply_at, created_at")
      .eq("user_id", userId)
      .order("last_reply_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, phone, document, company")
      .eq("id", userId)
      .single();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { full_name?: string; phone?: string; document?: string; company?: string }) => input)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name ?? null,
        phone: data.phone ?? null,
        document: data.document ?? null,
        company: data.company ?? null,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
