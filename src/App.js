import React, { useState } from "react";
import { encryptSteps, decryptSteps } from "./logic/aesSteps";
import StepViewer from "./components/StepViewer";
import "./index.css";

export default function App() {
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
  const accent = isDec ? "#7c3aed" : "#00d4ff";

  const copyResult = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{
          background: "linear-gradient(90deg,#00d4ff,#7c3aed)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: 4, fontSize: 28, marginBottom: 4,
        }}>
          AES VISUALIZER
        </h1>
        <p style={{ fontFamily: "monospace", fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 20 }}>
          ADVANCED ENCRYPTION STANDARD
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["enc","dec"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: "10px", borderRadius: 8,
              border: `1px solid ${mode===m ? (m==="enc"?"#00d4ff":"#7c3aed") : "#1a2744"}`,
              background: mode===m ? (m==="enc"?"rgba(0,212,255,0.1)":"rgba(124,58,237,0.1)") : "transparent",
              color: mode===m ? (m==="enc"?"#00d4ff":"#7c3aed") : "#475569",
              fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
              cursor: "pointer", fontSize: 13, transition: "all 0.2s",
            }}>
              {m === "enc" ? "⬡ Encrypt" : "⬡ Decrypt"}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontFamily:"monospace", fontSize:10, color:"#475569", letterSpacing:2, display:"block", marginBottom:4 }}>
            {isDec ? "CIPHERTEXT (hex from encrypt)" : "PLAINTEXT (max 16 chars)"}
          </label>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={isDec ? "Paste hex result..." : "Enter text..."}
            maxLength={isDec ? 64 : 16}
            style={{ width:"100%", padding:"10px 12px", background:"rgba(0,0,0,0.4)",
              border:"1px solid #1a2744", borderRadius:8, color:"#e2e8f0",
              fontFamily:"monospace", fontSize:13, outline:"none", boxSizing:"border-box" }}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontFamily:"monospace", fontSize:10, color:"#475569", letterSpacing:2, display:"block", marginBottom:4 }}>
            KEY ({key.length}/16 chars)
          </label>
          <input
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="16 character key..."
            maxLength={16}
            style={{ width:"100%", padding:"10px 12px", background:"rgba(0,0,0,0.4)",
              border:"1px solid #1a2744", borderRadius:8, color:"#e2e8f0",
              fontFamily:"monospace", fontSize:13, outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {/* Run button */}
        <button
          onClick={() => run(mode==="enc" ? encryptSteps : decryptSteps, mode)}
          style={{
            width:"100%", padding:13, borderRadius:8, border:"none",
            background: isDec ? "linear-gradient(135deg,#3a1060,#7c3aed)" : "linear-gradient(135deg,#005a78,#00d4ff)",
            color: isDec ? "#15052a" : "#001520",
            fontWeight:700, fontSize:15, letterSpacing:3, textTransform:"uppercase",
            cursor:"pointer", marginBottom:0,
          }}
        >
          {isDec ? "Run Decryption ›" : "Run Encryption ›"}
        </button>

        {/* Step viewer */}
        {steps.length > 0 && (
          <>
            {/* Progress dots */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center", marginTop:16 }}>
              {steps.map((_,idx) => (
                <div key={idx} onClick={() => setI(idx)} style={{
                  width:9, height:9, borderRadius:"50%", cursor:"pointer", transition:"all 0.2s",
                  background: idx < i ? `${accent}50` : idx===i ? accent : "transparent",
                  border: `1px solid ${idx<=i ? accent : "#1a2744"}`,
                  boxShadow: idx===i ? `0 0 7px ${accent}` : "none",
                }} title={steps[idx].name} />
              ))}
            </div>

            <div style={{ fontFamily:"monospace", fontSize:11, color:"#475569", textAlign:"center", marginTop:6 }}>
              Step {i+1} / {steps.length} — {steps[i].name}
            </div>

            <StepViewer step={steps[i]} />

            {/* Nav buttons */}
            <div className="nav" style={{ display:"flex", gap:8, marginTop:12 }}>
              <button onClick={() => setI(v=>Math.max(0,v-1))} disabled={i===0}
                style={{ flex:1, padding:9, borderRadius:7, border:"1px solid #1a2744",
                  background:"transparent", color:"#475569", fontFamily:"monospace",
                  cursor:"pointer", opacity: i===0?0.3:1 }}>
                ‹ Prev
              </button>
              {!isLast && (
                <button onClick={() => setI(v=>v+1)}
                  style={{ flex:1, padding:9, borderRadius:7, border:`1px solid ${accent}`,
                    background:`${accent}15`, color:accent, fontFamily:"monospace", cursor:"pointer" }}>
                  Next ›
                </button>
              )}
              {isLast && !finished && (
                <button onClick={() => setFinished(true)}
                  style={{ flex:1, padding:9, borderRadius:7, border:"1px solid #10b981",
                    background:"rgba(16,185,129,0.15)", color:"#10b981", fontFamily:"monospace", cursor:"pointer" }}>
                  Finish ✓
                </button>
              )}
            </div>

            {/* Result */}
            {finished && result && (
              <div className="result animate-result" style={{
                border: `1px solid ${accent}`, borderRadius:10,
                background: `${accent}10`, padding:16, marginTop:12,
              }}>
                <div style={{ fontFamily:"monospace", fontSize:10, color:"#475569", letterSpacing:2, marginBottom:8 }}>
                  {isDec ? "DECRYPTED PLAINTEXT" : "ENCRYPTED CIPHERTEXT"}
                </div>
                <div onClick={copyResult} title="Click to copy" style={{
                  fontFamily:"monospace", fontSize:14, color:accent,
                  wordBreak:"break-all", letterSpacing:2, cursor:"pointer",
                  padding:"10px", background:"rgba(0,0,0,0.3)", borderRadius:6,
                }}>
                  {result}
                </div>
                <div style={{ fontFamily:"monospace", fontSize:10, color:"#475569", marginTop:6 }}>
                  {copied ? "✓ Copied!" : "Click to copy"}
                </div>
                {!isDec && (
                  <button onClick={() => { setMode("dec"); setText(result); }}
                    style={{ marginTop:10, padding:"7px 16px", borderRadius:6,
                      border:"1px solid rgba(124,58,237,0.4)", background:"rgba(124,58,237,0.1)",
                      color:"#a78bfa", fontFamily:"monospace", fontSize:11, cursor:"pointer" }}>
                    Use in Decrypt →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}