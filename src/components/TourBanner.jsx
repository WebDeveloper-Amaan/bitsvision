import { useState, useEffect } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

function getSteps(isMobile) {
  const panel = isMobile ? "below the calculator" : "on the right side";
  const scroll = isMobile ? " (scroll down to see it)" : "";

  return [
    {
      icon: "👋",
      title: "Welcome to BitsVision!",
      desc: "This app shows you what happens inside your computer when it does math. Don't worry — you don't need to know anything about computers to use it!",
      hint: null,
      hintLabel: null,
      badge: "bg-cyan-400/15 text-cyan-300",
      badgeText: "Hello! 👋",
      border: "border-cyan-400/20",
      glow: "from-cyan-950/50 to-[#06090f]",
    },
    {
      icon: "🔢",
      title: "Type a number on the keypad",
      desc: `Just tap the number buttons — exactly like a phone calculator. As you type, the binary panel ${panel} shows that number as a pattern of 1s and 0s. That's how your computer stores numbers in memory${scroll}.`,
      hint: "42",
      hintLabel: "Try typing",
      badge: "bg-cyan-400/15 text-cyan-300",
      badgeText: "Step 1 of 4",
      border: "border-cyan-400/20",
      glow: "from-cyan-950/50 to-[#06090f]",
    },
    {
      icon: "➕",
      title: "Do a calculation",
      desc: `Tap  +  −  ×  or  ÷,  type another number, then tap  =.  The binary panel ${panel}${scroll} shows the exact steps your computer took to do that calculation — all in 1s and 0s. Like seeing inside the machine!`,
      hint: "5  +  3  =",
      hintLabel: "Try this",
      badge: "bg-violet-400/15 text-violet-300",
      badgeText: "Step 2 of 4",
      border: "border-violet-400/20",
      glow: "from-violet-950/50 to-[#06090f]",
    },
    {
      icon: "🔀",
      title: "Tap a bit to flip it",
      desc: `See those little boxes with 1s and 0s ${panel}${scroll}? You can tap any of them! Tapping a 0 turns it into a 1, and tapping a 1 turns it into a 0. Watch the number on the calculator change — that's exactly how a computer changes a value in memory.`,
      hint: isMobile ? "Scroll down, then tap any glowing box" : "Click any glowing box on the right panel",
      hintLabel: "Try it",
      badge: "bg-emerald-400/15 text-emerald-300",
      badgeText: "Step 3 of 4",
      border: "border-emerald-400/20",
      glow: "from-emerald-950/50 to-[#06090f]",
    },
    {
      icon: "🎓",
      title: "Want to learn more?",
      desc: "Tap the  🎓 Learn  button at the top of the page. It opens simple explanation cards — what is binary? what is hex? how does a computer add numbers? All written in plain English, no experience needed.",
      hint: "Look for the 🎓 Learn button at the top",
      hintLabel: "Find it here",
      badge: "bg-amber-400/15 text-amber-300",
      badgeText: "Step 4 of 4",
      border: "border-amber-400/20",
      glow: "from-amber-950/50 to-[#06090f]",
    },
  ];
}

export default function TourBanner({ onDismiss }) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const STEPS = getSteps(isMobile);
  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className={`relative w-full max-w-lg overflow-hidden rounded-2xl border ${s.border} bg-gradient-to-br ${s.glow} shadow-2xl shadow-black/60`}>

        {/* Progress bar */}
        <div className="h-1 w-full bg-white/5">
          <div
            className="h-1 bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-7">
          {/* Badge */}
          <span className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest ${s.badge}`}>
            {s.badgeText}
          </span>

          {/* Icon + Title */}
          <div className="mt-4 flex items-start gap-4">
            <span className="text-5xl leading-none">{s.icon}</span>
            <h2 className="text-xl font-black leading-tight tracking-tight text-white">
              {s.title}
            </h2>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {s.desc}
          </p>

          {/* Hint */}
          {s.hint && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">{s.hintLabel} →</span>
              <span className="font-mono text-sm font-bold text-cyan-300">{s.hint}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`block rounded-full transition-all duration-300 ${
                    i === step ? "w-5 h-1.5 bg-cyan-400" : "w-1.5 h-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {isFirst ? (
                <button
                  onClick={onDismiss}
                  className="key-btn rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-400"
                >
                  Skip
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="key-btn rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  ← Back
                </button>
              )}
              {isLast ? (
                <button
                  onClick={onDismiss}
                  className="key-btn rounded-xl border border-cyan-400/40 bg-cyan-400/20 px-5 py-2 text-xs font-black text-cyan-200 hover:bg-cyan-400/30"
                >
                  Let's go! 🚀
                </button>
              ) : (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="key-btn rounded-xl border border-cyan-400/40 bg-cyan-400/20 px-5 py-2 text-xs font-black text-cyan-200 hover:bg-cyan-400/30"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
