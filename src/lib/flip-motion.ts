export const FLIP_MS = 680;
export const REDUCED_MS = 280;
export const FLIP_PERSPECTIVE = 1400;
export const FLIP_EASE = [0.22, 0.84, 0.32, 1] as const;

const OVERSHOOT = 8 / 180;
const PEAK_AT = 0.84;

export function cubicBezierEase(
  t: number,
  x1 = FLIP_EASE[0],
  y1 = FLIP_EASE[1],
  x2 = FLIP_EASE[2],
  y2 = FLIP_EASE[3],
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
  const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 8; i += 1) {
    const error = sampleX(u) - t;
    const slope = sampleDX(u);
    if (Math.abs(error) < 1e-6) return sampleY(u);
    if (Math.abs(slope) < 1e-6) break;
    u -= error / slope;
  }

  let lo = 0;
  let hi = 1;
  u = t;
  for (let i = 0; i < 24; i += 1) {
    const x = sampleX(u);
    if (Math.abs(x - t) < 1e-6) break;
    if (x < t) lo = u;
    else hi = u;
    u = (lo + hi) / 2;
  }
  return sampleY(u);
}

/** One 8° overshoot, then a single settle back to the target. */
export function settleProgress(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  if (progress <= PEAK_AT) {
    const u = progress / PEAK_AT;
    const eased = u * u * (3 - 2 * u);
    return eased * (1 + OVERSHOOT);
  }
  const u = (progress - PEAK_AT) / (1 - PEAK_AT);
  const eased = u * u * (3 - 2 * u);
  return (1 + OVERSHOOT) * (1 - eased) + eased;
}

export type FlipFrame = {
  angle: number;
  scale: number;
  shadowX: number;
  shadowScale: number;
  done: boolean;
};

function resting(angle: number): FlipFrame {
  return { angle, scale: 1, shadowX: 0, shadowScale: 1, done: true };
}

export function flipFrame(elapsedMs: number, from: number, to: number): FlipFrame {
  if (elapsedMs >= FLIP_MS) return resting(to);
  const t = Math.max(0, elapsedMs) / FLIP_MS;
  const angle = from + (to - from) * settleProgress(cubicBezierEase(t));
  const rad = (angle * Math.PI) / 180;
  const facing = Math.abs(Math.sin(rad));
  return {
    angle,
    scale: 1 + 0.05 * facing,
    shadowX: Math.sin(rad * 2) * 14,
    shadowScale: 0.24 + 0.76 * Math.abs(Math.cos(rad)),
    done: false,
  };
}
