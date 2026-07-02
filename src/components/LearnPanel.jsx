import { useState } from "react";

const CONCEPTS = [
  {
    id: "binary",
    emoji: "💡",
    title: "What is Binary?",
    color: "border-cyan-400/20 bg-cyan-400/6",
    badge: "bg-cyan-400/15 text-cyan-300",
    body: `Computers only understand two states: ON (1) and OFF (0). This is called binary — base 2.

Every number you type gets converted into a series of 1s and 0s. For example:
  • 5  →  0000 0101
  • 13 →  0000 1101
  • 42 →  0010 1010

Each position is a power of 2 (1, 2, 4, 8, 16…). Add up the positions where a 1 appears to get the decimal number.`,
    example: "5 = 4 + 1 = 2² + 2⁰ = 0000 0101",
  },
  {
    id: "twos",
    emoji: "➖",
    title: "What is Two's Complement?",
    color: "border-violet-400/20 bg-violet-400/6",
    badge: "bg-violet-400/15 text-violet-300",
    body: `Negative numbers can't just have a minus sign in hardware. CPUs use a trick called two's complement.

To make −5 from 5:
  1. Write 5 in binary:   0000 0101
  2. Flip all bits:       1111 1010
  3. Add 1:               1111 1011  ← this is −5

The leftmost bit (MSB) acts as the sign: 0 = positive, 1 = negative.
This lets the same addition circuit handle both + and − with no extra hardware.`,
    example: "−5 in 8-bit = 1111 1011",
  },
  {
    id: "hex",
    emoji: "🔣",
    title: "What is Hexadecimal?",
    color: "border-violet-400/20 bg-violet-400/6",
    badge: "bg-violet-400/15 text-violet-300",
    body: `Binary strings get long fast. Hexadecimal (base 16) is a shorthand — each hex digit represents exactly 4 binary bits (a nibble).

Digits: 0–9 then A=10, B=11, C=12, D=13, E=14, F=15

  • 0000 = 0    • 1000 = 8
  • 0001 = 1    • 1001 = 9
  • 0010 = 2    • 1010 = A
  • 1111 = F

So 255 in binary (1111 1111) is just 0xFF in hex — much shorter!
Memory addresses, colours (#FF5733), and file formats all use hex.`,
    example: "255 = 1111 1111 = 0xFF",
  },
  {
    id: "addition",
    emoji: "➕",
    title: "How does binary addition work?",
    color: "border-emerald-400/20 bg-emerald-400/6",
    badge: "bg-emerald-400/15 text-emerald-300",
    body: `Binary addition follows 4 simple rules:
  0 + 0 = 0
  0 + 1 = 1
  1 + 0 = 1
  1 + 1 = 10  ← write 0, carry 1 (just like 9+1=10 in decimal)

Example: 5 + 3 = 8
  0000 0101  (5)
+ 0000 0011  (3)
──────────
  0000 1000  (8)

The CPU does this with logic gates — tiny circuits that implement these rules in hardware at billions of times per second.`,
    example: "5 + 3 → 0101 + 0011 = 1000 = 8",
  },
  {
    id: "float",
    emoji: "🌊",
    title: "What is IEEE-754 Float?",
    color: "border-amber-400/20 bg-amber-400/6",
    badge: "bg-amber-400/15 text-amber-300",
    body: `Decimal numbers like 3.14 can't be stored as simple integers. CPUs use the IEEE-754 standard — like scientific notation in binary.

A 64-bit float has 3 parts:
  • 1 bit  — Sign (0=positive, 1=negative)
  • 11 bits — Exponent (the scale, like ×10³)
  • 52 bits — Fraction (the significant digits)

This is why 0.1 + 0.2 ≠ 0.3 exactly in most programming languages — the fraction can't represent every decimal perfectly in binary.`,
    example: "3.14 → sign:0 exp:10000000000 frac:1001000111101...",
  },
  {
    id: "bitops",
    emoji: "⚙️",
    title: "What are Bitwise Operations?",
    color: "border-rose-400/20 bg-rose-400/6",
    badge: "bg-rose-400/15 text-rose-300",
    body: `CPUs can operate on individual bits directly. These are called bitwise operations:

  AND  — 1 only if BOTH bits are 1
  OR   — 1 if EITHER bit is 1
  XOR  — 1 if bits are DIFFERENT
  NOT  — flips every bit
  <<   — shift left (multiply by 2)
  >>   — shift right (divide by 2)

Example: 5 AND 3
  0101 (5)
  0011 (3)
  ────
  0001 (1)  ← only bit 0 is 1 in both

Games, graphics, encryption, and networking all rely heavily on bitwise ops.`,
    example: "5 AND 3 = 0101 & 0011 = 0001 = 1",
  },
];

function ConceptCard({ concept, isFirst }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rounded-xl border ${concept.color} overflow-hidden transition-all`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{concept.emoji}</span>
          <div>
            {isFirst && (
              <span className="mr-2 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest bg-emerald-400/20 text-emerald-300">
                Start here
              </span>
            )}
            <span className={`mr-2 rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${concept.badge}`}>
              Concept
            </span>
            <span className="text-sm font-bold text-white">{concept.title}</span>
          </div>
        </div>
        <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-white/6 px-4 pb-4 pt-3">
          <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-slate-300">{concept.body}</pre>
          <div className="mt-3 rounded-lg border border-white/8 bg-black/30 px-3 py-2">
            <span className="text-[9px] uppercase tracking-widest text-slate-600">Example  </span>
            <span className="font-mono text-xs text-cyan-300">{concept.example}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LearnPanel({ open }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/8 bg-[#07090f] transition-all duration-300 ease-in-out"
      style={{ maxHeight: open ? "2000px" : "0px", opacity: open ? 1 : 0, borderWidth: open ? undefined : 0 }}
    >
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Learn</p>
          <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[10px] font-bold text-violet-300">
            {CONCEPTS.length} concepts
          </span>
        </div>
        <p className="mb-4 text-[11px] leading-5 text-slate-400">
          Click any card to expand a plain-English explanation. Great for students and teachers. Start from the top if you're new!
        </p>
        <div className="space-y-2">
          {CONCEPTS.map((c, i) => <ConceptCard key={c.id} concept={c} isFirst={i === 0} />)}
        </div>
      </div>
    </div>
  );
}
