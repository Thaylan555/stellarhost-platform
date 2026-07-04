# Email & MJML configuration

Add these variables to your environment (production/staging):

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_WEBHOOK_SECRET=your_sendgrid_webhook_verification_token
EMAIL_FROM="StellarHost <no-reply@yourdomain.com>"
REDIS_URL=redis://127.0.0.1:6379

Database (Supabase) table `emails` schema suggestion:

CREATE TABLE emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to text NOT NULL,
  subject text NOT NULL,
  templateName text NOT NULL,
  vars jsonb,
  status text,
  provider_msg_id text,
  error text,
  idempotency_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
