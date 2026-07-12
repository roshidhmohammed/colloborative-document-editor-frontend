"use-client"

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-100">

      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.06)_50%,transparent_100%)] opacity-60" />
      <div className="absolute left-[-8%] top-[-10%] h-64 w-64 rounded-full bg-cyan-400/25 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-6%] h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl rounded-4xl border border-white/15 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
                Booting your workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Preparing your collaborative editor
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-300 sm:text-lg">
                We’re setting up the experience, syncing your documents, and making sure everything feels instant.
              </p>
            </div>

            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10">
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-300/70"
                style={{ animation: "spin-slow 2.8s linear infinite" }}
              />
              <div
                className="h-12 w-12 rounded-full bg-linear-to-br from-cyan-400 via-sky-500 to-fuchsia-500 shadow-lg shadow-cyan-500/30"
                style={{ animation: "float 2.6s ease-in-out infinite" }}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">Document sync</span>
                <span className="text-sm text-slate-400">83%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-[83%] rounded-full bg-linear-to-r from-cyan-400 via-sky-500 to-fuchsia-500 transition-all duration-500" />
              </div>

              <div className="mt-5 space-y-3">
                {["Authenticating your session", "Loading recent docs", "Connecting collaborators"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/80 to-slate-800/60 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Live preview</p>
              <div className="mt-4 space-y-3">
                <div className="h-3 w-20 rounded-full bg-slate-700" />
                <div className="h-3 w-full rounded-full bg-slate-800" />
                <div className="h-3 w-5/6 rounded-full bg-slate-800" />
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <div className="h-2.5 w-16 rounded-full bg-slate-700" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
