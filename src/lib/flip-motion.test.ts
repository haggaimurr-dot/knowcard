import assert from "node:assert/strict";
import test from "node:test";
import { FLIP_EASE, FLIP_MS, FLIP_PERSPECTIVE, REDUCED_MS, flipFrame } from "./flip-motion";

test("flip timing matches the specimen spec", () => {
  assert.equal(FLIP_MS, 680);
  assert.deepEqual(FLIP_EASE, [0.22, 0.84, 0.32, 1]);
  assert.ok(FLIP_PERSPECTIVE >= 1200 && FLIP_PERSPECTIVE <= 1600);
  assert.ok(REDUCED_MS >= 240 && REDUCED_MS <= 300);
  assert.equal(REDUCED_MS, 280);
});

test("rest poses are flat and the turn finishes on the target", () => {
  const start = flipFrame(0, 0, 180);
  assert.equal(start.angle, 0);
  assert.equal(start.scale, 1);
  assert.equal(start.shadowX, 0);
  assert.equal(start.done, false);

  const end = flipFrame(FLIP_MS, 0, 180);
  assert.equal(end.angle, 180);
  assert.equal(end.scale, 1);
  assert.equal(end.shadowX, 0);
  assert.equal(end.done, true);

  const back = flipFrame(FLIP_MS, 180, 0);
  assert.equal(back.angle, 0);
  assert.equal(back.done, true);
});

test("zenith scale is about 1.05 when the card is edge-on", () => {
  const at = frameNearAngle(0, 180, 90);
  assert.ok(Math.abs(at.angle - 90) < 0.4, `angle ${at.angle}`);
  assert.ok(Math.abs(at.scale - 1.05) < 0.01, `scale ${at.scale}`);
});

test("landing overshoots by 8° once, then settles", () => {
  const forward = sample(0, 180);
  assert.equal(countPeaks(forward, (angle) => angle > 180), 1);
  const forwardPeak = Math.max(...forward);
  assert.ok(forwardPeak > 187 && forwardPeak < 189, `peak ${forwardPeak}`);
  assert.equal(forward[forward.length - 1], 180);

  const back = sample(180, 0);
  assert.equal(countValleys(back, (angle) => angle < 0), 1);
  const backPeak = Math.min(...back);
  assert.ok(backPeak < -7 && backPeak > -9, `peak ${backPeak}`);
  assert.equal(back[back.length - 1], 0);
});

test("contact shadow travels with the turn and returns to the desk", () => {
  const early = frameNearAngle(0, 180, 45);
  const late = frameNearAngle(0, 180, 135);
  assert.ok(early.shadowX > 8, `early ${early.shadowX}`);
  assert.ok(late.shadowX < -8, `late ${late.shadowX}`);
  const edge = frameNearAngle(0, 180, 90);
  assert.ok(edge.shadowScale < 0.4, `edge footprint ${edge.shadowScale}`);
});

function sample(from: number, to: number) {
  const angles: number[] = [];
  for (let ms = 0; ms <= FLIP_MS; ms += 4) angles.push(flipFrame(ms, from, to).angle);
  return angles;
}

function countPeaks(angles: number[], outside: (angle: number) => boolean) {
  let peaks = 0;
  for (let i = 1; i < angles.length - 1; i += 1) {
    const angle = angles[i]!;
    if (angle > angles[i - 1]! && angle >= angles[i + 1]! && outside(angle)) peaks += 1;
  }
  return peaks;
}

function countValleys(angles: number[], outside: (angle: number) => boolean) {
  let valleys = 0;
  for (let i = 1; i < angles.length - 1; i += 1) {
    const angle = angles[i]!;
    if (angle < angles[i - 1]! && angle <= angles[i + 1]! && outside(angle)) valleys += 1;
  }
  return valleys;
}

function frameNearAngle(from: number, to: number, target: number) {
  let lo = 0;
  let hi = FLIP_MS;
  for (let i = 0; i < 28; i += 1) {
    const mid = (lo + hi) / 2;
    const angle = flipFrame(mid, from, to).angle;
    if (angle < target) lo = mid;
    else hi = mid;
  }
  return flipFrame((lo + hi) / 2, from, to);
}
