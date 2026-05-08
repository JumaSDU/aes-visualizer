import React, { useEffect, useState } from "react";
import { api } from "../api";
import Icon from "../components/Icon";

export default function Videos() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.lessons().then(setItems); }, []);
  return (
    <>
      <h1 className="page-title">Видео уроки</h1>
      <p className="page-subtitle">Видео-материалы по AES от основ до продвинутого</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
        {(items || Array.from({ length: 4 })).map((l, i) =>
          l ? (
            <div key={l.id} className="list-card">
              <div className="ico"><Icon name="video" size={18} /></div>
              <div className="body">
                <h4>{l.title}</h4>
                <p>{l.description}</p>
              </div>
              <div className="meta">{l.durationMinutes} мин</div>
              <button className="btn-ghost" style={{ marginLeft: 12 }}>
                {l.watched ? "Пересмотреть" : "Смотреть"}
              </button>
            </div>
          ) : (
            <div key={i} className="skeleton" style={{ height: 76 }} />
          )
        )}
      </div>
    </>
  );
}
