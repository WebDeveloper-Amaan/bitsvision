import { memo } from "react";

function getInlineBin(display) {
  const n = Number(display);
  if (!Number.isFinite(n) || !Number.isInteger(n) || Math.abs(n) > 255) return null;
  return Math.abs(n).toString(2).padStart(8, "0");
}

function getInlineHex(display) {
  const n = Number(display);
  if (!Number.isFinite(n) || !Number.isInteger(n) || Math.abs(n) > 0xFFFF) return null;
  return (n < 0 ? "-" : "") + "0x" + Math.abs(n).toString(16).toUpperCase().padStart(2, "0");
}

function getFontSize(str) {
  const len = str.length;
  if (len <= 9)  return "text-5xl";
  if (len <= 13) return "text-4xl";
  if (len <= 17) return "text-3xl";
  return "text-2xl";
}

export default memo(function CalculatorDisplay({ display, expression, saving }) {
  const binPreview = getInlineBin(display);
  const hexPreview = getInlineHex(display);
  const fontSize   = getFontSize(display);

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-[#050c18]">
      {/* Expression bar */}
      <div className="border-b border-white/6 px-4 py-2 min-h-[32px] flex items-center justify-end">
        <p className="truncate text-right text-[11px] font-medium tracking-widest text-slate-500 uppercase">
          {expression}
        </p>
      </div>

      {/* Main number */}
      <div className="px-4 pt-3 pb-2">
        <output className={`display-number block w-full text-right font-mono font-black tracking-tight text-white ${fontSize}`}>
          {display}
        </output>
      </div>

      {/* Inline binary row */}
      {binPreview && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-end gap-0.5">
            <span className="mr-2 text-[9px] uppercase tracking-[0.3em] text-slate-600">bin</span>
            {binPreview.split("").map((bit, i) => (
              <span
                key={i}
                className={`bit-cell flex h-[18px] w-[18px] items-center justify-center rounded text-[9px] font-black ${
                  bit === "1"
                    ? "bg-cyan-400/25 text-cyan-300 border border-cyan-400/35"
                    : "bg-white/[0.03] text-slate-700 border border-white/6"
                }`}
              >
                {bit}
              </span>
            ))}
            {hexPreview && (
              <span className="ml-3 font-mono text-[11px] font-bold text-violet-400/80">{hexPreview}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/6 px-4 py-1.5">
        <span className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">decimal input</span>
        {saving ? (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.25em] text-cyan-500 animate-pulse font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            saving…
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] text-cyan-500/70 font-semibold">
            ↑ live binary
            <span className="text-cyan-500/50">bits</span>
          </span>
        )}
      </div>
    </div>
  );
});
