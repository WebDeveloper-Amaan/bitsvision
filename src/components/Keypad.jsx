import { memo } from "react";

const OPERATORS  = new Set(["/", "x", "-", "+"]);
const UTILITY    = new Set(["AC", "DEL", "%"]);
const EXTRA_MATH = new Set(["√", "x²", "1/x"]);

function keyStyle(label, isActive, isFlashing) {
  const isOp    = OPERATORS.has(label);
  const isEq    = label === "=";
  const isUtil  = UTILITY.has(label);
  const isDel   = label === "AC";
  const isExtra = EXTRA_MATH.has(label);

  let base;
  if (isEq)     base = "bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-900/50 hover:bg-cyan-400";
  else if (isOp)    base = "border-cyan-400/25 bg-cyan-400/12 text-cyan-200 hover:bg-cyan-400/22";
  else if (isDel)   base = "border-red-400/25 bg-red-500/12 text-red-300 hover:bg-red-500/20";
  else if (isUtil)  base = "border-violet-400/22 bg-violet-400/10 text-violet-200 hover:bg-violet-400/18";
  else if (isExtra) base = "border-amber-400/22 bg-amber-400/10 text-amber-200 hover:bg-amber-400/18";
  else              base = "border-white/8 bg-white/[0.06] text-slate-100 hover:bg-white/[0.11]";

  const active  = isActive  ? "ring-2 ring-cyan-300/50 ring-offset-1 ring-offset-[#07090f]" : "";
  const flashing = isFlashing ? "!bg-cyan-400/35 !border-cyan-300/60" : "";
  return `key-btn rounded-xl border font-bold transition ${base} ${active} ${flashing}`;
}

const Key = memo(function Key({ label, onPress, isActive, isFlashing, tall }) {
  return (
    <button
      type="button"
      onClick={() => onPress(label)}
      title={label === "√" ? "Square root" : label === "x²" ? "Square" : label === "1/x" ? "Reciprocal" : undefined}
      className={`${keyStyle(label, isActive, isFlashing)} ${tall ? "row-span-2" : ""} h-12 w-full text-sm sm:h-[52px]`}
    >
      {label}
    </button>
  );
});

export default memo(function Keypad({ onPress, activeOperator, flashKey }) {
  /* Manual grid so = can span 2 rows */
  return (
    <div className="grid grid-cols-4 gap-1.5" style={{ gridTemplateRows: "repeat(6, auto)" }}>
      {/* Row 0 — utility */}
      {["AC","DEL","%","/"].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={activeOperator === k} isFlashing={flashKey === k} />
      ))}

      {/* Row 1 — extra math */}
      {["√","x²","1/x","x"].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={activeOperator === k} isFlashing={flashKey === k} />
      ))}

      {/* Rows 2-5: digits + operators, = spans rows 4-5 in col 4 */}
      {/* Row 2 */}
      {["7","8","9"].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={false} isFlashing={flashKey === k} />
      ))}
      <Key label="-" onPress={onPress} isActive={activeOperator === "-"} isFlashing={flashKey === "-"} />

      {/* Row 3 */}
      {["4","5","6"].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={false} isFlashing={flashKey === k} />
      ))}
      <Key label="+" onPress={onPress} isActive={activeOperator === "+"} isFlashing={flashKey === "+"} />

      {/* Row 4 */}
      {["1","2","3"].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={false} isFlashing={flashKey === k} />
      ))}
      {/* = row-span-2 */}
      <button
        type="button"
        onClick={() => onPress("=")}
        style={{ gridRow: "span 2" }}
        className={`key-btn rounded-xl border font-bold bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-900/50 hover:bg-cyan-400 text-sm ${flashKey === "=" ? "!bg-cyan-300 !border-cyan-200" : ""}`}
      >=</button>

      {/* Row 5 */}
      {["+/-","0","."].map(k => (
        <Key key={k} label={k} onPress={onPress} isActive={false} isFlashing={flashKey === k} />
      ))}
    </div>
  );
});
