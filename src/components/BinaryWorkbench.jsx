import { memo } from "react";
import BitRail from "./BitRail.jsx";
import LiveConversionBar from "./LiveConversionBar.jsx";

function getBitInfo(display) {
  const n = Number(display);
  if (!Number.isInteger(n) || !Number.isFinite(n) || Math.abs(n) > 0xFFFFFFFF || n === 0) return null;
  const abs = Math.abs(n);
  const isNeg = n < 0;
  const bits = abs.toString(2);
  const popcount = bits.split("").filter(b => b === "1").length;
  const msb = bits.length - 1;
  const isPow2 = (abs & (abs - 1)) === 0;
  return { popcount, msb, isPow2, abs, isNeg, bitsNeeded: bits.length };
}

const STEP_COLORS = [
  "bg-cyan-400/20 text-cyan-300 border-cyan-400/20",
  "bg-violet-400/20 text-violet-300 border-violet-400/20",
  "bg-emerald-400/20 text-emerald-300 border-emerald-400/20",
];

const BITWISE_COLORS = {
  cyan:    { badge: "bg-cyan-400/15 text-cyan-300 border-cyan-400/30",    dot: "bg-cyan-400"    },
  violet:  { badge: "bg-violet-400/15 text-violet-300 border-violet-400/30",  dot: "bg-violet-400"  },
  rose:    { badge: "bg-rose-400/15 text-rose-300 border-rose-400/30",    dot: "bg-rose-400"    },
  amber:   { badge: "bg-amber-400/15 text-amber-300 border-amber-400/30",  dot: "bg-amber-400"   },
  emerald: { badge: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30", dot: "bg-emerald-400" },
};

function BitwiseOpRow({ ops }) {
  if (!ops || ops.length === 0) return null;
  return (
    <div className="mt-4 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.35em] text-slate-600">
        Bitwise operations used in this calculation
      </p>
      <div className="flex flex-wrap gap-2">
        {ops.map((op, i) => {
          const c = BITWISE_COLORS[op.color] || BITWISE_COLORS.cyan;
          return (
            <div
              key={i}
              title={op.detail}
              className={`group relative flex cursor-default items-start gap-2 rounded-xl border px-3 py-2 transition hover:brightness-110 ${c.badge}`}
            >
              {/* op symbol */}
              <span className="mt-0.5 shrink-0 rounded bg-black/20 px-1.5 py-0.5 font-mono text-[10px] font-black">
                {op.op}
              </span>
              {/* label */}
              <span className="text-[11px] font-semibold leading-4">{op.label}</span>
              {/* tooltip on hover */}
              {op.detail && (
                <div className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 hidden w-72 rounded-xl border border-white/10 bg-[#0d1117] p-3 shadow-xl group-hover:block">
                  <pre className="whitespace-pre-wrap font-mono text-[10px] leading-5 text-slate-300">{op.detail}</pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Operator divider between rows */
function OpDivider({ symbol }) {
  return (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/6" />
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] font-mono text-base font-black text-slate-200">
        {symbol}
      </span>
      <div className="h-px flex-1 bg-white/6" />
    </div>
  );
}

/* Phase status badge */
function PhaseBadge({ phase, operator }) {
  if (!phase || phase === "result") return null;
  if (phase === "a") return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/6 px-3 py-2">
      <span className="text-violet-400 text-sm">{operator}</span>
      <p className="text-[11px] text-violet-300">
        Operator <strong>{operator}</strong> pressed — now type the second number. Its bits will appear below.
      </p>
    </div>
  );
  if (phase === "ab") return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-2">
      <span className="animate-pulse text-cyan-400 text-sm">⚡</span>
      <p className="text-[11px] text-cyan-300">
        <strong>Live preview</strong> — bits update as you type. Press <strong>=</strong> to finalise and see the result row.
      </p>
    </div>
  );
  return null;
}

export default memo(function BinaryWorkbench({ model, display, expression, onBitFlip }) {
  const bitInfo = getBitInfo(display);
  const canFlip = model.rows.length === 1 && typeof onBitFlip === "function";
  const isLargeNumber = (() => { const n = Number(display); return Number.isFinite(n) && Math.abs(n) > 32767; })();
  const phase = model.phase;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-[#06090f] p-5 sm:p-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-white/6 pb-4">
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.45em] text-cyan-500/60">CPU Binary Pipeline</p>
          <h2 className="mt-1 text-lg font-black tracking-tight text-white">{model.title}</h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-400">{model.summary}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 text-center shrink-0">
          <p className="text-[9px] uppercase tracking-widest text-slate-600">bit width</p>
          <p className="font-mono text-base font-black text-white leading-none">
            {model.bitWidth}<span className="text-[10px] text-slate-500 font-normal">-bit</span>
          </p>
        </div>
      </div>

      {/* ── SECTION 1: Voltage Switches (TOP — most important) ── */}
      <div className="rounded-xl border border-violet-400/20 bg-white/[0.02] p-4">
        {/* Section heading */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-400/20 text-[10px] font-black text-violet-300">
              1
            </span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Voltage Switches — how CPU stores this in memory
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-slate-600 hidden sm:block">{expression}</span>
        </div>

        {/* What is this */}
        <div className="mb-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
          <p className="text-[11px] leading-5 text-slate-400">
            Each cell is one flip-flop — a transistor holding high voltage (1) or low voltage (0). Together they form a CPU register storing the value in two’s complement encoding.
          </p>
        </div>

        {/* Large number warning */}
        {isLargeNumber && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/6 px-3 py-2">
            <span className="text-amber-400">⚠</span>
            <p className="text-[11px] text-amber-300">Large number — using 32-bit representation. Values above 32,767 exceed 16-bit range.</p>
          </div>
        )}

        {/* Interactive hint */}
        {canFlip && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/6 px-3 py-2">
            <span className="text-base">👆</span>
            <p className="text-[11px] text-cyan-300">
              <strong>Interactive!</strong> Click any bit cell to flip it ON/OFF — the decimal number updates instantly.
            </p>
          </div>
        )}

        {/* Phase status */}
        <PhaseBadge phase={phase} operator={model.operator} />

        {/* ── The bit rows with operator dividers ── */}
        <div>
          {model.rows.map((row, i) => {
            const isLastRow = i === model.rows.length - 1;
            const isOutRow  = row.label === "OUT";
            return (
              <div key={row.label}>
                {/* = divider before OUT row */}
                {isOutRow && <OpDivider symbol="=" />}

                <BitRail
                  label={row.label}
                  bits={row.bits}
                  accent={row.accent}
                  onBitFlip={canFlip && i === 0 ? onBitFlip : undefined}
                />

                {/* operator divider only after A row (index 0) */}
                {i === 0 && !isLastRow && model.operator && (
                  <OpDivider symbol={model.operator === "x" ? "×" : model.operator} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bitwise operations used ── */}
        <BitwiseOpRow ops={model.bitwiseOps} />

        {/* Legend for multi-row */}
        {model.rows.length > 1 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-sm border border-cyan-400/30 bg-cyan-400/15" />Input A</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-sm border border-fuchsia-400/30 bg-fuchsia-400/15" />Input B</span>
            {phase === "result" && (
              <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-sm border border-emerald-400/30 bg-emerald-400/15" />Result (OUT)</span>
            )}
          </div>
        )}

        {/* How to read */}
        <div className="mt-3 rounded-lg border border-white/6 bg-white/[0.02] px-3 py-2">
          <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-slate-600">How to read this</p>
          <p className="text-[11px] leading-5 text-slate-500">
            Bits are weighted right-to-left as powers of 2 (2⁰, 2¹, 2²…). Sum all positions where bit=1. The MSB is the sign bit in two’s complement — if 1, the value is negative.
          </p>
        </div>
      </div>

      {/* ── SECTION 2: CPU steps — shown whenever something has been entered ── */}
      {(phase === "result" || phase === "a" || phase === "ab" || Number(display) !== 0) && (
        <div className="rounded-xl border border-emerald-400/20 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-black text-emerald-300">2</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">What the CPU just did — step by step</p>
          </div>
          <div className="flex flex-col gap-2">
            {model.steps.map((step, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex-1 rounded-xl border border-white/6 bg-white/[0.03] p-3 hover:border-white/12 hover:bg-white/[0.05] transition">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-black ${STEP_COLORS[i]}`}>
                      {i + 1}
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{step.label}</p>
                  </div>
                  <div className="space-y-1">
                    {step.text.split("\n").map((line, li) =>
                      line.trim() === "" ? null : (
                        <p key={li} className={`font-mono text-[10px] leading-5 ${
                          line.startsWith(" ") || /^[0-9]/.test(line.trim())
                            ? "text-slate-500 pl-2 border-l border-white/8"
                            : "text-slate-400"
                        }`}>{line}</p>
                      )
                    )}
                  </div>
                </div>
                {i < model.steps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <span className="text-slate-700 text-xs">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION 3: Live base conversion ── */}
      {Number(display) !== 0 && (
        <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-[10px] font-black text-cyan-300">3</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Live Base Conversion — click any box to copy
            </p>
          </div>
          <LiveConversionBar display={display} />
          <p className="mt-2 text-[11px] text-slate-500">
            Decimal (base 10) · Binary (base 2) · Hex (base 16) · Octal (base 8). Updates on every keypress.
          </p>
        </div>
      )}

      {/* ── SECTION 4: Bit inspector ── */}
      {bitInfo && (
        <div className="rounded-xl border border-white/6 bg-white/[0.02] p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-black text-amber-300">4</span>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Bit Inspector</p>
            {bitInfo.isNeg && (
              <span className="rounded-full border border-rose-400/20 bg-rose-400/8 px-2 py-0.5 text-[9px] text-rose-300">analysing |{bitInfo.abs}|</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/6 p-3">
              <p className="text-2xl font-black text-cyan-300 leading-none">{bitInfo.popcount}</p>
              <p className="mt-1 text-[11px] font-bold text-white">switches ON</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">How many 1-bits are lit up in the register</p>
            </div>
            <div className="rounded-xl border border-violet-400/20 bg-violet-400/6 p-3">
              <p className="text-2xl font-black text-violet-300 leading-none">{bitInfo.bitsNeeded}</p>
              <p className="mt-1 text-[11px] font-bold text-white">bits needed</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">Minimum switches to store this number</p>
            </div>
            <div className="rounded-xl border border-slate-400/20 bg-slate-400/5 p-3">
              <p className="text-2xl font-black text-slate-300 leading-none">{bitInfo.msb}</p>
              <p className="mt-1 text-[11px] font-bold text-white">highest bit</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">Position of the leftmost ON switch (counting from 0)</p>
            </div>
            <div className={`rounded-xl border p-3 ${bitInfo.isPow2 ? "border-emerald-400/25 bg-emerald-400/6" : "border-white/8 bg-white/[0.02]"}` }>
              <p className={`text-2xl font-black leading-none ${bitInfo.isPow2 ? "text-emerald-300" : "text-slate-600"}`}>
                {bitInfo.isPow2 ? "✓" : "✕"}
              </p>
              <p className="mt-1 text-[11px] font-bold text-white">power of 2</p>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                {bitInfo.isPow2 ? "Exactly one switch is ON — doubles are always powers of 2" : "More than one switch is ON"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <p className={`text-[11px] rounded-lg px-3 py-2 border ${
        model.bitWidth === 64
          ? "border-amber-400/15 bg-amber-400/5 text-amber-300/70"
          : "border-emerald-400/15 bg-emerald-400/5 text-emerald-300/70"
      }`}>
        {model.bitWidth === 64
          ? "⚠ IEEE-754 64-bit float — result has a decimal component. Integer inputs show two’s complement."
          : `✓ Signed ${model.bitWidth}-bit two’s complement. Each cell = one flip-flop in CPU memory.`}
      </p>
    </section>
  );
});
