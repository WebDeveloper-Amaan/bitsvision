export default function HistoryPanel({ open, history, onClear, onDelete, onRecall, apiOnline }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-white/8 bg-[#07090f] transition-all duration-300 ease-in-out"
      style={{ maxHeight: open ? "380px" : "0px", opacity: open ? 1 : 0, borderWidth: open ? undefined : 0 }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">History</p>
            {history.length > 0 && (
              <span className="rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                {history.length}
              </span>
            )}
            {!apiOnline && (
              <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-2 py-0.5 text-[9px] font-bold text-orange-400">
                offline
              </span>
            )}
          </div>
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="key-btn rounded-lg border border-red-400/20 bg-red-400/8 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-400/15"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Offline warning — only when no history to show */}
        {!apiOnline && history.length === 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-orange-400/20 bg-orange-400/6 px-3 py-2">
            <span className="text-orange-400">⚠</span>
            <p className="text-[10px] text-orange-300">Server offline — history not persisted. Start the server to save history.</p>
          </div>
        )}

        {/* Keyboard hint */}
        <p className="mb-2 text-[9px] text-slate-700">
          Tip: Use keyboard to type — Enter = , Backspace = DEL, Escape = AC
        </p>

        {/* List */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <span className="text-2xl opacity-30">📋</span>
            <p className="text-xs text-slate-600">No calculations yet.</p>
            <p className="text-[10px] text-slate-700">Press = to save a result.</p>
          </div>
        ) : (
          <div className="relative">
            <ul className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {history.map((entry) => (
                <li
                  key={entry._id}
                  className="group flex items-center gap-2 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2 hover:border-cyan-400/20 hover:bg-cyan-400/6 transition cursor-pointer"
                  onClick={() => onRecall(entry)}
                  title="Click to recall this result"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-slate-300">{entry.expression}</p>
                    <p className="mt-0.5 text-[9px] text-slate-600">{entry.bitWidth}-bit · {new Date(entry.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="hidden text-[9px] text-cyan-600 group-hover:block">recall</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(entry._id); }}
                      className="key-btn rounded-md p-1 text-slate-700 hover:text-red-400"
                      aria-label="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {/* Scroll fade hint */}
            {history.length > 4 && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-xl bg-gradient-to-t from-[#07090f] to-transparent" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
