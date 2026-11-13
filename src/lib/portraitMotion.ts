import type { NoiseFunction2D } from "simplex-noise";

export type PortraitPointer = { x: number; y: number; radius: number; active: boolean };

export function advanceDots(
  targets: Float64Array,
  positions: Float64Array,
  velocities: Float64Array,
  pointer: PortraitPointer,
  elapsed: number,
  time: number,
  noise: NoiseFunction2D,
) {
  // Normalize to 60 Hz and cap catch-up after a suspended/background tab.
  const step = Math.min(2, Math.max(0, elapsed / (1000 / 60)));
  // Preserve momentum after a dot leaves the cursor's influence.
  const damping = Math.pow(0.9, step);
  for (let i = 0; i < targets.length; i += 2) {
    const seed = i * 0.73;
    const homeX = targets[i] + noise(seed, time * 0.0016) * 1.2;
    const homeY = targets[i + 1] + noise(seed + 917, time * 0.0016) * 1.2;
    let ax = (homeX - positions[i]) * 0.018;
    let ay = (homeY - positions[i + 1]) * 0.018;
    if (pointer.active) {
      let dx = positions[i] - pointer.x;
      let dy = positions[i + 1] - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < pointer.radius) {
        const proximity = 1 - distance / pointer.radius;
        const directionLength = distance < 0.001 ? 1 : distance;
        // Give a dot directly under the cursor a stable outward direction.
        if (distance < 0.001) {
          dx = Math.cos(i * 2.39996);
          dy = Math.sin(i * 2.39996);
        }
        // A close pass gives a strong velocity kick; the edge stays gentle.
        // Velocity persists beyond the radius, so closer dots travel farther.
        const force = 12 * proximity ** 3;
        ax += dx / directionLength * force;
        ay += dy / directionLength * force;
      }
    }
    velocities[i] = (velocities[i] + ax * step) * damping;
    velocities[i + 1] = (velocities[i + 1] + ay * step) * damping;
    positions[i] += velocities[i] * step;
    positions[i + 1] += velocities[i + 1] * step;
  }
}
