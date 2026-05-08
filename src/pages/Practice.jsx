import React, { useState } from "react";
import { encryptSteps, decryptSteps } from "../logic/aesSteps";
import StepViewer from "../components/StepViewer";

export default function Practice() {
  const [text, setText] = useState("HELLO AES!");
  const [key, setKey] = useState("MySecretKey12345");
  const [steps, setSteps] = useState([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState("");
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState("enc");
  const [copied, setCopied] = useState(false);

  const run = (fn, m) => {
    const res = fn(text, key);
    setSteps(res.steps);
    setResult(res.result);
    setI(0);
    setFinished(false);
    setMode(m);
  };

  const isLast = i === steps.length - 1;
  const isDec = mode === "dec";
  const accent = isDec ? "#a78bfa" : "var(--accent)";

  const copyResult = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <>
      <h1 className="page-title">Практика AES</h1>
      <p className="page-subtitle">Пошаговая визуализация шифрования и расшифрования</p>

      <div className="card" style={{ maxWidth: 640, marginTop: 22 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["enc", "dec"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `1px solid ${mode === m ? (m === "enc" ? "var(--accent)" : "#a78bfa") : "var(--border)"}`,
                background: mode === m ? (m === "enc" ? "var(--accent-dim)" : "rgba(167,139,250,0.1)") : "transparent",
                color: mode === m ? (m === "enc" ? "var(--accent)" : "#a78bfa") : "var(--text-muted)",
                fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                cursor: "pointer", fontSize: 12,
              }}
            >
              {m === "enc" ? "Шифрование" : "Расшифрование"}
            </button>
          ))}
        </div>

        <Field
          label={isDec ? "Шифртекст (hex)" : "Открытый текст (макс. 16 символов)"}
          value={text}
          onChange={setText}
          placeholder={isDec ? "Вставьте hex..." : "Введите текст..."}
          maxLength={isDec ? 64 : 16}
        />
        <Field
          label={`Ключ (${key.length}/16)`}
          value={key}
          onChange={setKey}
          placeholder="16 символов..."
          maxLength={16}
        />

        <button
          onClick={() => run(mode === "enc" ? encryptSteps : decryptSteps, mode)}
          className="btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
        >
          {isDec ? "Запустить расшифрование" : "Запустить шифрование"}
        </button>

        {steps.length > 0 && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 18 }}>
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setI(idx)}
                  style={{
                    width: 9, height: 9, borderRadius: "50%", cursor: "pointer", transition: "all 0.2s",
                    background: idx < i ? `${accent}50` : idx === i ? accent : "transparent",
                    border: `1px solid ${idx <= i ? accent : "var(--border)"}`,
                  }}
                  title={steps[idx].name}
                />
              ))}
            </div>

            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
              Шаг {i + 1} / {steps.length} — {steps[i].name}
            </div>

            <StepViewer step={steps[i]} />

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => setI((v) => Math.max(0, v - 1))}
                disabled={i === 0}
                className="btn-ghost"
                style={{ flex: 1, opacity: i === 0 ? 0.3 : 1 }}
              >
                ‹ Назад
              </button>
              {!isLast && (
                <button onClick={() => setI((v) => v + 1)} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Далее ›
                </button>
              )}
              {isLast && !finished && (
                <button onClick={() => setFinished(true)} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                  Завершить ✓
                </button>
              )}
            </div>

            {finished && result && (
              <div
                style={{
                  border: `1px solid ${accent}`, borderRadius: 10,
                  background: `${isDec ? "rgba(167,139,250,0.08)" : "var(--accent-dim)"}`,
                  padding: 16, marginTop: 14,
                }}
              >
                <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 8 }}>
                  {isDec ? "ОТКРЫТЫЙ ТЕКСТ" : "ШИФРТЕКСТ"}
                </div>
                <div
                  onClick={copyResult}
                  style={{
                    fontFamily: "monospace", fontSize: 13, color: accent,
                    wordBreak: "break-all", letterSpacing: 1, cursor: "pointer",
                    padding: 10, background: "rgba(0,0,0,0.3)", borderRadius: 6,
                  }}
                >
                  {result}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
                  {copied ? "✓ Скопировано" : "Клик — скопировать"}
                </div>
                {!isDec && (
                  <button
                    onClick={() => { setMode("dec"); setText(result); }}
                    className="btn-ghost"
                    style={{ marginTop: 10, fontSize: 11 }}
                  >
                    Использовать для расшифрования →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange, placeholder, maxLength }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%", padding: "10px 12px",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--border)",
          borderRadius: 8, color: "var(--text)",
          fontFamily: "monospace", fontSize: 13, outline: "none",
        }}
      />
    </div>
  );
}
