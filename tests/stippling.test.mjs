import assert from "node:assert/strict";
import test from "node:test";
import { inkWeight, stipple } from "../src/lib/stippling.ts";

test("transparent black and opaque white pixels do not attract dots", () => {
  assert.equal(inkWeight(0, 0, 0, 0), 0);
  assert.equal(inkWeight(255, 255, 255, 255), 0);
  assert.equal(inkWeight(0, 0, 0, 255), 1);
  assert.equal(inkWeight(0, 0, 0, 128), 128 / 255);
});

test("an empty image finishes with no points", () => {
  const frames = [...stipple({ weights: new Float32Array(100), width: 10, height: 10, count: 20 })];
  assert.equal(frames.length, 1);
  assert.equal(frames[0].length, 0);
});

test("sparse line art stays finite, inside bounds, and near the ink", () => {
  const width = 64, height = 64;
  const weights = new Float32Array(width * height);
  for (let y = 8; y < 56; y++) {
    for (let x = 30; x < 34; x++) weights[y * width + x] = 1;
  }
  let final;
  for (const points of stipple({ weights, width, height, count: 45 })) final = points;
  for (let i = 0; i < final.length; i += 2) {
    assert.ok(Number.isFinite(final[i]) && Number.isFinite(final[i + 1]));
    assert.ok(final[i] >= 29.9 && final[i] <= 34.1);
    assert.ok(final[i + 1] >= 7.9 && final[i + 1] <= 56.1);
  }
});

test("relaxation reduces distance from image pixels to their nearest dot", () => {
  const width = 32, height = 32;
  const weights = new Float32Array(width * height).fill(1);
  const frames = stipple({ weights, width, height, count: 40 });
  const initial = frames.next().value.slice();
  let final;
  for (const points of frames) final = points;
  const energy = (points) => {
    let sum = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let nearest = Infinity;
        for (let i = 0; i < points.length; i += 2) {
          nearest = Math.min(nearest, (x + 0.5 - points[i]) ** 2 + (y + 0.5 - points[i + 1]) ** 2);
        }
        sum += nearest;
      }
    }
    return sum;
  };
  assert.ok(energy(final) < energy(initial) * 0.8);
});
