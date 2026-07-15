"use client";

export default function Loading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_40%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]">

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]" />
      <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-6%] h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-6">

        {/* Glass Card */}
        <div className="flex h-56 w-56 items-center justify-center rounded-4xl border border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-[0_30px_80px_rgba(2,6,23,0.45)]">

          <div className="relative flex items-center justify-center">

            {/* Outer Ring */}
            <div className="absolute h-28 w-28 rounded-full border-2 border-cyan-400/20" />

            {/* Spinning Ring */}
            <div className="absolute h-28 w-28 rounded-full border-[3px] border-transparent border-t-cyan-400 border-r-sky-400 animate-spin" />

            {/* Inner Ring */}
            <div
              className="absolute h-20 w-20 rounded-full border-2 border-dashed border-fuchsia-400/60"
              style={{
                animation: "spin 3s linear infinite reverse",
              }}
            />

            {/* Center Orb */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 shadow-[0_0_35px_rgba(34,211,238,0.6)] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}