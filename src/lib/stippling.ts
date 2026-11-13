import { Delaunay } from "d3-delaunay";

export type StippleInput = {
  weights: Float32Array;
  width: number;
  height: number;
  count: number;
  iterations?: number;
};

// Weighted Lloyd relaxation, following Mike Bostock's Voronoi Stippling:
// https://observablehq.com/@mbostock/voronoi-stippling
// Nearest-site assignment gives each pixel its Voronoi cell without drawing
// polygons. Transparent pixels carry no ink, even when their RGB is black.
export function inkWeight(r: number, g: number, b: number, alpha: number) {
  return (alpha / 255) * (2126 * (255 - r) + 7152 * (255 - g) + 722 * (255 - b)) / 2550000;
}

export function* stipple({ weights, width, height, count, iterations = 80 }: StippleInput) {
  const cumulative = new Float64Array(weights.length);
  let total = 0;
  for (let i = 0; i < weights.length; i++) cumulative[i] = total += weights[i];
  if (total <= 0 || count <= 0) {
    yield new Float64Array();
    return;
  }

  // Stable seed keeps the portrait consistent across reloads and screen sizes.
  let seed = 42;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const points = new Float64Array(count * 2);
  const sample = (i: number) => {
    const target = random() * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (cumulative[mid] <= target) lo = mid + 1;
      else hi = mid;
    }
    points[i * 2] = lo % width + random();
    points[i * 2 + 1] = Math.floor(lo / width) + random();
  };
  // Sample by ink weight so thin line art never leaves dots in empty space.
  for (let i = 0; i < count; i++) sample(i);
  yield points;

  const delaunay = new Delaunay(points);
  const mass = new Float64Array(count);
  const centroids = new Float64Array(count * 2);
  for (let iteration = 0; iteration < iterations; iteration++) {
    mass.fill(0);
    centroids.fill(0);
    let nearest = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const weight = weights[y * width + x];
        if (weight <= 0) continue;
        nearest = delaunay.find(x + 0.5, y + 0.5, nearest);
        mass[nearest] += weight;
        centroids[nearest * 2] += weight * (x + 0.5);
        centroids[nearest * 2 + 1] += weight * (y + 0.5);
      }
    }
    const jitter = 1.5 * Math.pow(1 - iteration / iterations, 3);
    for (let i = 0; i < count; i++) {
      if (!mass[i]) {
        sample(i);
        continue;
      }
      for (let axis = 0; axis < 2; axis++) {
        const index = i * 2 + axis;
        const centroid = centroids[index] / mass[i];
        points[index] = Math.max(0, Math.min(
          (axis === 0 ? width : height) - 0.001,
          points[index] + (centroid - points[index]) * 1.2 + (random() - 0.5) * jitter,
        ));
      }
    }
    delaunay.update();
    yield points;
  }
}
