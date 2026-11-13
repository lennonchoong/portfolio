import { stipple, type StippleInput } from "../lib/stippling";

self.onmessage = async ({ data }: MessageEvent<StippleInput & { animate: boolean }>) => {
  const iterations = data.iterations ?? 80;
  let frame = 0;
  for (const points of stipple(data)) {
    const done = frame === iterations || points.length === 0;
    if (data.animate || done) {
      const snapshot = points.slice();
      self.postMessage({ points: snapshot, done }, { transfer: [snapshot.buffer] });
    }
    frame++;
    if (data.animate && !done) await new Promise((resolve) => setTimeout(resolve, 24));
  }
  self.close();
};
