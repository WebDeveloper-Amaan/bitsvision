const SOCIALS = [
  {
    label: "GitHub",
    href:  "https://github.com/WebDeveloper-Amaan",
    color: "hover:border-slate-400/50 hover:bg-slate-400/10 hover:text-slate-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href:  "https://www.linkedin.com/in/amaanahmedcoder",
    color: "hover:border-blue-400/50 hover:bg-blue-400/10 hover:text-blue-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href:  "https://www.instagram.com/coderamaan/",
    color: "hover:border-pink-400/50 hover:bg-pink-400/10 hover:text-pink-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href:  "https://amaanAhmed.dev.in",
    color: "hover:border-violet-400/50 hover:bg-violet-400/10 hover:text-violet-300",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

/* tiny animated bit strip */
const BITS = "10110010 11001010 01101101 10010110".replace(/\s/g, "").split("");

export default function Footer() {
  return (
    <footer className="mt-12 pb-8">

      {/* ── decorative divider ── */}
      <div className="relative mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="flex items-center gap-[3px]">
          {BITS.map((b, i) => (
            <span
              key={i}
              className={`inline-block h-[6px] w-[6px] rounded-sm transition-opacity ${
                b === "1"
                  ? "bg-cyan-400/40"
                  : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* ── main footer row ── */}
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">

        {/* Left — branding */}
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className="text-[9px] font-black uppercase tracking-[0.45em] text-slate-700">
            Built &amp; Designed by
          </p>
          <div className="flex items-center gap-2.5">
            {/* avatar-style monogram */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-white/10 font-black text-xs text-white">
              AA
            </div>
            <span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
              Amaan Ahmed
            </span>
          </div>
        </div>

        {/* Right — social icons */}
        <div className="flex flex-col items-center gap-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Find me on</p>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={`group flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-600 transition-all duration-200 active:scale-90 ${color}`}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* ── bottom micro line ── */}
      <p className="mt-6 text-center text-[9px] uppercase tracking-[0.35em] text-slate-800">
        © {new Date().getFullYear()} · BitsVision
      </p>

    </footer>
  );
}
