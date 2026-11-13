import assert from "node:assert/strict";
import test from "node:test";
import { createNoise2D } from "simplex-noise";
import { advanceDots } from "../src/lib/portraitMotion.ts";

test("dots repel from the cursor and return after it leaves", () => {
  const targets = Float64Array.of(100, 100, 110, 100, 300, 300);
  const positions = targets.slice();
  const velocities = new Float64Array(targets.length);
  const pointer = { x: 90, y: 100, radius: 70, active: true };
  for (let frame = 0; frame < 30; frame++) {
    advanceDots(targets, positions, velocities, pointer, 1000 / 60, frame * 1000 / 60, () => 0);
  }
  assert.ok(positions[0] > targets[0] + 20);
  assert.equal(positions[4], targets[4]);
  assert.equal(positions[5], targets[5]);
  pointer.active = false;
  for (let frame = 0; frame < 240; frame++) {
    advanceDots(targets, positions, velocities, pointer, 1000 / 60, frame * 1000 / 60, () => 0);
  }
  for (let i = 0; i < positions.length; i++) assert.ok(Math.abs(positions[i] - targets[i]) < 0.01);
});

test("an exact cursor hit and a long frame never create invalid positions", () => {
  const targets = Float64Array.of(100, 100);
  const positions = targets.slice();
  const velocities = new Float64Array(2);
  advanceDots(targets, positions, velocities, { x: 100, y: 100, radius: 70, active: true }, 10000, 10000, () => 0);
  assert.ok(positions.every(Number.isFinite));
  assert.ok(Math.hypot(positions[0] - 100, positions[1] - 100) > 0);
  assert.ok(Math.hypot(positions[0] - 100, positions[1] - 100) < 50);
});

test("closer dots gain more velocity, coast after a pass, and scatter farther", () => {
  const targets = Float64Array.of(102, 100, 130, 100);
  const positions = targets.slice();
  const velocities = new Float64Array(4);
  const pointer = { x: 100, y: 100, radius: 40, active: true };
  advanceDots(targets, positions, velocities, pointer, 1000 / 60, 0, () => 0);
  assert.ok(velocities[0] > velocities[2] * 5);
  const afterKick = positions.slice();
  pointer.active = false;
  advanceDots(targets, positions, velocities, pointer, 1000 / 60, 1000 / 60, () => 0);
  assert.ok(positions[0] > afterKick[0], "momentum continues after the cursor leaves");
  const peak = [0, 0];
  for (let frame = 0; frame < 180; frame++) {
    advanceDots(targets, positions, velocities, pointer, 1000 / 60, frame * 1000 / 60, () => 0);
    peak[0] = Math.max(peak[0], positions[0] - targets[0]);
    peak[1] = Math.max(peak[1], positions[2] - targets[2]);
  }
  assert.ok(peak[0] > 30, "a close pass produces visible outward travel");
  assert.ok(peak[0] > peak[1] * 5);
  for (let i = 0; i < positions.length; i++) assert.ok(Math.abs(positions[i] - targets[i]) < 0.01);
});

test("simplex motion changes over time while keeping the portrait recognizable", () => {
  const noise = createNoise2D(() => 0.5);
  const targets = Float64Array.of(100, 100, 200, 200);
  const positions = targets.slice();
  const velocities = new Float64Array(4);
  const pointer = { x: 0, y: 0, radius: 70, active: false };
  let changed = false;
  for (let frame = 0; frame < 600; frame++) {
    advanceDots(targets, positions, velocities, pointer, 1000 / 60, frame * 1000 / 60, noise);
    for (let i = 0; i < positions.length; i++) {
      const distance = Math.abs(positions[i] - targets[i]);
      assert.ok(distance < 3);
      if (distance > 0.1) changed = true;
    }
  }
  assert.ok(changed);
});
