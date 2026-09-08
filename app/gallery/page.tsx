import Image from "next/image";
import works from "@/data/gallery.json";

type Work = {
  file: string;
  title?: string;
  parents: string;
  method: string;
  m: number | string;
  note?: string;
};

export default function Gallery() {
  const list = works as Work[];
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[#8a867f] mb-6">Realised works</p>

      <div className="max-w-3xl mb-12 text-[#1a1815] text-sm leading-relaxed space-y-4">
        <p>
          Fifty-six pattern works from the project, drawn from all three combination methods across the five patterns.
          Method 1 is multi-target training: a single network learns both patterns and interpolates internally.
          Method 2 is fine-tuning interpolation: a model trained on one pattern is fine-tuned toward another, and
          the two weight sets are blended. Method 3 is weight interpolation between independently trained models.
          Each work is a single frame from an evaluation sweep, realised through a palette pipeline of gradient
          mapping, optional inversion, gamma, and grain.
        </p>
        <p>
          Method 3 combinations all failed against the report&rsquo;s grading criteria, but the failures often
          produced striking patterns of their own, belonging to neither parent. A curated selection appears here
          for their qualities as patterns rather than as hybrids.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-x-6 gap-y-10">
        {list.map((w) => (
          <figure key={w.file}>
            <div className="relative aspect-square bg-[#141210]">
              <Image
                src={`/gallery/${w.file}`}
                alt={w.title ?? w.parents}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-xs text-[#76726b] leading-snug">
              {w.title && <div className="text-[#1a1815] text-sm mb-1">{w.title}</div>}
              <div>
                {w.parents} · {w.method} · m = {w.m}
              </div>
              {w.note && <div className="mt-1">{w.note}</div>}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}