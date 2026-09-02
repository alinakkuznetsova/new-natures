"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import NcaCanvas from "@/components/NcaCanvas";
import { MECHANISM, PATTERNS, Pattern, resolve } from "@/lib/pairs";

const TIER_STYLE: Record<string, string> = {
  coherent: "text-[#1a1815] border-[#1a1815]",
  degraded: "text-[#76726b] border-[#d6d2ca]",
  failed: "text-[#ff6600] border-[#ff6600]",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function Home() {
  const [left, setLeft] = useState<Pattern>("leopard");
  const [right, setRight] = useState<Pattern>("coral");
  const [m, setM] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [fps, setFps] = useState(0);
  const [low, setLow] = useState("#1a1815");
  const [high, setHigh] = useState("#faf8f4");
  const onFps = useCallback((f: number) => setFps(f), []);

  const r = useMemo(() => resolve(left, right), [left, right]);
  const effectiveM = r?.invert ? 1 - m : m;

  const Chips = ({ value, onChange, exclude }: { value: Pattern; onChange: (p: Pattern) => void; exclude: Pattern }) => (
    <div className="flex gap-2">
      {PATTERNS.map((p) => {
        const selected = p === value;
        const disabled = p === exclude;
        return (
          <button
            key={p}
            onClick={() => !disabled && onChange(p)}
            disabled={disabled}
            className={[
              "px-3 py-1.5 text-xs border transition-colors",
              selected
                ? "bg-[#1a1815] text-[#faf8f4] border-[#1a1815]"
                : disabled
                ? "text-[#c4c0b8] border-[#e8e4dd] cursor-not-allowed"
                : "text-[#1a1815] border-[#d6d2ca] hover:border-[#1a1815]",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pt-4 pb-20">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Combine natural patterns, live</h1>
          <p className="mt-4 text-[#76726b] leading-relaxed">
            Five natural patterns, each learned by a tiny neural cellular automaton. Choose two, move the slider, and a model trained to hold both renders the blend in real time.
          </p>
        </div>

        <div className="grid gap-14 md:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
          <div>
            {r ? (
              <NcaCanvas
                file={r.file}
                m={effectiveM}
                resetKey={resetKey}
                lowColor={hexToRgb(low)}
                highColor={hexToRgb(high)}
                onFps={onFps}
              />
            ) : (
              <div className="aspect-square bg-[#efece6]" />
            )}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#76726b] mb-2">
                <span>{left}</span>
                <span>m = {m.toFixed(3)}</span>
                <span>{right}</span>
              </div>
              <input
                type="range" min={0} max={1} step={0.001} value={m}
                onChange={(e) => setM(parseFloat(e.target.value))}
                className="w-full accent-[#1a1815]" aria-label="mixing coordinate m"
              />
            </div>
          </div>

          <aside className="space-y-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#76726b] mb-2">Left · m = 0</p>
              <Chips value={left} onChange={setLeft} exclude={right} />
              <p className="mt-2 text-xs text-[#76726b]">{MECHANISM[left]}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-[#76726b] mb-2">Right · m = 1</p>
              <Chips value={right} onChange={setRight} exclude={left} />
              <p className="mt-2 text-xs text-[#76726b]">{MECHANISM[right]}</p>
            </div>

            <div className="border-t border-[#d6d2ca] pt-5">
              <p className="text-xs uppercase tracking-[0.15em] text-[#76726b] mb-3">Palette</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-[#76726b]">
                  <input type="color" value={low} onChange={(e) => setLow(e.target.value)} className="w-8 h-8 border border-[#d6d2ca] bg-transparent p-0 cursor-pointer" />
                  shadows
                </label>
                <label className="flex items-center gap-2 text-xs text-[#76726b]">
                  <input type="color" value={high} onChange={(e) => setHigh(e.target.value)} className="w-8 h-8 border border-[#d6d2ca] bg-transparent p-0 cursor-pointer" />
                  highlights
                </label>
              </div>
              <button
                onClick={() => { setLow("#1a1815"); setHigh("#faf8f4"); }}
                className="mt-3 text-xs text-[#76726b] underline hover:text-[#1a1815]"
              >
                reset palette
              </button>
            </div>

            {r && (
              <div className="border-t border-[#d6d2ca] pt-5">
                <span className={`inline-block border px-2 py-0.5 text-xs uppercase tracking-[0.15em] ${TIER_STYLE[r.model.tier]}`}>
                  {r.model.tier}
                </span>
                <p className="mt-3 leading-relaxed">{r.model.note}</p>
              </div>
            )}

            <div className="border-t border-[#d6d2ca] pt-5 flex items-center justify-between">
              <button
                onClick={() => setResetKey((k) => k + 1)}
                className="border border-[#d6d2ca] px-3 py-2 text-xs uppercase tracking-[0.15em] hover:border-[#1a1815]"
              >
                Reset
              </button>
              <span className="text-xs text-[#76726b]">{fps ? `${fps} fps` : ""}</span>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-[#d6d2ca]">
        <Link href="/gallery" className="group block mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.15em] text-[#76726b] mb-3">Exhibition</p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight group-hover:text-[#76726b]">Enter the gallery →</h2>
          <p className="mt-3 text-[#76726b] max-w-xl leading-relaxed">
            The realised works: hybrids that succeeded, and some that failed in interesting ways, each labelled with its parents, method, and mixing value.
          </p>
        </Link>
      </section>
    </>
  );
}