import React, { useState } from "react";
import { encryptSteps, decryptSteps, SBOX, INV_SBOX } from "../logic/aesSteps";
import StepViewer, { getColor } from "../components/StepViewer";

function gmul(a, b) {
  let p = 0;
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a;
    const hi = a & 0x80;
    a = (a << 1) & 0xff;
    if (hi) a ^= 0x1b;
    b >>= 1;
  }
  return p;
}

function getDetail(name) {
  if (name === "Input")
    return {
      body: "AES — это блочный симметричный шифр. Он всегда работает с блоком данных ровно 16 байт (128 бит). Если ваше сообщение длиннее — оно делится на 16-байтные куски; если короче — дополняется нулями. Каждый блок превращается в матрицу 4×4, которую в стандарте называют «состоянием» (State). Заполнение происходит по столбцам: сначала записывается первый столбец (байты 0, 1, 2, 3), потом второй (4, 5, 6, 7) и так далее. Всё шифрование AES — это 10 последовательных преобразований именно этой матрицы. На этом шаге мы просто кладём данные в нужный формат.",
      facts: [
        "AES = Rijndael с размером блока 128 бит и ключом 128 бит",
        "Матрица State — единственная структура, с которой работает AES все 10 раундов",
        "Заполнение по столбцам: байты 0–3 → столбец 0, байты 4–7 → столбец 1 и т.д.",
        "Текст короче 16 символов дополняется нулями (0x00) справа",
        "На этом шаге шифрования нет — только укладка данных в матрицу 4×4",
      ],
    };
  if (name === "Cipher Input")
    return {
      body: "Шифртекст задаётся в шестнадцатеричном виде — каждые два символа (hex-пара) образуют один байт. Например, '2B' — это число 43 в десятичной системе. Всего нужно 32 hex-символа, что равно 16 байтам, то есть одному блоку AES. Эти 16 байтов укладываются в матрицу 4×4 точно так же, как при шифровании — по столбцам. Дальше AES делает то же самое, что при шифровании, но в обратном порядке: вместо SubBytes — InvSubBytes, вместо ShiftRows — InvShiftRows, и так далее. Раундовые ключи применяются от K₁₀ к K₀.",
      facts: [
        "Шифртекст: ровно 32 hex-символа = 16 байтов = 128 бит",
        "Каждая hex-пара — это один байт; '2B' = 0010 1011 в двоичной = 43 в десятичной",
        "Порядок раундовых ключей: K₁₀ → K₉ → … → K₀ (обратный относительно шифрования)",
        "Каждая обратная операция точно отменяет прямую — это гарантирует стандарт AES",
        "Результат расшифрования должен в точности совпасть с исходным открытым текстом",
      ],
    };
  if (name.startsWith("SubBytes"))
    return {
      body: "SubBytes заменяет каждый из 16 байтов матрицы по заранее составленной таблице подстановки — S-Box (Substitution Box). Таблица содержит 256 значений, по одному для каждого возможного байта от 0x00 до 0xFF. Работает это как обычная замена: берём байт, смотрим его позицию в таблице, берём соответствующее значение. Удобный способ запомнить: переводим байт в hex — первая цифра это номер строки в таблице, вторая цифра это номер столбца. Например, байт 0x53 → строка 5, столбец 3 → значение 0xED. Эта замена специально спроектирована так, чтобы между входным и выходным байтом не было никакой математической зависимости — это главная защита AES от взлома.",
      facts: [
        "S-Box — таблица 16×16",
        "Пример: байт 0x53 → строка 5, столбец 3 → S-Box[0x53] = 0xED",
        "Единственная нелинейная операция AES — защищает от линейного и дифференциального криптоанализа",
        "Все 256 возможных значений байта присутствуют в таблице ровно по одному разу",
        "16 замен происходят независимо и параллельно — байты не влияют друг на друга",
      ],
    };
  if (name.startsWith("InvSubBytes"))
    return {
      body: "InvSubBytes — это просто SubBytes наоборот. Для каждого байта используется обратная таблица InvS-Box: берём байт, смотрим в таблице, получаем исходное значение до SubBytes. Так же как и в SubBytes: переводим байт в hex, первая цифра — строка в таблице, вторая — столбец. Поскольку S-Box является взаимно-однозначным соответствием (каждое входное значение дало уникальное выходное), обратная таблица существует и однозначна для каждого из 256 байтов. Проверить легко: InvSBox[SBox[любой байт]] = тот же байт.",
      facts: [
        "InvS-Box — тоже таблица 16×16, построенная как обратная к S-Box",
        "Проверка: InvSBox[SBox[b]] = b для любого байта b от 0x00 до 0xFF",
        "Первая hex-цифра = строка в InvS-Box, вторая = столбец — та же логика, что у S-Box",
        "Обе таблицы вычислены заранее и зашиты в алгоритм — это просто поиск по массиву",
        "16 независимых замен, как и в SubBytes — никакого взаимодействия между байтами",
      ],
    };
  if (name.startsWith("ShiftRows"))
    return {
      body: "ShiftRows сдвигает три последние строки матрицы влево по кругу. Первая строка (строка 0) остаётся без изменений. Строка 1 сдвигается на 1 позицию влево — её первый байт уходит в конец. Строка 2 сдвигается на 2 позиции, строка 3 — на 3. Значения байтов при этом не меняются совсем — меняются только их позиции в матрице. Зачем это нужно: после SubBytes одинаковые байты в одном столбце могли бы идти в MixColumns вместе. ShiftRows перемешивает строки так, чтобы в следующем столбце MixColumns оказались байты из разных исходных столбцов — это распределяет изменения по всей матрице.",
      facts: [
        "Строка 0: без изменений | Строка 1: сдвиг влево на 1 | Строка 2: на 2 | Строка 3: на 3",
        "Только перестановка позиций — значения байтов не изменяются",
        "После сдвига каждый столбец содержит байты из 4 разных исходных столбцов",
        "В комбинации с MixColumns даёт полную диффузию: через 2 раунда каждый бит влияет на весь блок",
        "Простая операция — O(n) перестановок, никакой математики",
      ],
    };
  if (name.startsWith("InvShiftRows"))
    return {
      body: "InvShiftRows — это ShiftRows наоборот: три последние строки сдвигаются вправо по кругу. Строка 0 не меняется. Строка 1 сдвигается вправо на 1 — последний байт уходит в начало. Строка 2 — вправо на 2, строка 3 — на 3. Это точно возвращает каждый байт в ту позицию, которую он занимал до ShiftRows при шифровании. Никакой математики — только перестановка позиций. Интересный факт: сдвиг вправо на 1 = сдвиг влево на 3, на 2 = влево на 2, на 3 = влево на 1. То есть по сути это та же операция ShiftRows, но с другими числами сдвигов.",
      facts: [
        "Строка 0: без изменений | Строка 1: сдвиг вправо на 1 | Строка 2: на 2 | Строка 3: на 3",
        "Сдвиг вправо на r = сдвиг влево на (4 − r) позиции",
        "Значения байтов не меняются — только их позиции в матрице",
        "После InvShiftRows байты возвращаются в исходные столбцы",
        "Та же вычислительная стоимость, что и ShiftRows",
      ],
    };
  if (name.startsWith("InvMixColumns"))
    return {
      body: "InvMixColumns — обратная операция к MixColumns. Каждый столбец умножается на обратную матрицу [[14,11,13,9],[9,14,11,13],[13,9,14,11],[11,13,9,14]] в той же специальной арифметике GF(2⁸). Эта матрица специально подобрана так, что если сначала применить MixColumns, а потом InvMixColumns — получим исходный столбец обратно. Умножение на коэффициенты 9, 11, 13, 14 чуть сложнее, чем на 2 и 3 в прямой операции, но принцип тот же: каждое умножение — это комбинация сдвигов и XOR. Каждый выходной байт зависит от всех четырёх входных — это и нужно для расшифрования.",
      facts: [
        "Обратная матрица: [[14,11,13,9],[9,14,11,13],[13,9,14,11],[11,13,9,14]]",
        "9·b = (8·b) ⊕ b, где 8·b = b сдвинуть влево 3 раза с редукцией",
        "11·b = (8·b) ⊕ (2·b) ⊕ b, 13·b = (8·b) ⊕ (4·b) ⊕ b, 14·b = (8·b) ⊕ (4·b) ⊕ (2·b)",
        "InvMixColumns(MixColumns(столбец)) = исходный столбец — так работает обратная матрица",
        "Каждый из 4 выходных байтов зависит от всех 4 входных",
      ],
    };
  if (name.startsWith("MixColumns"))
    return {
      body: "MixColumns — самая математически сложная операция AES. Каждый столбец матрицы (4 байта) умножается на фиксированный полином a(x) = {03}x³ + {01}x² + {01}x + {02} в специальном поле чисел GF(2⁸). На практике это эквивалентно умножению столбца на матрицу [[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]]. Арифметика в GF(2⁸) необычная: сложение — это XOR (без переносов), а умножение на 2 — это сдвиг влево на один бит, и если старший бит до сдвига был равен 1, то результат ещё XOR-ится с числом 0x1B. Умножение на 3 = (умножение на 2) XOR исходное число. Главный эффект: каждый из 4 выходных байтов зависит от всех 4 входных — происходит полное перемешивание.",
      facts: [
        "Полином MixColumns: a(x) = {03}x³ + {01}x² + {01}x + {02}",
        "GF(2⁸): сложение = XOR; умножение на 2 = сдвиг влево + XOR с 0x1B если был старший бит",
        "×1 = без изменений, ×2 = xtime(b), ×3 = xtime(b) ⊕ b",
        "Один столбец (4 байта) → 4 новых байта, каждый зависит от всех четырёх входных",
        "В раунде 10 MixColumns не применяется — только SubBytes, ShiftRows, AddRoundKey",
      ],
    };
  if (name.startsWith("AddRoundKey"))
    return {
      body: "AddRoundKey — самая понятная операция: каждый байт матрицы состояния XOR-ится с соответствующим байтом раундового ключа. XOR (⊕) — это побитовое «исключающее или»: бит результата равен 1, если биты отличаются, и 0, если одинаковые. Главное свойство XOR: операция самообратна. Если A ⊕ K = B, то B ⊕ K = A. Именно поэтому при расшифровании не нужна «обратная» операция — применяем тот же XOR с тем же ключом. Всего используется 11 раундовых ключей (K₀–K₁₀). K₀ — это сам исходный ключ. Ключи K₁–K₁₀ генерирует алгоритм KeyExpansion: берёт последние 4 байта предыдущего ключа, сдвигает их, прогоняет через S-Box и XOR-ит с константой раунда (Rcon).",
      facts: [
        "XOR самообратна: A ⊕ K ⊕ K = A — одна и та же операция для шифрования и расшифрования",
        "Единственная операция AES, которая вносит ключ в данные",
        "Всего 11 ключей: K₀ применяется до раундов, K₁–K₁₀ — внутри каждого раунда",
        "KeyExpansion: последнее слово → RotWord (сдвиг) → SubWord (S-Box) → XOR Rcon → XOR с W[i-4]",
        "Rcon[1..10] = {01, 02, 04, 08, 10, 20, 40, 80, 1B, 36} — степени двойки в GF(2⁸)",
      ],
    };
  return { body: "", facts: [] };
}

