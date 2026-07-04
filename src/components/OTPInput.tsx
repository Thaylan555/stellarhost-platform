import React, { useRef, useState, useEffect } from "react";

type OTPInputProps = {
  length?: number;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
};

export default function OTPInput({ length = 6, onChange, autoFocus = true, className = "" }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) inputsRef.current[0]?.focus();
  }, [autoFocus]);

  const handleChange = (idx: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const next = [...values];
    next[idx] = val.slice(-1);
    setValues(next);
    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    onChange?.(next.join(""));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      const prev = inputsRef.current[idx - 1];
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").trim();
    if (!/^[0-9]+$/.test(paste)) return;
    const chars = paste.split("").slice(0, length);
    const next = Array(length).fill("");
    for (let i = 0; i < chars.length; i++) next[i] = chars[i];
    setValues(next);
    onChange?.(next.join(""));
  };

  return (
    <div className={`otp-input ${className}`} style={{ display: "flex", gap: 8 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          aria-label={`digit-${i + 1}`}
          style={{
            width: 48,
            height: 56,
            borderRadius: 8,
            background: "#0b1120",
            color: "#fff",
            textAlign: "center",
            fontSize: 24,
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}
