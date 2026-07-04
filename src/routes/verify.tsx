import React, { useState } from "react";
import OTPInput from "../components/OTPInput";
import { enqueueMail } from "../workers/mailWorker";
import { supabase } from "../supabase/client";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState(true);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const maskEmail = (e: string) => {
    const [local, domain] = e.split("@");
    if (!domain) return e;
    return local.slice(0, 2) + "****@" + domain;
  };

  const sendVerification = async () => {
    if (!email) return setMessage("Informe o e-mail");
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    await enqueueMail(email, "Seu código StellarHost", "verification", { otp: generatedOtp, expires_in: 10, action_link: "https://your.app/confirm" });
    setMessage("Código enviado");
    setCooldown(60);
    const t = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(t);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const verify = async () => {
    // Implement verification logic (compare with stored OTP in DB)
    setMessage("Verificando...");
    // Placeholder: pretend success
    setTimeout(() => setMessage("Verificado com sucesso"), 800);
  };

  return (
    <div style={{ maxWidth: 540, margin: "48px auto" }}>
      <h1>Acesse sua Conta</h1>
      <p>Gerencie seus servidores estelares</p>

      <div style={{ marginTop: 24 }}>
        <label htmlFor="email">E-mail</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        {email && (
          <div style={{ marginTop: 8 }}>
            <span>{masked ? maskEmail(email) : email}</span>
            <button onClick={() => setMasked((m) => !m)} style={{ marginLeft: 8 }}>{masked ? "Mostrar" : "Ocultar"}</button>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <button onClick={sendVerification} disabled={cooldown > 0}>{cooldown > 0 ? `Reenviar em ${cooldown}s` : "Enviar código"}</button>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Código de Verificação</h3>
          <OTPInput onChange={(v) => setOtp(v)} />
          <div style={{ marginTop: 12 }}>
            <button onClick={verify}>Verificar Token</button>
          </div>

          {message && <div style={{ marginTop: 12 }}>{message}</div>}
        </div>
      </div>
    </div>
  );
}
