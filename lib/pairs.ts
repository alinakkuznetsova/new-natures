export const PATTERNS = ["leopard", "coral", "dragonfly", "frost", "condensation"] as const;
export type Pattern = (typeof PATTERNS)[number];

export const MECHANISM: Record<Pattern, string> = {
  leopard: "reaction-diffusion",
  coral: "reaction-diffusion",
  dragonfly: "near-Voronoi tessellation",
  frost: "diffusion-limited aggregation",
  condensation: "nucleation and coalescence",
};

export type Tier = "coherent" | "degraded" | "failed";

// The ten multi-target models. Filename order fixes the signal mapping: A at m = 0, B at m = 1.
// Tiers and notes are the Method 1 visual gradings from the evaluation.
export const MODELS: { a: Pattern; b: Pattern; tier: Tier; note: string }[] = [
  { a: "leopard", b: "coral", tier: "coherent", note: "A proper mix of both parents, evenly spread across the grid." },
  { a: "leopard", b: "dragonfly", tier: "degraded", note: "Well-formed, but the midpoint reads mostly as dragonfly; leopard recedes early." },
  { a: "leopard", b: "frost", tier: "degraded", note: "Frost dominates the middle of the sweep; leopard is lost in the process." },
  { a: "leopard", b: "condensation", tier: "coherent", note: "Good inheritance from both parents, even changes across the sweep." },
  { a: "coral", b: "dragonfly", tier: "failed", note: "The single Method 1 failure: mid-sweep outputs blur into unstructured grey." },
  { a: "coral", b: "frost", tier: "coherent", note: "A proper mix of both parents, evenly spread across the grid." },
  { a: "coral", b: "condensation", tier: "degraded", note: "The middle leans toward coral; less balanced than the coherent pairs." },
  { a: "dragonfly", b: "frost", tier: "coherent", note: "A proper mix of both parents with even changes across the sweep." },
  { a: "dragonfly", b: "condensation", tier: "coherent", note: "Both parents present; the mid-sweep forms stretch slightly sideways." },
  { a: "frost", b: "condensation", tier: "coherent", note: "Even changes across the sweep; the midpoint resembles both parents." },
];

export function modelFile(a: Pattern, b: Pattern) {
  return `multitarget_${a}_x_${b}`;
}

/** Resolve a user's (left, right) choice to a stored model and whether the slider must be inverted. */
export function resolve(left: Pattern, right: Pattern) {
  const direct = MODELS.find((m) => m.a === left && m.b === right);
  if (direct) return { model: direct, file: modelFile(direct.a, direct.b), invert: false };
  const flipped = MODELS.find((m) => m.a === right && m.b === left);
  if (flipped) return { model: flipped, file: modelFile(flipped.a, flipped.b), invert: true };
  return null; // same pattern on both sides
}
