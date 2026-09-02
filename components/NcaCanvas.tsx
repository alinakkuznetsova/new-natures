"use client";

import { useEffect, useRef } from "react";

const N = 256;
const C = 12;
const STEPS_PER_FRAME = 4;

type Props = {
  file: string;
  m: number;
  resetKey: number;
  lowColor: [number, number, number];
  highColor: [number, number, number];
  onFps?: (fps: number) => void;
};

export default function NcaCanvas({ file, m, resetKey, lowColor, highColor, onFps }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mRef = useRef(m);
  const resetRef = useRef(resetKey);
  const lowRef = useRef(lowColor);
  const highRef = useRef(highColor);
  mRef.current = m;
  lowRef.current = lowColor;
  highRef.current = highColor;

  useEffect(() => {
    let alive = true;
    let raf = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tf: any = null, model: any = null, state: any = null;
    let lastReset = resetRef.current;
    let frames = 0;
    let last = performance.now();

    const seed = () => {
      const buf = tf.buffer([1, N, N, C]);
      for (let c = 0; c < C; c++) buf.set(1, 0, N / 2, N / 2, c);
      return buf.toTensor();
    };

    const step = (x: unknown) =>
      tf.tidy(() => {
        const sig = tf.fill([1, N, N, 1], mRef.current);
        const xs = tf.concat([x, sig], 3);
        const perceived = tf.depthwiseConv2d(xs, model.kernels, 1, "same");
        const h = tf.relu(tf.add(tf.conv2d(perceived, model.w1, 1, "same"), model.b1));
        const dx = tf.conv2d(h, model.w2, 1, "same");
        const mask = tf.less(tf.randomUniform([1, N, N, 1]), 0.5).toFloat();
        return tf.add(x, tf.mul(dx, mask));
      });

    const loop = async () => {
      if (!alive) return;
      if (model && state && canvasRef.current) {
        if (resetRef.current !== lastReset) {
          lastReset = resetRef.current;
          state.dispose();
          state = seed();
        }
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          const nx = step(state);
          state.dispose();
          state = nx;
        }
        const rgb = tf.tidy(() => {
          const g = state.slice([0, 0, 0, 0], [1, N, N, 1]).reshape([N, N, 1]).clipByValue(0, 1);
          const lo = tf.tensor(lowRef.current.map((v) => v / 255)).reshape([1, 1, 3]);
          const hi = tf.tensor(highRef.current.map((v) => v / 255)).reshape([1, 1, 3]);
          return lo.add(g.mul(hi.sub(lo))).clipByValue(0, 1);
        });
        await tf.browser.toPixels(rgb, canvasRef.current);
        rgb.dispose();
        frames++;
        const now = performance.now();
        if (now - last > 1000) { onFps?.(frames); frames = 0; last = now; }
      }
      raf = requestAnimationFrame(loop);
    };

    (async () => {
      tf = await import("@tensorflow/tfjs");
      await tf.setBackend("webgl");
      const j = await (await fetch(`/models/${file}.json`)).json();
      if (!alive) return;
      const k = tf.tensor(j["perception_kernels"]).reshape([4, 3, 3]).transpose([1, 2, 0]);
      const kernels = k.expandDims(2).tile([1, 1, C + 1, 1]);
      const w1 = tf.tensor(j["update.0.weight"]).transpose([2, 3, 1, 0]);
      const b1 = tf.tensor(j["update.0.bias"]);
      const w2 = tf.tensor(j["update.2.weight"]).transpose([2, 3, 1, 0]);
      k.dispose();
      model = { kernels, w1, b1, w2 };
      state = seed();
      raf = requestAnimationFrame(loop);
    })();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (model) Object.values(model).forEach((t) => (t as { dispose?: () => void }).dispose?.());
      if (state) state.dispose();
    };
  }, [file, onFps]);

  useEffect(() => { resetRef.current = resetKey; }, [resetKey]);

  return (
    <canvas
      ref={canvasRef}
      width={N}
      height={N}
      className="w-full aspect-square"
      style={{ imageRendering: "pixelated" }}
    />
  );
}