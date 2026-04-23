export function textToMatrix(text) {
  const bytes = Array.from(text.padEnd(16, "0")).map((c) => c.charCodeAt(0));

  const m = [[], [], [], []];

  for (let i = 0; i < 16; i++) {
    m[i % 4][Math.floor(i / 4)] = bytes[i];
  }

  return m;
}

export function matrixToHex(matrix) {
  return matrix.flat().map((b) => b.toString(16).padStart(2, "0")).join(" ");
}

export function addRoundKey(state, key) {
  return state.map((r, i) => r.map((v, j) => v ^ key[i][j]));
}

const sbox = Array.from({ length: 256 }, (_, i) => (i * 7 + 3) % 256);

export function subBytes(state) {
  return state.map((r) => r.map((v) => sbox[v]));
}

export function shiftRows(state) {
  return state.map((r, i) => r.map((_, j) => r[(j + i) % 4]));
}

export function generateKey() {
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => Math.floor(Math.random() * 255))
  );
}

export function aesSteps(text) {
  const key = generateKey();
  const input = textToMatrix(text);

  const steps = [];

  steps.push({
    name: "Input",
    state: input,
    formula: "M = plaintext → 4x4 byte matrix"
  });

  const s1 = addRoundKey(input, key);
  steps.push({
    name: "AddRoundKey",
    state: s1,
    formula: "S = M ⊕ K"
  });

  const s2 = subBytes(s1);
  steps.push({
    name: "SubBytes",
    state: s2,
    formula: "S[i] = SBox(S[i])"
  });

  const s3 = shiftRows(s2);
  steps.push({
    name: "ShiftRows",
    state: s3,
    formula: "Row i shifted left by i"
  });

  const final = addRoundKey(s3, key);
  steps.push({
    name: "Final Round",
    state: final,
    formula: "C = S ⊕ K"
  });

  return {
    steps,
    ciphertext: matrixToHex(final)
  };
}