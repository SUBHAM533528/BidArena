/**
 * Layered stadium atmosphere — photo + gradient + subtle SVG depth.
 */
export default function StadiumBg({ opacity = 1, showPhoto = true }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden" style={{ opacity }}>
      {showPhoto && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-[pulse_12s_ease-in-out_infinite_alternate]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1531415077968-de08abad10ab?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat mix-blend-soft-light opacity-30"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1624526267662-126a6bffdf0a?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-900/92 to-[#0c1424]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.14),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(34,197,94,0.06),transparent)]" />

      <svg
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute bottom-0 left-0 w-full h-[55vh] opacity-[0.18]"
      >
        <defs>
          <linearGradient id="fieldG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0f1624" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="720" cy="680" rx="520" ry="180" fill="url(#fieldG)" />
        <ellipse
          cx="720"
          cy="670"
          rx="480"
          ry="160"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          strokeDasharray="8 6"
        />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#090e18_75%)]" />
    </div>
  );
}
