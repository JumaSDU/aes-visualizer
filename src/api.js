const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const FALLBACK = {
  user: { id: "u-1", name: "Алексей Иванов", role: "Студент", courseProgress: 72 },
  progress: { percent: 72, testsCompleted: 12, videosWatched: 4, videosTotal: 6, averageScore: 85 },
  topics: [
    { id: "crypto-basics", title: "Основы криптографии", description: "Симметричное и асимметричное шифрование, хеширование", icon: "shield" },
    { id: "aes-algorithm", title: "Алгоритм AES", description: "Детальное изучение работы и структуры AES", icon: "lock" },
    { id: "practice", title: "Практика", description: "Реальные примеры шифрования и расшифрования", icon: "code" },
    { id: "application", title: "Применение", description: "Использование AES в реальных проектах", icon: "zap" },
  ],
  recommendations: [
    { id: "rec-1", type: "video", title: "Режимы работы блочных шифров", description: "Изучите различные режимы работы AES: ECB, CBC, CTR, GCM", cta: "Смотреть урок" },
    { id: "rec-2", type: "test", title: "Проверка знаний AES", description: "Пройдите тест и закрепите полученные знания", cta: "Начать тест" },
    { id: "rec-3", type: "practice", title: "Генерация ключей", description: "Попробуйте создать криптостойкие ключи шифрования", cta: "Перейти к практике" },
  ],
  tip: { text: "AES-256 использует 14 раундов шифрования для максимальной защиты" },
};

async function get(path, fallback) {
  try {
    const r = await fetch(`${API_BASE}${path}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn(`API ${path} failed, using fallback:`, e.message);
    return fallback;
  }
}

export const api = {
  dashboard: () => get("/dashboard", FALLBACK),
  lessons: () => get("/lessons", []),
  tests: () => get("/tests", []),
  flashcards: () => get("/flashcards", []),
};
