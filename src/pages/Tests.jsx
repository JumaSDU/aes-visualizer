import React, { useEffect, useState } from "react";
import { api } from "../api";
import Icon from "../components/Icon";

export default function Tests() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.tests().then(setItems); }, []);
  return (
    <>
      <h1 className="page-title">Тесты</h1>
      <p className="page-subtitle">Проверьте свои знания по разделам курса</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 22 }}>
        {(items || Array.from({ length: 4 })).map((t, i) =>
          t ? (
            <div key={t.id} className="list-card">
              <div className="ico"><Icon name="test" size={18} /></div>
              <div className="body">
                <h4>{t.title}</h4>
                <p>{t.description}</p>
              </div>
              <div className="meta">{t.questions} вопросов</div>
              {t.lastScore != null ? (
                <div className="score" style={{ marginLeft: 12 }}>{t.lastScore}%</div>
              ) : (
                <button className="btn-ghost" style={{ marginLeft: 12 }}>Начать</button>
              )}
            </div>
          ) : (
            <div key={i} className="skeleton" style={{ height: 76 }} />
          )
        )}
      </div>
    </>
  );
}
