/**
 * Lecture de nombres manuscrits dans le navigateur, sans serveur.
 * Modèle : perceptron entraîné sur MNIST augmenté (scripts/train-digits.py), poids int8.
 * Étapes : encre du canevas -> découpage en chiffres (colonnes vides) -> normalisation MNIST
 * (boîte 20x20, centre de masse) -> réseau -> nombre + confiance.
 */

interface QMatrix {
  shape: [number, number];
  scale: number;
  data: string;
}
interface RawModel {
  W1: QMatrix;
  b1: number[];
  W2: QMatrix;
  b2: number[];
  test_accuracy: number;
}
interface Model {
  w1: Float32Array;
  b1: Float32Array;
  w2: Float32Array;
  b2: Float32Array;
  hidden: number;
  accuracy: number;
}

export interface DigitRead {
  digit: number;
  prob: number;
  /** Image 28x28 vue par le réseau (0..1), pour l'afficher dans la démo. */
  pixels: Float32Array;
}
export interface NumberRead {
  text: string;
  confidence: number;
  digits: DigitRead[];
}

let modelPromise: Promise<Model> | null = null;

function dequant(q: QMatrix): Float32Array {
  const bin = atob(q.data);
  const out = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    const v = bin.charCodeAt(i);
    out[i] = (v > 127 ? v - 256 : v) * q.scale;
  }
  return out;
}

