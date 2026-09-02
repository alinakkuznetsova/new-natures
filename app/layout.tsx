import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "New Natures",
  description: "Combining natural patterns with neural cellular automata. An interactive exhibition.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#faf8f4] text-[#1a1815] antialiased">
        <header className="mx-auto max-w-6xl px-6 py-6 flex items-baseline justify-between">
          <Link href="/" className="text-sm font-medium tracking-wide">New Natures</Link>
          <nav className="flex gap-6 text-xs uppercase tracking-[0.15em] text-[#76726b]">
            <Link href="/" className="hover:text-[#1a1815]">Room</Link>
            <Link href="/gallery" className="hover:text-[#1a1815]">Gallery</Link>
          </nav>
        </header>
        {children}
        <footer className="mx-auto max-w-6xl px-6 py-12 text-xs text-[#76726b] border-t border-[#d6d2ca] mt-16">
          Alina Kuznetsova · MSc Applied Machine Learning for Creatives · UAL Creative Computing Institute, 2026
        </footer>
      </body>
    </html>
  );
}