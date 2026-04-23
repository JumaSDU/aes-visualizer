import React, { useState } from "react";

export default function InputForm({ onStart }) {
  const [text, setText] = useState("");

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text (16 chars recommended)"
        style={{ padding: 10, width: 300 }}
      />

      <button
        onClick={() => onStart(text)}
        style={{ marginLeft: 10, padding: 10 }}
      >
        Start AES
      </button>
    </div>
  );
}