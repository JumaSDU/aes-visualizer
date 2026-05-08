import React from "react";
import Icon from "./Icon";

const NAV = [
  { section: "Обзор", items: [{ id: "home", label: "Главная", icon: "home" }] },
  { section: "Обучение", items: [
    { id: "practice", label: "Практика AES", icon: "practice" },
    { id: "flashcards", label: "Карточки", icon: "cards" },
    { id: "videos", label: "Видео уроки", icon: "video" },
  ]},
  { section: "Проверка знаний", items: [{ id: "tests", label: "Тесты", icon: "test" }] },
  { section: "Статистика", items: [{ id: "results", label: "Мои результаты", icon: "trophy" }] },
];

export default function Sidebar({ user, route, setRoute, tip }) {
  const pct = user?.courseProgress ?? 0;
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="logo-dot">C</span>
        <span>CryptoLearn</span>
      </div>

      <div className="profile-card">
        <div className="profile-row">
          <div className="avatar"><Icon name="trophy" size={16} /></div>
          <div>
            <div className="profile-meta">{user?.role || "Студент"}</div>
            <div className="profile-name">{user?.name || "—"}</div>
          </div>
        </div>
        <div className="progress-block">
          <div className="label"><span>Прогресс курса</span><span className="pct">{pct}%</span></div>
          <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      {NAV.map((section) => (
        <div key={section.section}>
          <div className="nav-section">{section.section}</div>
          {section.items.map((item) => {
            const active = route === item.id;
            return (
              <div
                key={item.id}
                className={`nav-item${active ? " active" : ""}`}
                onClick={() => setRoute(item.id)}
              >
                <Icon name={item.icon} size={16} className="icon" />
                <span>{item.label}</span>
                {active && <Icon name="chev" size={14} style={{ marginLeft: "auto", opacity: 0.7 }} />}
              </div>
            );
          })}
        </div>
      ))}

      {tip && (
        <div className="tip-box">
          <div className="tip-title"><Icon name="code" size={12} /> Совет дня</div>
          {tip.text}
        </div>
      )}
    </aside>
  );
}
