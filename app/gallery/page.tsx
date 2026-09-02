import Image from "next/image";
import works from "@/data/gallery.json";

type Work = {
  file: string;
  title: string;
  parents: string;
  method: string;
  m: number | string;
  note?: string;
};

export default function Gallery() {
  const list = works as Work[];
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-[#8a867f] mb-8">Realised works</p>
      <div className="grid gap-x-6 gap-y-10 grid-cols-2 md:grid-cols-3">
        {list.map((w) => (
          <figure key={w.file}>
            <div className="relative aspect-square bg-[#141210]">
              <Image src={`/gallery/${w.file}`} alt={w.title} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm">
              <div className="text-[#f2efe9]">{w.title}</div>
              <div className="text-xs text-[#8a867f] mt-1">
                {w.parents} · {w.method} · m = {w.m}
              </div>
              {w.note && <div className="text-xs text-[#8a867f] mt-1">{w.note}</div>}
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}