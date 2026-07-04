import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "StellarHost <no-reply@stellarhost.example>";

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail({ to, subject, html, text, from }: { to: string; subject: string; html?: string; text?: string; from?: string; }) {
  if (!SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY is not set — email not sent.\nPreviewing to console instead.");
    console.log({ to, subject, text, html });
    return;
  }

  const msg = {
    to,
    from: from || EMAIL_FROM,
    subject,
    html,
    text,
  } as any;

  await sgMail.send(msg);
}

export function renderTemplate(name: string, vars: Record<string, string | number | undefined>) {
  const templateDir = path.join(process.cwd(), "src", "lib", "mail-templates");
  const htmlPath = path.join(templateDir, `${name}.html`);
  const textPath = path.join(templateDir, `${name}.txt`);

  let html = "";
  let text = "";
  try {
    if (fs.existsSync(htmlPath)) html = fs.readFileSync(htmlPath, "utf8");
    if (fs.existsSync(textPath)) text = fs.readFileSync(textPath, "utf8");
  } catch (e) {
    console.error("Error reading email templates:", e);
  }

  // Simple variable substitution: {{var}}
  const render = (t: string) => t.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, k) => String(vars[k] ?? ""));

  return { html: render(html), text: render(text) };
}
