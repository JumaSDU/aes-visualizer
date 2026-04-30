import React, { useEffect, useState } from "react";

const OP_COLOR = {
  Input: "#64748b", "Cipher Input": "#64748b",
  AddRoundKey: "#00d4ff", Error: "#f87171",
};
function getColor(name) {
  if (name.startsWith("SubBytes") || name.startsWith("InvSubBytes")) return "#10b981";
  if (name.startsWith("ShiftRows") || name.startsWith("InvShiftRows")) return "#f59e0b";
  if (name.startsWith("MixColumns") || name.startsWith("InvMixColumns")) return "#f97316";
  if (name.startsWith("AddRoundKey")) return "#00d4ff";
  return OP_COLOR[name] || "#64748b";
}

export default function StepViewer({ step }) {
  const [animated, setAnimated] = useState([]);

  useEffect(() => {
    if (!step?.prev) { setAnimated([]); return; }
    const changed = step.state.map((v, i) => v !== step.prev[i]);
    setAnimated(changed);
    const t = setTimeout(() => setAnimated([]), 800);
    return () => clearTimeout(t);
  }, [step]);

  if (!step) return null;
  const color = getColor(step.name);

  return (
    <div style={{
      border: `1px solid ${color}`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 10,
      overflow: "hidden",
      marginTop: 16,
      background: "#0f1a2e",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 16px", background: "rgba(0,0,0,0.35)",
      }}>
        <div style={{
          fontFamily: "monospace", fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 12,
          background: `${color}20`, color, border: `1px solid ${color}40`,
          textTransform: "uppercase", letterSpacing: 1,
        }}>
          {step.formula}
        </div>
        <div style={{ flex: 1, fontWeight: 700, letterSpacing: 1, color, fontSize: 15 }}>
          {step.name}
        </div>
      </div>

      {/* Matrix */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: -8, top: 0, bottom: 0,
              borderLeft: `2px solid ${color}`, borderTop: `2px solid ${color}`,
              borderBottom: `2px solid ${color}`, opacity: 0.7, borderRadius: "2px 0 0 2px",
            }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, padding: "4px 10px" }}>
              {step.state.map((v, i) => (
                <div key={i} style={{
                  fontFamily: "monospace", fontSize: 12,
                  width: 40, height: 32,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 4,
                  transition: "all 0.35s",
                  background: animated[i] ? `${color}30` : "rgba(255,255,255,0.04)",
                  color: animated[i] ? "#fff" : "rgba(226,232,240,0.55)",
                  border: animated[i] ? `1px solid ${color}70` : "1px solid rgba(255,255,255,0.06)",
                  transform: animated[i] ? "scale(1.1)" : "scale(1)",
                  boxShadow: animated[i] ? `0 0 8px ${color}40` : "none",
                }}>
                  {v}
                </div>
              ))}
            </div>
            <span style={{
              position: "absolute", right: -8, top: 0, bottom: 0,
              borderRight: `2px solid ${color}`, borderTop: `2px solid ${color}`,
              borderBottom: `2px solid ${color}`, opacity: 0.7, borderRadius: "0 2px 2px 0",
            }} />
          </div>
        </div>

        {step.desc && (
          <p style={{
            fontFamily: "monospace", fontSize: 11,
            color: "#475569", lineHeight: 1.7, marginTop: 10, marginBottom: 0,
          }}>
            {step.desc}
          </p>
        )}
        <p style={{ fontFamily: "monospace", fontSize: 11, color, marginTop: 5, marginBottom: 0, opacity: 0.8 }}>
          OUT → {step.state.slice(0, 8).join(" ")} …
        </p>
      </div>
    </div>
  );
}