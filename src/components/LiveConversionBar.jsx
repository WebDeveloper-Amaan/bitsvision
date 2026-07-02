import { memo, useState } from "react";

function toInt(display) {
  const n = Number(display);
  return (!Number.isFinite(n) || Number.isNaN(n)) ? null : n;
}

function fmtBin(n) {
  if (!Number.isInteger(n)) return { val: "float — see bit lane below", short: true };
  const abs = Math.abs(n);
  if (abs > 0xFFFFFFFF) return { val: "overflow", short: true };
  const raw = abs.toString(2);
  const padded = raw.padStart(Math.ceil(raw.length / 4) * 4, "0");
  return { val: (n < 0 ? "-" : "") + padded.replace(/(.{4})/g, "$1 ").trim(), short: false };
}
function fmtHex(n) {
  if (!Number.isInteger(n)) return "float";
  const abs = Math.abs(n);
  if (abs > 0xFFFFFFFF) return "overflow";
  return (n < 0 ? "-" : "") + "0x" + abs.toString(16).toUpperCase();
}
function fmtOct(n) {
  if (!Number.isInteger(n)) return "float";
  const abs = Math.abs(n);
  if (abs > 0xFFFFFFFF) return "overflow";
  return (n < 0 ? "-" : "") + "0o" + abs.toString(8);
}

const BOX = [
  { id: "dec", label: "DEC", desc: "Base 10",  border: "border-slate-500/25",  bg: "bg-slate-400/6",   badge: "bg-slate-600/40 text-slate-300",  text: "text-white" },
  { id: "bin", label: "BIN", desc: "Base 2",   border: "border-cyan-400/25",   bg: "bg-cyan-400/6",    badge: "bg-cyan-400/20 text-cyan-300",    text: "text-cyan-100" },
  { id: "hex", label: "HEX", desc: "Base 16",  border: "border-violet-400/25", bg: "bg-violet-400/6",  badge: "bg-violet-400/20 text-violet-300",text: "text-violet-100" },
  { id: "oct", label: "OCT", desc: "Base 8",   border: "border-amber-400/25",  bg: "bg-amber-400/6",   badge: "bg-amber-400/20 text-amber-300",  text: "text-amber-100" },
];

function CopyBox({ id, label, desc, border, bg, badge, text, value }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!value || value === "—") return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }).catch(() => {});
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${label} value`}
      className={`group relative rounded-xl border ${border} ${bg} px-3 py-2.5 text-left transition hover:brightness-110 active:scale-95`}
    >
      {copied && <span className="copy-flash absolute inset-0 rounded-xl" />}
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${badge}`}>{label}</span>
          <span className="text-[9px] text-slate-600">{desc}</span>
        </div>
        <span className={`text-[9px] transition ${copied ? "text-cyan-400" : "text-slate-700 group-hover:text-slate-500"}`}>
          {copied ? "✓ copied" : "copy"}
        </span>
      </div>
      <p className={`font-mono text-xs font-bold leading-5 break-all ${text}`}>{value}</p>
    </button>
  );
}

export default memo(function LiveConversionBar({ display }) {
  const n = toInt(display);
  const missing = "—";

  const bin = n === null ? missing : fmtBin(n).val;
  const hex = n === null ? missing : fmtHex(n);
  const oct = n === null ? missing : fmtOct(n);

  const values = { dec: n === null ? "Error" : String(n), bin, hex, oct };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {BOX.map((box) => (
        <CopyBox key={box.id} {...box} value={values[box.id]} />
      ))}
    </div>
  );
});
