export default function Header({ apiOnline, saving, onHistoryToggle, historyOpen, onLearnToggle, learnOpen }) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-white/8 pb-4">
      <div className="min-w-0">
        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
          BitsVision
        </h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Where Every Number Reveals Its Binary Identity
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-1">
        {/* Learn */}
        <button
          onClick={onLearnToggle}
          className={`key-btn flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
            learnOpen
              ? "border-violet-400/40 bg-violet-400/15 text-violet-200"
              : "border-white/10 bg-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]"
          }`}
        >
          🎓 Learn
        </button>

        {/* History */}
        <button
          onClick={onHistoryToggle}
          className={`key-btn flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
            historyOpen
              ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
              : "border-white/10 bg-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.08]"
          }`}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 8 2.5zM7.25 4v4.31l2.97 1.71-.75 1.3L6 9.5V4h1.25z"/>
          </svg>
          History
        </button>

        {/* Server status */}
        <div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
          apiOnline
            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
            : "border-orange-500/25 bg-orange-500/10 text-orange-400"
        }`}>
          {saving ? (
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${apiOnline ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`} />
          )}
          <span className="hidden sm:inline">
            {saving ? "Saving…" : apiOnline ? "Server online" : "Offline mode"}
          </span>
        </div>
      </div>
    </header>
  );
}