/* ─────────────────────────────────────────────────────────────────
   Quiz pool — questions per operation type
───────────────────────────────────────────────────────────────── */
const QUIZ_POOL = {
  Input: [
    { q: "Сколько байтов помещается в одну матрицу State в AES?", opts: ["8 байтов", "16 байтов", "32 байта", "64 байта"], ans: 1, explain: "AES-128 всегда работает с блоками ровно 128 бит = 16 байтов. Матрица State имеет размер 4×4 = 16 ячеек." },
    { q: "В каком порядке байты открытого текста заполняют матрицу State?", opts: ["По строкам слева направо", "По диагонали", "По столбцам сверху вниз", "В обратном порядке"], ans: 2, explain: "Матрица заполняется по столбцам (column-major): байты 0–3 → столбец 0, 4–7 → столбец 1 и т.д." },
  ],
  "Cipher Input": [
    { q: "Сколько hex-символов нужно ввести для расшифрования одного блока AES?", opts: ["16", "24", "32", "48"], ans: 2, explain: "32 hex-символа = 16 байтов = 128 бит — ровно один блок AES-128." },
    { q: "В каком порядке применяются раундовые ключи при расшифровании?", opts: ["K₀ → K₁ → … → K₁₀", "K₁₀ → K₉ → … → K₀", "В случайном порядке", "Только K₀ и K₁₀"], ans: 1, explain: "При расшифровании ключи применяются в обратном порядке относительно шифрования: K₁₀ первым, K₀ последним." },
  ],
  SubBytes: [
    { q: "Байт равен 0x9A. Какую строку таблицы S-Box мы используем?", opts: ["Строку 0", "Строку 9", "Строку A (10)", "Строку F (15)"], ans: 1, explain: "Первая hex-цифра 0x9A — это 9. Значит, смотрим строку 9 таблицы S-Box, столбец A." },
    { q: "Почему SubBytes — единственная нелинейная операция AES?", opts: ["Она работает с ключом напрямую", "Она перемешивает строки матрицы", "Выход не является линейной функцией входа — S-Box специально спроектирован так", "Она использует XOR с константой"], ans: 2, explain: "S-Box построен на мультипликативном обратном в GF(2⁸) + аффинном преобразовании. Именно нелинейность защищает AES от алгебраических атак." },
    { q: "Что произойдёт с байтом 0x00 после применения S-Box?", opts: ["Останется 0x00", "Станет 0xFF", "Станет 0x63", "Станет 0x01"], ans: 2, explain: "S-Box[0x00] = 0x63 — это одно из фиксированных значений стандарта. Нуль не отображается сам в себя специально, чтобы исключить слабости." },
  ],
  InvSubBytes: [
    { q: "Чему равно InvSBox[SBox[0x53]]?", opts: ["0x00", "0x53", "0xED", "0xFF"], ans: 1, explain: "InvSBox — обратная таблица. InvSBox[SBox[b]] = b для любого байта b, значит InvSBox[SBox[0x53]] = 0x53." },
    { q: "Сколько различных значений содержит таблица InvS-Box?", opts: ["128", "256", "512", "1024"], ans: 1, explain: "InvS-Box — таблица 256 значений, по одному для каждого из 256 возможных байтов (0x00–0xFF)." },
  ],
  ShiftRows: [
    { q: "На сколько позиций влево сдвигается строка 3 при ShiftRows?", opts: ["0 позиций", "1 позицию", "2 позиции", "3 позиции"], ans: 3, explain: "Строка 0: без сдвига, строка 1: 1 позиция, строка 2: 2 позиции, строка 3: 3 позиции влево." },
    { q: "Что происходит со значениями байтов при ShiftRows?", opts: ["Заменяются через S-Box", "Умножаются на матрицу", "XOR-ятся с ключом", "Значения не меняются — только позиции"], ans: 3, explain: "ShiftRows — чистая перестановка. Значения байтов остаются прежними, меняются только их позиции в матрице." },
  ],
  InvShiftRows: [
    { q: "В каком направлении сдвигаются строки при InvShiftRows?", opts: ["Влево, как в ShiftRows", "Вправо — обратно к ShiftRows", "Вверх по столбцу", "Строки не сдвигаются"], ans: 1, explain: "InvShiftRows сдвигает строки вправо — это точная обратная операция к сдвигу влево в ShiftRows." },
    { q: "Сдвиг вправо на 1 равен сдвигу влево на сколько позиций (при длине строки 4)?", opts: ["1", "2", "3", "4"], ans: 2, explain: "Сдвиг вправо на r = сдвиг влево на (4 − r). Вправо на 1 = влево на 3 позиции." },
  ],
  MixColumns: [
    { q: "Чему равно умножение байта на 2 в поле GF(2⁸)?", opts: ["Обычное умножение: b × 2", "Деление пополам", "Сдвиг влево на 1, при старшем бите = 1 — XOR с 0x1B", "XOR с раундовым ключом"], ans: 2, explain: "×2 в GF(2⁸) = сдвиг влево на 1 бит. Если старший бит был 1, нужна редукция: XOR с 0x1B (неприводимый полином AES)." },
    { q: "Сколько входных байтов влияет на каждый выходной байт после MixColumns?", opts: ["1 (только соответствующий)", "2 (два соседних)", "4 (весь столбец)", "16 (весь блок)"], ans: 2, explain: "MixColumns обрабатывает каждый столбец. Каждый из 4 выходных байтов зависит от всех 4 входных — это максимальная диффузия внутри столбца." },
    { q: "Чему равно ×3 в поле GF(2⁸)?", opts: ["b + b + b (обычная арифметика)", "(×2) ⊕ исходный байт", "(×2) ⊕ 0x1B", "Сдвиг влево на 3"], ans: 1, explain: "×3 в GF(2⁸) = (×2) ⊕ b: умножаем байт на 2 (со сдвигом и редукцией), затем XOR с исходным байтом." },
  ],
  InvMixColumns: [
    { q: "Что верно про InvMixColumns(MixColumns(столбец))?", opts: ["Результат равен 0", "Результат равен исходному столбцу", "Столбец удваивается", "Операция невозможна"], ans: 1, explain: "InvMixColumns применяет обратную матрицу, поэтому InvMixColumns(MixColumns(x)) = x — столбец возвращается к исходному виду." },
    { q: "Какой из коэффициентов НЕ встречается в матрице InvMixColumns?", opts: ["9", "11", "3", "14"], ans: 2, explain: "Матрица InvMixColumns содержит коэффициенты {9, 11, 13, 14}. Число 3 — это коэффициент прямой матрицы MixColumns, а не обратной." },
  ],
  AddRoundKey: [
    { q: "Какая операция выполняется в AddRoundKey?", opts: ["Сложение по модулю 256", "Умножение в GF(2⁸)", "Побитовое XOR (⊕)", "Замена через S-Box"], ans: 2, explain: "AddRoundKey применяет побитовое XOR между каждым байтом состояния и соответствующим байтом раундового ключа." },
    { q: "Если A ⊕ K = B, то чему равно B ⊕ K?", opts: ["0", "A", "K", "A ⊕ B ⊕ K"], ans: 1, explain: "XOR самообратна: B ⊕ K = (A ⊕ K) ⊕ K = A. Именно поэтому расшифрование использует ту же операцию с тем же ключом." },
    { q: "Сколько всего раундовых ключей использует AES-128?", opts: ["5 ключей", "10 ключей", "11 ключей", "16 ключей"], ans: 2, explain: "AES-128 использует 11 ключей: K₀ применяется до раундов, K₁–K₁₀ — по одному на каждый из 10 раундов." },
    { q: "Из чего генерируется K₁ в ходе Key Schedule?", opts: ["Из самого ключа K₀", "Из шифртекста", "Из S-Box[0x00]", "Из случайных чисел"], ans: 0, explain: "K₁ генерируется из K₀ через операции RotWord (сдвиг слова) + SubWord (S-Box к байтам слова) + XOR с константой Rcon[1]." },
  ],
};

