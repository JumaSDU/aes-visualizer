import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function Flashcards() {
  const [items, setItems] = useState(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { api.flashcards().then(setItems); }, []);

  if (!items) return <div className="skeleton" style={{ height: 260, marginTop: 22 }} />;
  if (!items.length) return <p>Карточки пока не загружены.</p>;
  const card = items[i % items.length];

  return (
    <>
      <h1 className="page-title">Карточки</h1>
      <p className="page-subtitle">Кликните по карточке, чтобы перевернуть. {i + 1} / {items.length}</p>
      <div
        className="flashcard"
        style={{ marginTop: 22 }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div>
          {flipped ? <div className="a">{card.back}</div> : <div className="q">{card.front}</div>}
          <div className="hint">{flipped ? "Кликните, чтобы увидеть вопрос" : "Кликните, чтобы увидеть ответ"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
        <button className="btn-ghost" onClick={() => { setI((i - 1 + items.length) % items.length); setFlipped(false); }}>
          ← Назад
        </button>
        <button className="btn-primary" onClick={() => { setI((i + 1) % items.length); setFlipped(false); }}>
          Следующая →
        </button>
      </div>
    </>
  );
}
