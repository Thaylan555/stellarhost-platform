import { supabase } from "../supabase/client";

export type EmailRecord = {
  id?: string;
  to: string;
  subject: string;
  templateName: string;
  vars: Record<string, string | number | boolean>;
  status?: string;
  provider_msg_id?: string | null;
  error?: string | null;
  idempotency_key?: string | null;
  created_at?: string;
};

export async function saveEmailRecord(record: Omit<EmailRecord, "id" | "status" | "created_at">) {
  try {
    const { data, error } = await supabase.from("emails").insert([{ ...record, status: "pending" }]).select().single();
    if (error) throw error;
    return data as EmailRecord;
  } catch (e) {
    console.error("Error saving email record:", e);
    // Fallback: return minimal record
    return { id: `local-${Date.now()}`, ...record, status: "pending", created_at: new Date().toISOString() } as EmailRecord;
  }
}

export async function updateEmailStatus(id: string | number, status: string, provider_msg_id: string | null = null, error: string | null = null) {
  try {
    const updates: any = { status, provider_msg_id, error };
    const { data, error: upErr } = await supabase.from("emails").update(updates).eq("id", id).select().single();
    if (upErr) throw upErr;
    return data as EmailRecord;
  } catch (e) {
    console.error("Error updating email status:", e);
    return null;
  }
}
