import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const cycleFactor: Record<string, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
};

const cycleDiscount: Record<string, number> = {
  monthly: 0,
  quarterly: 0.05,
  semiannual: 0.1,
  annual: 0.2,
};

export const validateCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ code: z.string().trim().min(2).max(40), amount_cents: z.number().int().positive() }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: c } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", data.code.toUpperCase())
      .eq("is_active", true)
      .maybeSingle();
    if (!c) return { valid: false as const, reason: "Cupom inválido" };
    if (c.valid_until && new Date(c.valid_until) < new Date()) return { valid: false as const, reason: "Cupom expirado" };
    if (c.max_uses && c.uses_count >= c.max_uses) return { valid: false as const, reason: "Cupom esgotado" };
    if (data.amount_cents < c.min_amount_cents) return { valid: false as const, reason: "Valor mínimo não atingido" };
    const discount = c.type === "percent" ? Math.floor(data.amount_cents * (c.value / 100)) : Math.min(c.value, data.amount_cents);
    return { valid: true as const, code: c.code, type: c.type, value: c.value, discount_cents: discount };
  });

export const createInvoiceForPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({
      plan_id: z.string().uuid(),
      billing_cycle: z.enum(["monthly", "quarterly", "semiannual", "annual"]),
      coupon_code: z.string().trim().max(40).optional(),
    }).parse(raw),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: plan, error } = await supabase
      .from("plans")
      .select("id, name, price_cents, type, is_active")
      .eq("id", data.plan_id)
      .single();
    if (error || !plan || !plan.is_active) throw new Error("Plano indisponível");

    const factor = cycleFactor[data.billing_cycle];
    const discountPct = cycleDiscount[data.billing_cycle];
    const gross = plan.price_cents * factor;
    const cycleDiscountCents = Math.floor(gross * discountPct);
    let amount = gross - cycleDiscountCents;

    let couponDiscount = 0;
    let couponCode: string | null = null;
    if (data.coupon_code) {
      const { data: c } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (c && amount >= c.min_amount_cents && (!c.valid_until || new Date(c.valid_until) > new Date()) && (!c.max_uses || c.uses_count < c.max_uses)) {
        couponDiscount = c.type === "percent" ? Math.floor(amount * (c.value / 100)) : Math.min(c.value, amount);
        couponCode = c.code;
      }
    }

    const total = Math.max(amount - couponDiscount, 100);
    const number = "SH-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 999).toString().padStart(3, "0");
    const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: inv, error: invErr } = await supabase
      .from("invoices")
      .insert({
        user_id: userId,
        number,
        description: `${plan.name} - ${data.billing_cycle}`,
        amount_cents: gross,
        discount_cents: cycleDiscountCents + couponDiscount,
        total_cents: total,
        due_at: dueAt,
        status: "pending",
        coupon_code: couponCode,
        metadata: { plan_id: plan.id, plan_type: plan.type, billing_cycle: data.billing_cycle },
      })
      .select("id")
      .single();
    if (invErr || !inv) throw new Error(invErr?.message ?? "Falha ao criar fatura");

    return { invoice_id: inv.id, total_cents: total, number };
  });

export const getInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: inv, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !inv) throw new Error("Fatura não encontrada");
    if (inv.user_id !== userId) throw new Error("Sem permissão");
    return inv;
  });

export const generatePixForInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ invoice_id: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: inv } = await supabase
      .from("invoices")
      .select("id, user_id, status, total_cents, number, pix_copy_paste")
      .eq("id", data.invoice_id)
      .single();
    if (!inv || inv.user_id !== userId) throw new Error("Sem permissão");
    if (inv.status !== "pending") throw new Error("Fatura não está pendente");

    // Placeholder PIX code — será substituído por Mercado Pago quando as credenciais forem adicionadas
    const pixCode = inv.pix_copy_paste ?? `00020126580014BR.GOV.BCB.PIX0136stellarhost-${inv.number.toLowerCase()}5204000053039865802BR5913STELLARHOST6009SAO PAULO62070503***6304${Math.random().toString(16).slice(2, 6).toUpperCase()}`;

    if (!inv.pix_copy_paste) {
      await supabase
        .from("invoices")
        .update({ payment_method: "pix", pix_copy_paste: pixCode })
        .eq("id", inv.id);
    }

    return { pix_copy_paste: pixCode, expires_in_minutes: 30, amount_cents: inv.total_cents };
  });
