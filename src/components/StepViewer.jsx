import React from "react";

export default function StepViewer({ step }) {
  if (!step) return null;

  return (
    <div className="card">
      <h2>{step.name}</h2>

      <div className="formula">
        📌 {step.formula}
      </div>

      <div className="matrix">
        {step.state.map((r, i) => (
          <div key={i} className="row">
            {r.map((v, j) => (
              <div key={j} className="cell">
                {v}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}