function getQuizForStep(stepName, stepIdx) {
  const key = Object.keys(QUIZ_POOL).find(k => stepName === k || stepName.startsWith(k + " ") || stepName.startsWith(k + "(") || (k !== "Input" && stepName.startsWith(k)));
  if (!key) return null;
  const pool = QUIZ_POOL[key];
  return pool[stepIdx % pool.length];
}

/* ─────────────────────────────────────────────────────────────────
   Quiz modal
───────────────────────────────────────────────────────────────── */
function Quiz({ question, stepColor, onCorrect }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = submitted && selected === question.ans;
  const isWrong = submitted && selected !== question.ans;

  const optBg = (idx) => {
    if (!submitted) return selected === idx ? `${stepColor}15` : "rgba(255,255,255,0.03)";
    if (idx === question.ans) return "rgba(16,185,129,0.15)";
    if (selected === idx) return "rgba(248,113,113,0.12)";
    return "rgba(255,255,255,0.03)";
  };
  const optBorder = (idx) => {
    if (!submitted) return selected === idx ? `${stepColor}55` : "rgba(255,255,255,0.09)";
    if (idx === question.ans) return "#10b98155";
    if (selected === idx) return "#f8717155";
    return "rgba(255,255,255,0.07)";
  };
  const optColor = (idx) => {
    if (!submitted) return selected === idx ? stepColor : "rgba(226,232,240,0.65)";
    if (idx === question.ans) return "#10b981";
    if (selected === idx) return "#f87171";
    return "rgba(226,232,240,0.35)";
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#0d1526", border: `1px solid ${stepColor}35`, borderTop: `3px solid ${stepColor}`, borderRadius: 16, padding: "28px 32px", maxWidth: 500, width: "92%", boxShadow: `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${stepColor}15` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: stepColor, flexShrink: 0 }} />
          <span style={{ fontFamily: "monospace", fontSize: 10, color: stepColor, letterSpacing: 1.8, textTransform: "uppercase", fontWeight: 700 }}>
            Проверка знаний
          </span>
        </div>
        <p style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(226,232,240,0.88)", lineHeight: 1.75, marginBottom: 20 }}>
          {question.q}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {question.opts.map((opt, idx) => (
            <button key={idx} onClick={() => !submitted && setSelected(idx)} disabled={submitted} style={{ padding: "11px 16px", borderRadius: 9, background: optBg(idx), border: `1px solid ${optBorder(idx)}`, color: optColor(idx), fontFamily: "monospace", fontSize: 13, textAlign: "left", cursor: submitted ? "default" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid currentColor`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, opacity: 0.85 }}>
                {String.fromCharCode(65 + idx)}
              </span>
              {opt}
            </button>
          ))}
        </div>

        {!submitted && (
          <button onClick={() => selected !== null && setSubmitted(true)} disabled={selected === null} style={{ width: "100%", padding: "13px", borderRadius: 9, background: selected !== null ? stepColor : "rgba(255,255,255,0.05)", border: "none", color: selected !== null ? "#fff" : "rgba(226,232,240,0.25)", fontFamily: "monospace", fontSize: 13, fontWeight: 700, cursor: selected !== null ? "pointer" : "default", letterSpacing: 1, transition: "all 0.2s" }}>
            Ответить
          </button>
        )}
        {isCorrect && (
          <div>
            <div style={{ padding: "12px 16px", background: "rgba(16,185,129,0.1)", border: "1px solid #10b98130", borderRadius: 9, marginBottom: 12 }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#10b981", marginBottom: 5, fontWeight: 700 }}>✓ Правильно!</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(226,232,240,0.6)", lineHeight: 1.7 }}>{question.explain}</div>
            </div>
            <button onClick={onCorrect} style={{ width: "100%", padding: "13px", borderRadius: 9, background: stepColor, border: "none", color: "#fff", fontFamily: "monospace", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>
              Продолжить →
            </button>
          </div>
        )}
        {isWrong && (
          <div>
            <div style={{ padding: "12px 16px", background: "rgba(248,113,113,0.08)", border: "1px solid #f8717130", borderRadius: 9, marginBottom: 12 }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#f87171", fontWeight: 700 }}>✗ Неверно — попробуй ещё раз</div>
            </div>
            <button onClick={() => { setSelected(null); setSubmitted(false); }} style={{ width: "100%", padding: "13px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(226,232,240,0.75)", fontFamily: "monospace", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Попробовать снова
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Practice() {
  const [text, setText] = useState("HELLO AES!");
  const [key, setKey] = useState("MySecretKey12345");
  const [steps, setSteps] = useState([]);
  const [i, setI] = useState(0);
  const [result, setResult] = useState("");
  const [finished, setFinished] = useState(false);
  const [mode, setMode] = useState("enc");
  const [copied, setCopied] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [passedQuizzes, setPassedQuizzes] = useState(new Set());

  const run = (fn, m) => {
    const res = fn(text, key);
    setSteps(res.steps);
    setResult(res.result);
    setI(0);
    setFinished(false);
    setMode(m);
    setQuizActive(false);
    setPassedQuizzes(new Set());
  };

  const isLast = i === steps.length - 1;
  const isDec = mode === "dec";
  const accent = isDec ? "#a78bfa" : "var(--accent)";

  // Show quiz every 3rd step (at indices 2, 5, 8, 11, …)
  const needsQuiz = (stepIdx) =>
    stepIdx > 0 && stepIdx % 3 === 2 && !passedQuizzes.has(stepIdx);

  const handleNext = () => {
    if (!isLast && needsQuiz(i)) {
      const q = getQuizForStep(steps[i].name, i);
      if (q) {
        setQuizActive(true);
      } else {
        setPassedQuizzes((prev) => new Set([...prev, i]));
        setI((v) => Math.min(steps.length - 1, v + 1));
      }
    } else {
      setI((v) => Math.min(steps.length - 1, v + 1));
    }
  };

  const handleQuizCorrect = () => {
    setPassedQuizzes((prev) => new Set([...prev, i]));
    setQuizActive(false);
    setI((v) => Math.min(steps.length - 1, v + 1));
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const currentStep = steps[i];
  const color = currentStep ? getColor(currentStep.name) : accent;
  const detail = currentStep ? getDetail(currentStep.name) : null;

  return (
    <>
      <h1 className="page-title">Практика AES</h1>
      <p className="page-subtitle">Пошаговая визуализация шифрования и расшифрования</p>

      <div style={{ display: "flex", gap: 20, marginTop: 22, alignItems: "flex-start" }}>

        {/* ── Left card: controls + matrix ── */}
        <div className="card" style={{ width: 420, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["enc", "dec"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setSteps([]); setI(0); setResult(""); setFinished(false); }}
                style={{
                  flex: 1, padding: "10px", borderRadius: 8,
                  border: `1px solid ${mode === m ? (m === "enc" ? "var(--accent)" : "#a78bfa") : "var(--border)"}`,
                  background: mode === m ? (m === "enc" ? "var(--accent-dim)" : "rgba(167,139,250,0.1)") : "transparent",
                  color: mode === m ? (m === "enc" ? "var(--accent)" : "#a78bfa") : "var(--text-muted)",
                  fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                  cursor: "pointer", fontSize: 12,
                }}
              >
                {m === "enc" ? "Шифрование" : "Расшифрование"}
              </button>
            ))}
          </div>

          <Field
            label={isDec ? "Шифртекст (hex)" : "Открытый текст (макс. 16 символов)"}
            value={text}
            onChange={setText}
            placeholder={isDec ? "Вставьте hex..." : "Введите текст..."}
            maxLength={isDec ? 64 : 16}
          />
          <Field
            label={`Ключ (${key.length}/16)`}
            value={key}
            onChange={setKey}
            placeholder="16 символов..."
            maxLength={16}
          />

          <button
            onClick={() => run(mode === "enc" ? encryptSteps : decryptSteps, mode)}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 6 }}
          >
            {isDec ? "Запустить расшифрование" : "Запустить шифрование"}
          </button>

          {steps.length > 0 && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 18 }}>
                {steps.map((_, idx) => {
                  const isQuizDot = idx > 0 && idx % 3 === 2;
                  const passed = passedQuizzes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => setI(idx)}
                      style={{
                        width: isQuizDot ? 11 : 9,
                        height: isQuizDot ? 11 : 9,
                        borderRadius: isQuizDot ? 3 : "50%",
                        cursor: "pointer", transition: "all 0.2s",
                        background: idx === i ? accent : passed ? `${accent}70` : idx < i ? `${accent}40` : "transparent",
                        border: `1px solid ${idx <= i || passed ? accent : "var(--border)"}`,
                      }}
                      title={steps[idx].name + (isQuizDot ? " 📝" : "")}
                    />
                  );
                })}
              </div>

              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 8 }}>
                Шаг {i + 1} / {steps.length} — {steps[i].name}
              </div>

              <StepViewer step={steps[i]} />

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => setI((v) => Math.max(0, v - 1))}
                  disabled={i === 0}
                  className="btn-ghost"
                  style={{ flex: 1, opacity: i === 0 ? 0.3 : 1 }}
                >
                  ‹ Назад
                </button>
                {!isLast && (
                  <button onClick={handleNext} className="btn-primary" style={{ flex: 1, justifyContent: "center", gap: 6 }}>
                    {needsQuiz(i) ? "Тест ›" : "Далее ›"}
                    {needsQuiz(i) && <span style={{ fontSize: 11, opacity: 0.8 }}>📝</span>}
                  </button>
                )}
                {isLast && !finished && (
                  <button onClick={() => setFinished(true)} className="btn-primary" style={{ flex: 1, justifyContent: "center" }}>
                    Завершить ✓
                  </button>
                )}
              </div>

              {finished && result && (
                <div style={{
                  border: `1px solid ${accent}`, borderRadius: 10,
                  background: `${isDec ? "rgba(167,139,250,0.08)" : "var(--accent-dim)"}`,
                  padding: 16, marginTop: 14,
                }}>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 8 }}>
                    {isDec ? "ОТКРЫТЫЙ ТЕКСТ" : "ШИФРТЕКСТ"}
                  </div>
                  <div
                    onClick={copyResult}
                    style={{
                      fontFamily: "monospace", fontSize: 13, color: accent,
                      wordBreak: "break-all", letterSpacing: 1, cursor: "pointer",
                      padding: 10, background: "rgba(0,0,0,0.3)", borderRadius: 6,
                    }}
                  >
                    {result}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 6 }}>
                    {copied ? "✓ Скопировано" : "Клик — скопировать"}
                  </div>
                  {!isDec && (
                    <button
                      onClick={() => { setMode("dec"); setText(result); }}
                      className="btn-ghost"
                      style={{ marginTop: 10, fontSize: 11 }}
                    >
                      Использовать для расшифрования →
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right card: step explanation ── */}
        {steps.length > 0 && detail && (
          <div style={{
            flex: 1,
            background: "#0f1a2e",
            border: `1px solid ${color}30`,
            borderLeft: `3px solid ${color}`,
            borderRadius: 12,
            padding: "22px 24px",
            position: "sticky",
            top: 24,
            overflowY: "auto",
            maxHeight: "calc(100vh - 48px)",
          }}>
            {/* Formula badge */}
            <div style={{
              display: "inline-flex", alignItems: "center",
              fontFamily: "monospace", fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 12,
              background: `${color}18`, color, border: `1px solid ${color}35`,
              textTransform: "uppercase", letterSpacing: 1, marginBottom: 14,
            }}>
              {currentStep.formula}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, color, marginBottom: 6, letterSpacing: 0.3 }}>
              {currentStep.name}
            </h2>

            <div style={{ height: 1, background: `${color}20`, margin: "16px 0" }} />

            <p style={{
              fontFamily: "monospace", fontSize: 13,
              color: "rgba(226,232,240,0.82)",
              lineHeight: 2, marginBottom: 24,
            }}>
              {detail.body}
            </p>

            {detail.facts.length > 0 && (
              <>
                <div style={{
                  fontSize: 10, fontFamily: "monospace", fontWeight: 700,
                  letterSpacing: 1.8, color, textTransform: "uppercase", marginBottom: 12,
                }}>
                  Ключевые факты
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {detail.facts.map((f, idx) => (
                    <li key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{
                        flexShrink: 0, marginTop: 5,
                        width: 6, height: 6, borderRadius: "50%",
                        background: color, display: "inline-block",
                      }} />
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(226,232,240,0.65)", lineHeight: 1.7 }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <CalcBlock step={currentStep} color={color} />

            {/* Round indicator */}
            <div style={{
              marginTop: 28, padding: "10px 14px",
              background: "rgba(0,0,0,0.25)", borderRadius: 8,
              border: `1px solid ${color}15`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: 1 }}>ШАГ</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color, fontWeight: 700 }}>{i + 1} / {steps.length}</span>
            </div>
          </div>
        )}
      </div>

      {quizActive && currentStep && getQuizForStep(currentStep.name, i) && (
        <Quiz
          question={getQuizForStep(currentStep.name, i)}
          stepColor={color}
          onCorrect={handleQuizCorrect}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Interactive widgets
───────────────────────────────────────────────────────────────── */
function SBoxTester({ color, isInv }) {
  const [val, setVal] = useState("00");
  const numVal = Math.min(255, parseInt(val || "0", 16) || 0);
  const outVal = isInv ? INV_SBOX[numVal] : SBOX[numVal];
  const hh = n => n.toString(16).padStart(2, "0").toUpperCase();
  const bin8 = n => n.toString(2).padStart(8, "0");
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: `1px solid ${color}30` }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
        Интерактив: проверь {isInv ? "InvS-Box" : "S-Box"}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>ВХОДНОЙ БАЙТ (HEX)</div>
          <input
            value={val}
            onChange={e => setVal(e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 2))}
            placeholder="00"
            style={{ width: 64, padding: "8px 10px", background: "rgba(0,0,0,0.5)", border: `1px solid ${color}50`, borderRadius: 7, color, fontFamily: "monospace", fontSize: 16, textAlign: "center", outline: "none" }}
          />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 22, color: "rgba(226,232,240,0.2)", paddingBottom: 8 }}>→</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>{isInv ? "INVSBOX" : "SBOX"}[{hh(numVal)}]</div>
          <div style={{ padding: "8px 16px", background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 7, fontFamily: "monospace", fontSize: 16, color, fontWeight: 700, minWidth: 64, textAlign: "center" }}>
            {hh(outVal)}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "5px 10px", fontFamily: "monospace", fontSize: 11 }}>
        <span style={{ color: "rgba(226,232,240,0.35)" }}>Вход:</span>
        <span style={{ color: "rgba(226,232,240,0.5)", letterSpacing: 3 }}>{bin8(numVal)}</span>
        <span style={{ color }}>Выход:</span>
        <span style={{ color, letterSpacing: 3, fontWeight: 700 }}>{bin8(outVal)}</span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(226,232,240,0.25)", marginTop: 8 }}>
        Попробуй: 00→63, 53→ED, AE→E4, FF→16
      </div>
    </div>
  );
}

function XorCalc({ color }) {
  const [a, setA] = useState("2B");
  const [b, setB] = useState("28");
  const av = parseInt(a || "0", 16) & 0xFF;
  const bv = parseInt(b || "0", 16) & 0xFF;
  const rv = av ^ bv;
  const hh = n => n.toString(16).padStart(2, "0").toUpperCase();
  const bin8 = n => n.toString(2).padStart(8, "0");
  const ba = bin8(av), bb = bin8(bv), br = bin8(rv);
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: `1px solid ${color}30` }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
        Интерактив: XOR калькулятор
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>БАЙТ A (HEX)</div>
          <input value={a} onChange={e => setA(e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 2))} placeholder="2B" style={{ width: 64, padding: "8px 10px", background: "rgba(0,0,0,0.5)", border: `1px solid ${color}50`, borderRadius: 7, color, fontFamily: "monospace", fontSize: 16, textAlign: "center", outline: "none" }} />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: "rgba(226,232,240,0.3)", paddingBottom: 10 }}>⊕</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>БАЙТ B (HEX)</div>
          <input value={b} onChange={e => setB(e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 2))} placeholder="28" style={{ width: 64, padding: "8px 10px", background: "rgba(0,0,0,0.5)", border: `1px solid #a78bfa50`, borderRadius: 7, color: "#a78bfa", fontFamily: "monospace", fontSize: 16, textAlign: "center", outline: "none" }} />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: "rgba(226,232,240,0.3)", paddingBottom: 10 }}>=</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>РЕЗУЛЬТАТ</div>
          <div style={{ padding: "8px 16px", background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 7, fontFamily: "monospace", fontSize: 16, color, fontWeight: 700, minWidth: 64, textAlign: "center" }}>{hh(rv)}</div>
        </div>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 12 }}>
        {[["A:", ba, color], ["B:", bb, "#a78bfa"], [null, null, null], ["A⊕B:", br, color]].map(([label, bits, c], li) => {
          if (!label) return <div key="hr" style={{ height: 1, background: `${color}25`, margin: "4px 0 4px 52px" }} />;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ width: 44, color: c, flexShrink: 0 }}>{label}</span>
              <div style={{ display: "flex" }}>
                {bits.split("").map((bit, i) => (
                  <span key={i} style={{
                    width: 14, textAlign: "center",
                    color: li === 3 ? (ba[i] !== bb[i] ? color : "rgba(226,232,240,0.25)") : c,
                    fontWeight: li === 3 && ba[i] !== bb[i] ? 700 : 400,
                    ...(i === 3 ? { marginRight: 6 } : {}),
                  }}>{bit}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(226,232,240,0.25)", marginTop: 8 }}>
        Жирные биты результата — те, где A и B различаются
      </div>
    </div>
  );
}

function GfCalc({ color }) {
  const [val, setVal] = useState("57");
  const [mult, setMult] = useState("2");
  const v = parseInt(val || "0", 16) & 0xFF;
  const m = parseInt(mult) || 1;
  const result = gmul(v, m);
  const hh = n => n.toString(16).padStart(2, "0").toUpperCase();
  return (
    <div style={{ marginTop: 16, padding: "14px 16px", background: "rgba(0,0,0,0.3)", borderRadius: 10, border: `1px solid ${color}30` }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
        Интерактив: умножение в GF(2⁸)
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>БАЙТ (HEX)</div>
          <input value={val} onChange={e => setVal(e.target.value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 2))} style={{ width: 64, padding: "8px 10px", background: "rgba(0,0,0,0.5)", border: `1px solid ${color}50`, borderRadius: 7, color, fontFamily: "monospace", fontSize: 16, textAlign: "center", outline: "none" }} />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: "rgba(226,232,240,0.3)", paddingBottom: 10 }}>×</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>МНОЖИТЕЛЬ</div>
          <select value={mult} onChange={e => setMult(e.target.value)} style={{ padding: "8px 10px", background: "#0f1a2e", border: `1px solid ${color}50`, borderRadius: 7, color, fontFamily: "monospace", fontSize: 16, outline: "none" }}>
            {[1,2,3,9,11,13,14].map(n => <option key={n} value={n} style={{ background: "#0f1a2e" }}>{n}</option>)}
          </select>
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 20, color: "rgba(226,232,240,0.3)", paddingBottom: 10 }}>=</div>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(226,232,240,0.4)", marginBottom: 5, letterSpacing: 1 }}>РЕЗУЛЬТАТ</div>
          <div style={{ padding: "8px 16px", background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 7, fontFamily: "monospace", fontSize: 16, color, fontWeight: 700, minWidth: 64, textAlign: "center" }}>{hh(result)}</div>
        </div>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(226,232,240,0.4)" }}>
        0x{hh(v)} × {m} = 0x{hh(result)} в GF(2⁸) mod (x⁸+x⁴+x³+x+1)
      </div>
      {m === 2 && (
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(226,232,240,0.3)", marginTop: 5 }}>
          ×2 = сдвиг влево на 1{v & 0x80 ? `, XOR 0x1B (редукция — старший бит был 1)` : ` (старший бит = 0, редукция не нужна)`}
        </div>
      )}
      {m === 3 && (
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(226,232,240,0.3)", marginTop: 5 }}>
          ×3 = (×2) ⊕ исходный: {hh(gmul(v,2))} ⊕ {hh(v)} = {hh(result)}
        </div>
      )}
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(226,232,240,0.22)", marginTop: 5 }}>
        Попробуй: 57×2=AE, 57×3=F9, 57×9=FE, 57×11=58
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CalcBlock — step-specific byte-level calculations
───────────────────────────────────────────────────────────────── */
function CalcBlock({ step, color }) {
  if (!step || !step.state || !step.state.length) return null;

  const { state, prev, name } = step;
  const isInputStep = name === "Input" || name === "Cipher Input";
  if (!isInputStep && (!prev || !prev.length)) return null;

  const hx  = hex => parseInt(hex, 16);
  const hh  = n   => n.toString(16).padStart(2, "0").toUpperCase();
  const bin = n   => n.toString(2).padStart(8, "0").replace(/(.{4})/g, "$1 ").trim();

  const mono = { fontFamily: "monospace", fontSize: 11, lineHeight: 1.8 };
  const dim  = { ...mono, color: "rgba(226,232,240,0.45)" };
  const mut  = { ...mono, color: "#475569" };
  const acc  = { ...mono, color };

  const chip = (c, text) => (
    <span style={{
      ...mono, padding: "1px 7px", borderRadius: 4,
      background: `${c}15`, border: `1px solid ${c}35`, color: c,
    }}>{text}</span>
  );

  // Original byte index i → snap-array index (column-major fill → row-major display)
  const toSnapIdx = i => (i % 4) * 4 + Math.floor(i / 4);

  let content = null;

  /* ── INPUT ──────────────────────────────────────────────────── */
  if (name === "Input") {
    const origBytes = Array.from({ length: 16 }, (_, i) => state[toSnapIdx(i)]);
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 10, lineHeight: 1.9 }}>
          Каждый символ преобразуется в его ASCII-код, затем в шестнадцатеричное число.
          Байты укладываются в матрицу <b style={{ color: "rgba(226,232,240,0.7)" }}>по столбцам</b> — сначала заполняется столбец 0 (байты 0–3), затем столбец 1 (байты 4–7) и т.д.:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "24px 44px 40px 44px 108px", gap: "6px 10px", alignItems: "center" }}>
          {["#", "СИМВОЛ", "HEX", "DEC", "ПОЗИЦИЯ В МАТРИЦЕ"].map(h => (
            <span key={h} style={{ ...mut, fontSize: 9, letterSpacing: 1 }}>{h}</span>
          ))}
          {origBytes.map((hexVal, i) => {
            const dec = hx(hexVal);
            const char = dec >= 32 && dec <= 126 ? String.fromCharCode(dec) : "·";
            const col = Math.floor(i / 4);
            const row = i % 4;
            return (
              <React.Fragment key={i}>
                <span style={dim}>{i}</span>
                {chip(color, char === " " ? "' '" : char)}
                <span style={{ ...mono, color }}>{hexVal}</span>
                <span style={dim}>{dec}</span>
                <span style={mut}>[стр.{row}, ст.{col}]</span>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ ...mut, marginTop: 12, lineHeight: 1.9 }}>
          Итог: 16 байтов размещены в матрице 4×4. Именно эту матрицу AES будет преобразовывать на протяжении 10 раундов.
        </div>
      </div>
    );

  /* ── CIPHER INPUT ───────────────────────────────────────────── */
  } else if (name === "Cipher Input") {
    const origBytes = Array.from({ length: 16 }, (_, i) => state[toSnapIdx(i)]);
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 10, lineHeight: 1.9 }}>
          Каждая пара hex-символов — это один байт (0x00–0xFF = 0–255 в десятичной).
          Байты загружаются в матрицу <b style={{ color: "rgba(226,232,240,0.7)" }}>по столбцам</b>:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "24px 40px 52px 44px 108px", gap: "6px 10px", alignItems: "center" }}>
          {["#", "HEX", "ДВОИЧНОЕ", "DEC", "ПОЗИЦИЯ"].map(h => (
            <span key={h} style={{ ...mut, fontSize: 9, letterSpacing: 1 }}>{h}</span>
          ))}
          {origBytes.map((hexVal, i) => {
            const dec = hx(hexVal);
            const col = Math.floor(i / 4);
            const row = i % 4;
            return (
              <React.Fragment key={i}>
                <span style={dim}>{i}</span>
                <span style={{ ...mono, color }}>{hexVal}</span>
                <span style={{ ...mono, color: "rgba(226,232,240,0.4)", fontSize: 10 }}>{bin(dec)}</span>
                <span style={dim}>{dec}</span>
                <span style={mut}>[стр.{row}, ст.{col}]</span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );

  /* ── SUB BYTES / INV SUB BYTES ──────────────────────────────── */
  } else if (name.startsWith("SubBytes") || name.startsWith("InvSubBytes")) {
    const isInv = name.startsWith("Inv");
    const ex = prev[0];
    const exOut = state[0];
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 10, lineHeight: 1.9 }}>
          {isInv
            ? "Каждый байт подаётся на вход таблице InvS-Box (256 строк). Номер строки = входной байт, значение в строке = выходной байт:"
            : "Каждый байт подаётся на вход таблице S-Box (256 строк). Номер строки = входной байт, значение в строке = выходной байт:"}
        </div>

        <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.25)", borderRadius: 8, border: `1px solid ${color}15`, marginBottom: 12 }}>
          <div style={{ ...mut, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>РАЗБОР ПЕРВОГО БАЙТА</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ ...mut, width: 110, flexShrink: 0 }}>Входной байт:</span>
              {chip(color, ex)} <span style={dim}>= {hx(ex)} дес. = {bin(hx(ex))} бин.</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ ...mut, width: 110, flexShrink: 0 }}>Поиск в таблице:</span>
              <span style={dim}>{isInv ? "InvS-Box" : "S-Box"}[{ex}] →</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ ...mut, width: 110, flexShrink: 0 }}>Выходной байт:</span>
              {chip(color, exOut)} <span style={dim}>= {hx(exOut)} дес. = {bin(hx(exOut))} бин.</span>
            </div>
            <div style={{ ...mut, marginTop: 4, lineHeight: 1.9 }}>
              Входное и выходное значения никак не связаны арифметически — только через фиксированную таблицу. Именно это создаёт <b style={{ color: "rgba(226,232,240,0.6)" }}>нелинейность</b> AES.
            </div>
          </div>
        </div>

        <div style={{ ...mut, marginBottom: 8 }}>Все 16 байтов (вход → выход):</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "5px 12px" }}>
          {prev.map((p, idx) => (
            <div key={idx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={dim}>{p}</span>
              <span style={mut}>→</span>
              <span style={{ ...mono, color: p !== state[idx] ? color : "rgba(226,232,240,0.45)" }}>{state[idx]}</span>
            </div>
          ))}
        </div>
        <SBoxTester color={color} isInv={isInv} />
      </div>
    );

  /* ── SHIFT ROWS / INV SHIFT ROWS ────────────────────────────── */
  } else if (name.startsWith("ShiftRows") || name.startsWith("InvShiftRows")) {
    const isInv = name.startsWith("Inv");
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 12, lineHeight: 1.9 }}>
          {isInv
            ? "Циклический сдвиг вправо: последние N байтов строки перемещаются в начало. Это точная обратная операция к сдвигу влево при шифровании:"
            : "Циклический сдвиг влево: первые N байтов строки перемещаются в конец. Это перемешивает байты между столбцами без каких-либо вычислений:"}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2, 3].map(r => {
            const bef = prev.slice(r * 4, r * 4 + 4);
            const aft = state.slice(r * 4, r * 4 + 4);
            const desc = r === 0
              ? "без сдвига — строка не изменяется"
              : isInv
                ? `сдвиг вправо на ${r}: последние ${r} → начало`
                : `сдвиг влево на ${r}: первые ${r} → конец`;
            return (
              <div key={r} style={{ padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, border: `1px solid ${r > 0 ? color + "20" : "rgba(255,255,255,0.04)"}` }}>
                <div style={{ ...mut, fontSize: 10, marginBottom: 7 }}>Строка {r} — {desc}:</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {bef.map((b, j) => (
                      <span key={j} style={{ ...mono, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,232,240,0.5)" }}>{b}</span>
                    ))}
                  </div>
                  {r > 0 && (
                    <>
                      <span style={mut}>→</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {aft.map((b, j) => {
                          const moved = b !== bef[j];
                          return (
                            <span key={j} style={{ ...mono, padding: "2px 7px", borderRadius: 4, background: moved ? `${color}15` : "rgba(255,255,255,0.05)", border: `1px solid ${moved ? color + "40" : "rgba(255,255,255,0.08)"}`, color: moved ? color : "rgba(226,232,240,0.5)" }}>{b}</span>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

  /* ── ADD ROUND KEY ──────────────────────────────────────────── */
  } else if (name.startsWith("AddRoundKey")) {
    const key = prev.map((p, idx) => hh(hx(p) ^ hx(state[idx])));
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 8, lineHeight: 1.9 }}>
          XOR (⊕) — побитовая операция «исключающее или». Сравниваются отдельные биты двух байтов. Правило:
        </div>
        <div style={{ display: "flex", gap: 20, marginBottom: 16, flexWrap: "wrap" }}>
          {[["0","0","0","одинаковые → 0"], ["0","1","1","разные → 1"], ["1","0","1","разные → 1"], ["1","1","0","одинаковые → 0"]].map(([a, b, r, note]) => (
            <div key={a+b+r} style={{ padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, border: `1px solid ${color}15`, textAlign: "center" }}>
              <div style={dim}>{a} ⊕ {b}</div>
              <div style={{ borderTop: `1px solid ${color}30`, marginTop: 4, paddingTop: 4, ...acc, fontWeight: 700 }}>{r}</div>
              <div style={{ ...mut, fontSize: 9, marginTop: 4 }}>{note}</div>
            </div>
          ))}
        </div>

        <div style={{ ...mut, marginBottom: 10 }}>Детальный разбор первых 3 байтов (с двоичным представлением):</div>
        {[0, 1, 2].map(idx => {
          const sv = hx(prev[idx]);
          const kv = hx(key[idx]);
          const rv = hx(state[idx]);
          return (
            <div key={idx} style={{ marginBottom: 10, padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 8, border: `1px solid ${color}15` }}>
              <div style={{ ...mut, fontSize: 10, marginBottom: 8 }}>
                Байт {idx}: {hh(sv)} ⊕ {hh(kv)} = {hh(rv)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ ...mut, width: 130, flexShrink: 0 }}>Состояние ({hh(sv)}):</span>
                  <span style={{ ...dim, letterSpacing: 4 }}>{bin(sv)}</span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ ...mut, width: 130, flexShrink: 0 }}>⊕ Ключ раунда ({hh(kv)}):</span>
                  <span style={{ ...mono, color: "#a78bfa", letterSpacing: 4 }}>{bin(kv)}</span>
                </div>
                <div style={{ height: 1, background: `${color}25`, margin: "3px 0 3px 140px" }} />
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ ...mut, width: 130, flexShrink: 0 }}>= Результат ({hh(rv)}):</span>
                  <span style={{ ...acc, letterSpacing: 4 }}>{bin(rv)}</span>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{ ...mut, marginBottom: 8 }}>Все 16 байтов — состояние ⊕ ключ = результат:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[0, 1, 2, 3].map(r => (
            <div key={r} style={{ display: "flex", gap: 10 }}>
              {[0, 1, 2, 3].map(c => {
                const idx = r * 4 + c;
                return (
                  <div key={c} style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <span style={dim}>{prev[idx]}</span>
                    <span style={mut}>⊕</span>
                    <span style={{ ...mono, color: "#a78bfa" }}>{key[idx]}</span>
                    <span style={mut}>=</span>
                    <span style={acc}>{state[idx]}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <XorCalc color={color} />
      </div>
    );

  /* ── MIX COLUMNS / INV MIX COLUMNS ─────────────────────────── */
  } else if (name.startsWith("MixColumns") || name.startsWith("InvMixColumns")) {
    const isInv = name.startsWith("Inv");
    const mc = isInv
      ? [[14,11,13,9],[9,14,11,13],[13,9,14,11],[11,13,9,14]]
      : [[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]];
    content = (
      <div>
        <div style={{ ...mut, marginBottom: 6, lineHeight: 1.9 }}>
          Умножение ведётся в поле GF(2⁸) — это «особая» математика для байтов:
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            ["1·XX", "= XX", "без изменений"],
            ["2·XX", "= XX<<1 mod 0x1B", "сдвиг влево на 1 бит"],
            ["3·XX", "= (2·XX) ⊕ XX", "удвоить, затем XOR с собой"],
          ].map(([lbl, formula, note]) => (
            <div key={lbl} style={{ padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: 6, border: `1px solid ${color}15`, flex: "1 1 auto" }}>
              <div style={{ ...acc, fontWeight: 700, marginBottom: 3 }}>{lbl}</div>
              <div style={dim}>{formula}</div>
              <div style={{ ...mut, fontSize: 10, marginTop: 3 }}>{note}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[0, 1, 2, 3].map(c => {
            const col = [hx(prev[c]), hx(prev[4+c]), hx(prev[8+c]), hx(prev[12+c])];
            const labels = ["a","b","c","d"];
            return (
              <div key={c} style={{ padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: 8, border: `1px solid ${color}15` }}>
                <div style={{ ...mut, fontSize: 10, marginBottom: 8 }}>
                  СТОЛБЕЦ {c}: [{labels.map((l,i) => `${l}=${hh(col[i])}`).join(", ")}]
                </div>
                {mc.map((row, ri) => {
                  const result = hh(row.reduce((a, m, mi) => a ^ gmul(col[mi], m), 0));
                  const terms = row.map((m, mi) => {
                    const v = hh(col[mi]);
                    if (m === 1) return v;
                    const prod = hh(gmul(col[mi], m));
                    return `${m}·${v}=${prod}`;
                  });
                  return (
                    <div key={ri} style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={dim}>{terms.join(" ⊕ ")}</span>
                      <span style={mut}>=</span>
                      <span style={{ ...acc, fontWeight: 700 }}>{result}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <GfCalc color={color} />
      </div>
    );
  }

  if (!content) return null;

  return (
    <>
      <div style={{ height: 1, background: `${color}20`, margin: "20px 0" }} />
      <div style={{
        fontFamily: "monospace", fontSize: 10, fontWeight: 700,
        letterSpacing: 1.8, color, textTransform: "uppercase", marginBottom: 14,
      }}>
        Вычисления
      </div>
      {content}
    </>
  );
}

function Field({ label, value, onChange, placeholder, maxLength }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%", padding: "10px 12px",
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--border)",
          borderRadius: 8, color: "var(--text)",
          fontFamily: "monospace", fontSize: 13, outline: "none",
        }}
      />
    </div>
  );
}
