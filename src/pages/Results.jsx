import React from "react";
import Icon from "../components/Icon";

export default function Results({ data }) {
  if (!data) return <div className="skeleton" style={{ height: 260, marginTop: 22 }} />;
  const { progress } = data;
  const stats = [
    { label: "Прогресс курса", value: `${progress.percent}%`, icon: "trophy" },
    { label: "Пройдено тестов", value: progress.testsCompleted, icon: "test" },
    { label: "Просмотрено видео", value: `${progress.videosWatched}/${progress.videosTotal}`, icon: "video" },
    { label: "Средний балл", value: `${progress.averageScore}%`, icon: "zap" },
  ];
  return (
    <>
      <h1 className="page-title">Мои результаты</h1>
      <p className="page-subtitle">Сводка вашей активности и достижений</p>
      <div className="grid-4" style={{ marginTop: 22 }}>
        {stats.map((s) => (
          <div key={s.label} className="topic">
            <div className="ico"><Icon name={s.icon} size={20} /></div>
            <div className="title">{s.value}</div>
            <div className="desc">{s.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
