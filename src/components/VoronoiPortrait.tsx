import { useEffect, useRef, useState } from "react";
import { createNoise2D } from "simplex-noise";
import { asset } from "../lib/asset";
import { inkWeight } from "../lib/stippling";
import { advanceDots, type PortraitPointer } from "../lib/portraitMotion";

type Portrait = {
  width: number;
  height: number;
  targets: Float64Array;
  positions: Float64Array;
  velocities: Float64Array;
};

export default function VoronoiPortrait({ phone, active }: { phone: boolean; active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitRef = useRef<Portrait | null>(null);
  const pointerRef = useRef<PortraitPointer>({ x: 0, y: 0, radius: 60, active: false });
  const requestDrawRef = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const noise = createNoise2D();
    let animationFrame = 0;
    let previousTime = 0;
    const render = (time: number) => {
      animationFrame = 0;
      if (!active || document.hidden || failed) return;
      const portrait = portraitRef.current;
      const output = canvasRef.current?.getContext("2d");
      const moving = !phone && !media.matches;
      if (portrait && output) {
        const { width, height, targets, positions, velocities } = portrait;
        if (moving) {
          advanceDots(targets, positions, velocities, pointerRef.current,
            previousTime ? time - previousTime : 1000 / 60, time, noise);
        } else {
          positions.set(targets);
          velocities.fill(0);
        }
        output.clearRect(0, 0, width, height);
        output.fillStyle = "#333";
        output.beginPath();
        for (let i = 0; i < positions.length; i += 2) {
          output.moveTo(positions[i] + 0.8, positions[i + 1]);
          output.arc(positions[i], positions[i + 1], 0.8, 0, Math.PI * 2);
        }
        output.fill();
      }
      previousTime = time;
      if (moving) animationFrame = requestAnimationFrame(render);
    };
    const requestDraw = () => {
      if (!animationFrame && active && !document.hidden && !failed) {
        animationFrame = requestAnimationFrame(render);
      }
    };
    const reset = () => {
      pointerRef.current.active = false;
      previousTime = 0;
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      requestDraw();
    };
    requestDrawRef.current = requestDraw;
    media.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    window.addEventListener("blur", reset);
    window.addEventListener("resize", reset);
    requestDraw();
    return () => {
      cancelAnimationFrame(animationFrame);
      pointerRef.current.active = false;
      requestDrawRef.current = () => {};
      media.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("resize", reset);
    };
  }, [phone, active, failed]);

  useEffect(() => {
    let disposed = false;
    let worker: Worker | undefined;
    const image = new Image();
    image.onerror = () => { if (!disposed) setFailed(true); };
    image.onload = () => {
      if (disposed) return;
      try {
        const source = document.createElement("canvas");
        source.width = 640;
        source.height = Math.round(640 * image.naturalHeight / image.naturalWidth);
        const context = source.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas unavailable");
        context.drawImage(image, 0, 0, source.width, source.height);
        const rgba = context.getImageData(0, 0, source.width, source.height).data;
        const ink = new Float32Array(source.width * source.height);
        let minX = source.width, minY = source.height, maxX = 0, maxY = 0;
        for (let i = 0; i < ink.length; i++) {
          const weight = inkWeight(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2], rgba[i * 4 + 3]);
          if (weight < 0.015) continue;
          ink[i] = weight;
          const x = i % source.width, y = Math.floor(i / source.width);
          minX = Math.min(minX, x); minY = Math.min(minY, y);
          maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        }
        if (maxX < minX || maxY < minY) throw new Error("No visible portrait");
        // Trim the file's transparent margins, leaving breathing room for dots.
        minX = Math.max(0, minX - 50); minY = Math.max(0, minY - 50);
        maxX = Math.min(source.width - 1, maxX + 50);
        maxY = Math.min(source.height - 1, maxY + 50);
        const width = maxX - minX + 1, height = maxY - minY + 1;
        const weights = new Float32Array(width * height);
        let total = 0;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const weight = ink[(y + minY) * source.width + x + minX];
            weights[y * width + x] = weight;
            total += weight;
          }
        }
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const output = canvas.getContext("2d");
        if (!output) throw new Error("Canvas unavailable");
        output.scale(dpr, dpr);
        worker = new Worker(new URL("../workers/stippling.worker.ts", import.meta.url), { type: "module" });
        worker.onerror = () => {
          if (!disposed) setFailed(true);
          worker?.terminate();
        };
        worker.onmessage = ({ data }: MessageEvent<{ points: Float64Array; done: boolean }>) => {
          if (disposed) return;
          const portrait = portraitRef.current;
          if (portrait && portrait.positions.length === data.points.length) {
            portrait.targets = data.points;
          } else {
            portraitRef.current = {
              width, height, targets: data.points,
              positions: data.points.slice(),
              velocities: new Float64Array(data.points.length),
            };
          }
          requestDrawRef.current();
        };
        worker.postMessage({
          weights, width, height,
          count: Math.round(Math.max(700, Math.min(2600, total / 4))),
          animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        }, [weights.buffer]);
      } catch {
        if (!disposed) setFailed(true);
      }
    };
    image.src = asset("/joelle.png");
    return () => {
      disposed = true;
      image.onload = null;
      image.onerror = null;
      worker?.terminate();
    };
  }, []);

  return (
    <div
      onPointerMove={(event) => {
        const portrait = portraitRef.current;
        const canvas = canvasRef.current;
        if (phone || event.pointerType === "touch" || !portrait || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scale = Math.min(rect.width / portrait.width, rect.height / portrait.height);
        if (scale <= 0) return;
        // Account for object-fit's letterboxing as well as responsive scaling.
        pointerRef.current = {
          x: (event.clientX - rect.left - (rect.width - portrait.width * scale) / 2) / scale,
          y: (event.clientY - rect.top - (rect.height - portrait.height * scale) / 2) / scale,
          radius: 40 / scale,
          active: true,
        };
      }}
      onPointerLeave={() => { pointerRef.current.active = false; }}
      style={{
      position: "absolute",
      inset: phone ? "90px 8px 68px" : "60px 20px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      pointerEvents: active && !phone ? "auto" : "none",
    }}>
      {failed ? (
        <img src={asset("/joelle.png")} alt="Portrait of Joelle Warsono" style={{ width: "85%", height: "85%", objectFit: "contain" }} />
      ) : (
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Voronoi stippled portrait of Joelle Warsono"
          style={{ width: "85%", height: "85%", objectFit: "contain" }}
        />
      )}
    </div>
  );
}
