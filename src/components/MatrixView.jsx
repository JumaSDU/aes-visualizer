import React from "react";

export default function MatrixView({ matrix }) {
  return (
    <div className="matrix">
      {matrix.map((row, i) => (
        <div key={i} className="row">
          {row.map((val, j) => (
            <div key={j} className="cell">
              {val}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}