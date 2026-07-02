import { memo } from "react";

const ACCENT = {
  cyan:    {
    label:   "text-cyan-300 bg-cyan-400/15 border-cyan-400/20",
    on:      "border-cyan-400/60 bg-cyan-400/25 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.25)]",
    off:     "border-white/8 bg-white/[0.03] text-slate-700",
    pow:     "text-cyan-700",
    contrib: "text-cyan-600",
    sign:    "border-rose-400/60 bg-rose-400/20 text-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.25)]",
    signOff: "border-rose-400/20 bg-rose-400/6 text-rose-800",
  },
  fuchsia: {
    label:   "text-fuchsia-300 bg-fuchsia-400/15 border-fuchsia-400/20",
    on:      "border-fuchsia-400/60 bg-fuchsia-400/25 text-fuchsia-100 shadow-[0_0_10px_rgba(217,70,239,0.25)]",
    off:     "border-white/8 bg-white/[0.03] text-slate-700",
    pow:     "text-fuchsia-800",
    contrib: "text-fuchsia-700",
    sign:    "border-rose-400/60 bg-rose-400/20 text-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.25)]",
    signOff: "border-rose-400/20 bg-rose-400/6 text-rose-800",
  },
  emerald: {
    label:   "text-emerald-300 bg-emerald-400/15 border-emerald-400/20",
    on:      "border-emerald-400/60 bg-emerald-400/25 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.25)]",
    off:     "border-white/8 bg-white/[0.03] text-slate-700",
    pow:     "text-emerald-800",
    contrib: "text-emerald-600",
    sign:    "border-rose-400/60 bg-rose-400/20 text-rose-200 shadow-[0_0_10px_rgba(251,113,133,0.25)]",
    signOff: "border-rose-400/20 bg-rose-400/6 text-rose-800",
  },
};

function bitsToDecimal(arr) {
  const len = arr.length;
  if (len >= 8 && arr[0] === "1") {
    const inv = arr.map(b => b === "1" ? "0" : "1").join("");
    return -(parseInt(inv, 2) + 1);
  }
  return parseInt(arr.join(""), 2) || 0;
}

function powLabel(idx) {
  const val = Math.pow(2, idx);
  if (val <= 512) return String(val);
  return `2^${idx}`;
}

/* One bit column: power label → cell → value contribution */
const BitCell = memo(function BitCell({ bit, bitIdx, isSign, p, interactive, onFlip }) {
  const isOn = bit === "1";
  const cellStyle = isSign ? (isOn ? p.sign : p.signOff) : (isOn ? p.on : p.off);
  const contrib = isOn && !isSign ? powLabel(bitIdx) : null;

  return (
    <div className="flex flex-col items-center" style={{ minWidth: 24 }}>
      {/* ── power label ── */}
      <span className={`mb-0.5 block text-center font-mono text-[7px] leading-none ${isSign ? "text-rose-700" : p.pow}`}>
        {isSign ? "±" : powLabel(bitIdx)}
      </span>

      {/* ── bit cell ── */}
      <div
        onClick={interactive ? onFlip : undefined}
        title={interactive ? (isSign ? "Sign bit — flip to negate" : `Bit ${bitIdx} = ${powLabel(bitIdx)} — click to flip`) : undefined}
        className={`bit-cell flex h-7 w-full items-center justify-center rounded border text-[11px] font-black select-none transition-all sm:h-10 sm:text-sm
          ${cellStyle} ${interactive ? "cursor-pointer hover:scale-110 hover:z-10 relative" : ""}`}
      >
        {bit}
      </div>

      {/* ── value contribution ── */}
      <span className={`mt-0.5 block text-center font-mono text-[7px] leading-none ${contrib ? p.contrib : "text-transparent"}`}>
        {contrib ? `+${contrib}` : "+0"}
      </span>
    </div>
  );
});