export function loadDigitModel(): Promise<Model> {
  if (!modelPromise) {
    modelPromise = fetch(`${import.meta.env.BASE_URL}models/digits.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`modèle introuvable (${r.status})`);
        return r.json() as Promise<RawModel>;
      })
      .then((m) => ({
        w1: dequant(m.W1),
        b1: Float32Array.from(m.b1),
        w2: dequant(m.W2),
        b2: Float32Array.from(m.b2),
        hidden: m.W1.shape[1],
        accuracy: m.test_accuracy,
      }));
    modelPromise.catch(() => {
      modelPromise = null;
    });
  }
  return modelPromise;
}

function classify(model: Model, x: Float32Array): { digit: number; prob: number } {
  const H = model.hidden;
  const h = new Float32Array(H);
  for (let j = 0; j < H; j++) h[j] = model.b1[j];
  for (let i = 0; i < 784; i++) {
    const v = x[i];
    if (v === 0) continue;
    const row = i * H;
    for (let j = 0; j < H; j++) h[j] += v * model.w1[row + j];
  }
  for (let j = 0; j < H; j++) if (h[j] < 0) h[j] = 0;
  const logits = new Float32Array(10);
  for (let k = 0; k < 10; k++) logits[k] = model.b2[k];
  for (let j = 0; j < H; j++) {
    const v = h[j];
    if (v === 0) continue;
    const row = j * 10;
    for (let k = 0; k < 10; k++) logits[k] += v * model.w2[row + k];
  }
  let max = -Infinity;
  for (const l of logits) max = Math.max(max, l);
  let sum = 0;
  const p = logits.map((l) => {
    const e = Math.exp(l - max);
    sum += e;
    return e;
  });
  let best = 0;
  for (let k = 1; k < 10; k++) if (p[k] > p[best]) best = k;
  return { digit: best, prob: p[best] / sum };
}

/** Normalisation MNIST d'une zone d'encre : boîte 20x20 proportionnelle, centrée sur le centre de masse. */
function toMnist(ink: Float32Array, W: number, x0: number, x1: number, y0: number, y1: number): Float32Array {
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  const s = 20 / Math.max(w, h);
  const nw = Math.max(1, Math.round(w * s));
  const nh = Math.max(1, Math.round(h * s));
  // réduction par moyenne de zone (anti-crénelage)
  const small = new Float32Array(nw * nh);
  for (let y = 0; y < nh; y++) {
    const sy0 = y0 + Math.floor(y / s);
    const sy1 = Math.min(y1, y0 + Math.floor((y + 1) / s));
    for (let x = 0; x < nw; x++) {
      const sx0 = x0 + Math.floor(x / s);
      const sx1 = Math.min(x1, x0 + Math.floor((x + 1) / s));
      let acc = 0;
      let n = 0;
      for (let yy = sy0; yy <= sy1; yy++) for (let xx = sx0; xx <= sx1; xx++) {
        acc += ink[yy * W + xx];
        n++;
      }
      small[y * nw + x] = n ? acc / n : 0;
    }
  }
  const out = new Float32Array(784);
  const top = Math.floor((28 - nh) / 2);
  const left = Math.floor((28 - nw) / 2);
  for (let y = 0; y < nh; y++) for (let x = 0; x < nw; x++) out[(top + y) * 28 + left + x] = small[y * nw + x];
  // recentrage sur le centre de masse
  let mx = 0;
  let my = 0;
  let m = 0;
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const v = out[y * 28 + x];
    mx += x * v;
    my += y * v;
    m += v;
  }
  if (m > 0) {
    const dx = Math.round(13.5 - mx / m);
    const dy = Math.round(13.5 - my / m);
    const shifted = new Float32Array(784);
    for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
      const sx = x - dx;
      const sy = y - dy;
      if (sx >= 0 && sx < 28 && sy >= 0 && sy < 28) shifted[y * 28 + x] = out[sy * 28 + sx];
    }
    let max = 0;
    for (const v of shifted) max = Math.max(max, v);
    if (max > 0) for (let i = 0; i < 784; i++) shifted[i] = Math.min(1, shifted[i] / max);
    return shifted;
  }
  return out;
}

/** Lit le nombre écrit sur un canevas (encre = canal alpha). Renvoie null si l'ardoise est vide. */
export async function readNumber(canvas: HTMLCanvasElement): Promise<NumberRead | null> {
  const model = await loadDigitModel();
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  const { width: W, height: H } = canvas;
  const data = ctx.getImageData(0, 0, W, H).data;
  const ink = new Float32Array(W * H);
  for (let i = 0, p = 3; i < W * H; i++, p += 4) ink[i] = data[p] / 255;

  // 1. Formes connexes (8-voisinage) : chaque trait continu forme un composant.
  const label = new Int32Array(W * H).fill(-1);
  const comps: { x0: number; x1: number; y0: number; y1: number; area: number }[] = [];
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (ink[i] <= 0.15 || label[i] >= 0) continue;
    const id = comps.length;
    const c = { x0: W, x1: -1, y0: H, y1: -1, area: 0 };
    label[i] = id;
    stack.push(i);
    while (stack.length) {
      const j = stack.pop()!;
      const x = j % W;
      const y = (j - x) / W;
      c.area++;
      if (x < c.x0) c.x0 = x;
      if (x > c.x1) c.x1 = x;
      if (y < c.y0) c.y0 = y;
      if (y > c.y1) c.y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const k = ny * W + nx;
        if (label[k] < 0 && ink[k] > 0.15) {
          label[k] = id;
          stack.push(k);
        }
      }
    }
    comps.push(c);
  }
  const totalArea = comps.reduce((a, c) => a + c.area, 0);
  const kept = comps.map((c, id) => ({ ...c, ids: [id] })).filter((c) => c.area > totalArea * 0.02);

  // 2. Regroupe les traits d'un même chiffre (ex. la barre et le corps d'un 5, les deux traits d'un 4) :
  //    composants qui se chevauchent nettement à l'horizontale.
  kept.sort((a, b) => a.x0 - b.x0);
  const groups: typeof kept = [];
  for (const c of kept) {
    const g = groups[groups.length - 1];
    if (g) {
      const overlap = Math.min(g.x1, c.x1) - Math.max(g.x0, c.x0);
      const narrow = Math.min(g.x1 - g.x0, c.x1 - c.x0) + 1;
      if (overlap > narrow * 0.4) {
        g.x0 = Math.min(g.x0, c.x0);
        g.x1 = Math.max(g.x1, c.x1);
        g.y0 = Math.min(g.y0, c.y0);
        g.y1 = Math.max(g.y1, c.y1);
        g.area += c.area;
        g.ids.push(...c.ids);
        continue;
      }
    }
    groups.push({ ...c, ids: [...c.ids] });
  }

  // 3. Chaque groupe -> image MNIST ne contenant que ses propres traits -> réseau.
  const digits: DigitRead[] = [];
  for (const g of groups) {
    const own = new Set(g.ids);
    const masked = new Float32Array(W * H);
    for (let y = g.y0; y <= g.y1; y++) for (let x = g.x0; x <= g.x1; x++) {
      const k = y * W + x;
      if (label[k] >= 0 && own.has(label[k])) masked[k] = ink[k];
      else if (label[k] < 0 && ink[k] > 0) masked[k] = ink[k]; // bords anti-crénelés
    }
    const px = toMnist(masked, W, g.x0, g.x1, g.y0, g.y1);
    const { digit, prob } = classify(model, px);
    digits.push({ digit, prob, pixels: px });
  }
  if (!digits.length) return null;
  return {
    text: digits.map((d) => d.digit).join(''),
    confidence: digits.reduce((acc, d) => acc * d.prob, 1),
    digits,
  };
}
