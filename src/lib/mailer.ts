import mjml2html from "mjml";
import sgMail from "@sendgrid/mail";
import { saveEmailRecord, updateEmailStatus } from "./emailStore";
import path from "path";
import fs from "fs";
import { supabase } from "../supabase/client";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "StellarHost <no-reply@stellarhost.example>";

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

export async function renderMjmlTemplate(name: string, vars: Record<string, string | number | boolean>) {
  const templateDir = path.join(process.cwd(), "src", "lib", "mail-templates");
  const mjmlPath = path.join(templateDir, `${name}.mjml`);
  const textPath = path.join(templateDir, `${name}.txt`);

  let mjml = "";
  let text = "";
  try {
    if (fs.existsSync(mjmlPath)) mjml = fs.readFileSync(mjmlPath, "utf8");
    if (fs.existsSync(textPath)) text = fs.readFileSync(textPath, "utf8");
  } catch (e) {
    console.error("Error reading email templates:", e);
  }

  const render = (t: string) => t.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, k) => String(vars[k] ?? ""));
  const renderedMjml = render(mjml);
  const renderedText = render(text);

  const html = mjml2html(renderedMjml, { validationLevel: "soft" }).html;

  return { html, text: renderedText };
}

export async function sendEmail({ to, subject, templateName, vars, idempotencyKey }: { to: string; subject: string; templateName: string; vars: Record<string, string | number | boolean>; idempotencyKey?: string; }) {
  // Save a record in DB (pending)
  const record = await saveEmailRecord({ to, subject, templateName, vars, idempotencyKey });

  const { html, text } = await renderMjmlTemplate(templateName, vars);

  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set — logging preview instead of sending");
    console.log(`--- EMAIL PREVIEW (${templateName}) ---`);
    console.log({ to, subject, text, html });
    // Mark as previewed in DB
    await updateEmailStatus(record.id, "previewed", null);
    return record;
  }

  const msg: any = {
    to,
    from: EMAIL_FROM,
    subject,
    html,
    text,
    // custom args for sendgrid event tracking
    customArgs: { templateName },
  };

  try {
    const res = await sgMail.send(msg);
    // send returns an array
    const sgRes = Array.isArray(res) ? res[0] : res;
    const sgMessageId = sgRes && sgRes.headers && (sgRes.headers["x-message-id"] || sgRes.headers["X-Message-Id"] || null);
    await updateEmailStatus(record.id, "sent", sgMessageId);
    return record;
  } catch (err: any) {
    console.error("SendGrid send error:", err?.message ?? err);
    await updateEmailStatus(record.id, "failed", null, err?.message ?? String(err));
    throw err;
  }
}