export default memo(function BitRail({ label, bits, accent = "cyan", onBitFlip }) {
  const p = ACCENT[accent] || ACCENT.cyan;
  const arr = bits.replace(/\s/g, "").split("");
  const len = arr.length;
  const interactive = typeof onBitFlip === "function";
  const decimal = bitsToDecimal(arr);
  const isNegative = arr[0] === "1" && len >= 8;

  const handleFlip = (i) => {
    const f = [...arr];
    f[i] = f[i] === "1" ? "0" : "1";
    onBitFlip(bitsToDecimal(f));
  };

  /* Group into nibbles of 4, left-to-right */
  const nibbles = [];
  for (let i = 0; i < len; i += 4) nibbles.push(arr.slice(i, i + 4));

  return (
    <div className="space-y-2">

      {/* ── header row ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${p.label}`}>
            {label}
          </span>
          <span className="text-[10px] text-slate-500">{len}-bit register</span>
          {interactive && (
            <span className="rounded-md border border-cyan-400/15 bg-cyan-400/8 px-2 py-0.5 text-[9px] text-cyan-500">
              👆 click any cell to flip
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-widest text-slate-600">= decimal</span>
          <span className={`font-mono text-sm font-black ${isNegative ? "text-rose-400" : "text-white"}`}>
            {decimal}
          </span>
        </div>
      </div>

      {/* ── legend ── */}
      <div className="flex flex-wrap items-center gap-3 text-[9px] text-slate-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-cyan-400/40 bg-cyan-400/20" />
          1 = ON (high voltage)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm border border-white/8 bg-white/[0.03]" />
          0 = OFF (low voltage)
        </span>
        {len >= 8 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm border border-rose-400/30 bg-rose-400/15" />
            ± sign bit
          </span>
        )}
      </div>

      {/* ── bit grid: nibbles separated by a thin line ── */}
      <div className="overflow-x-auto">
        <div className="flex items-stretch gap-0 w-max">
          {nibbles.map((nibble, ni) => {
            const globalBase = ni * 4;
            return (
              <div key={ni} className="flex items-stretch">
                {/* separator between nibbles */}
                {ni > 0 && (
                  <div className="mx-1 w-px self-stretch bg-white/8 rounded-full" />
                )}
                <div className="flex items-end gap-0.5 sm:gap-1">
                  {nibble.map((bit, ci) => {
                    const globalIdx = globalBase + ci;
                    const bitIdx = len - 1 - globalIdx;
                    return (
                      <BitCell
                        key={ci}
                        bit={bit}
                        bitIdx={bitIdx}
                        isSign={globalIdx === 0 && len >= 8}
                        p={p}
                        interactive={interactive}
                        onFlip={() => handleFlip(globalIdx)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── hex row: one value per nibble, aligned under each group ── */}
      {len >= 8 && (
        <div className="overflow-x-auto">
          <div className="flex items-center gap-0 w-max">
            {nibbles.map((nibble, ni) => {
              const hex = parseInt(nibble.join(""), 2).toString(16).toUpperCase();
              const nibbleW = nibble.length * 25 + (nibble.length - 1) * 2; // mobile
              const nibbleWSm = nibble.length * 37 + (nibble.length - 1) * 4; // sm+
              return (
                <div key={ni} className="flex items-center">
                  {ni > 0 && <div className="mx-1 w-px h-3 bg-white/8" />}
                  <div className="flex justify-center" style={{ width: nibbleW }}>
                    <span className="font-mono text-[9px] text-slate-600">0x{hex}</span>
                  </div>
                </div>
              );
            })}
            <span className="ml-3 text-[9px] text-slate-700">← hex per nibble</span>
          </div>
        </div>
      )}

      {/* ── negative number explanation ── */}
      {isNegative && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-400/15 bg-rose-400/5 px-3 py-2">
          <span className="text-rose-400 text-xs">±</span>
          <p className="text-[10px] leading-4 text-rose-300/80">
            Sign bit is <strong>1</strong> → negative number in two's complement. CPU reads this as <strong>{decimal}</strong>.
          </p>
        </div>
      )}
    </div>
  );
});
