import React from "react";
import Icon from "../components/Icon";

const RECO_ICON = { video: "video", test: "test", practice: "zap" };
const RECO_LABEL = { video: "ВИДЕО УРОК", test: "ТЕСТ", practice: "ПРАКТИКА" };

export default function Dashboard({ data, setRoute }) {
  if (!data) return <Skeleton />;
  const { progress, topics, recommendations } = data;
  return (
    <>
      <h1 className="page-title">Добро пожаловать в CryptoLearn</h1>
      <p className="page-subtitle">Изучите AES шифрование от основ до продвинутого уровня</p>

      <div className="grid-2">
        <div className="hero">
          <div className="badge-icon"><Icon name="lock" size={22} /></div>
          <h2>Начните обучение</h2>
          <p>Познакомьтесь с основами криптографии и начните практиковаться с реальными алгоритмами шифрования</p>
          <button className="btn-primary" onClick={() => setRoute("practice")}>
            Перейти к практике <Icon name="chev" size={14} />
          </button>
        </div>

        <div className="card progress-card">
          <div className="head">
            <div className="ico"><Icon name="play" size={20} /></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Ваш прогресс</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{progress.percent}% завершено</div>
            </div>
          </div>
          <div className="row"><span className="key">Пройдено тестов</span><span className="val">{progress.testsCompleted}</span></div>
          <div className="row"><span className="key">Просмотрено видео</span><span className="val">{progress.videosWatched}/{progress.videosTotal}</span></div>
          <div className="row"><span className="key">Средний балл</span><span className="val">{progress.averageScore}%</span></div>
        </div>
      </div>

      <h2 className="section-title">Что вы изучите</h2>
      <div className="grid-4">
        {topics.map((t) => (
          <div key={t.id} className="topic">
            <div className="ico"><Icon name={t.icon} size={20} /></div>
            <div className="title">{t.title}</div>
            <div className="desc">{t.description}</div>
          </div>
        ))}
      </div>

      <h2 className="section-title">Рекомендации для вас</h2>
      <div className="grid-3">
        {recommendations.map((r) => (
          <div key={r.id} className="rec">
            <div className="tag">
              <span className="dot"><Icon name={RECO_ICON[r.type] || "play"} size={12} /></span>
              {RECO_LABEL[r.type] || r.type.toUpperCase()}
            </div>
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <button className="cta" onClick={() => routeFor(r.type, setRoute)}>{r.cta}</button>
          </div>
        ))}
      </div>
    </>
  );
}

function routeFor(type, setRoute) {
  if (type === "video") setRoute("videos");
  else if (type === "test") setRoute("tests");
  else setRoute("practice");
}

function Skeleton() {
  return (
    <>
      <div className="skeleton" style={{ width: 360, height: 32, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: 240, height: 16 }} />
      <div className="grid-2">
        <div className="skeleton" style={{ height: 230 }} />
        <div className="skeleton" style={{ height: 230 }} />
      </div>
    </>
  );
}
