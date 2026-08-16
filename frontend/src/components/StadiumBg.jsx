/**
 * Layered stadium atmosphere — photo + soft light gradient + subtle SVG depth.
 */
export default function StadiumBg({ opacity = 1, showPhoto = true }) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none select-none overflow-hidden" style={{ opacity }}>
      {showPhoto && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-20 animate-[pulse_12s_ease-in-out_infinite_alternate]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1531415077968-de08abad10ab?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-br from-white via-ink-50 to-[#f4f1ea]" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.10),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(34,197,94,0.05),transparent)]" />

      <svg
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="absolute bottom-0 left-0 w-full h-[55vh] opacity-[0.12]"
      >
        <defs>
          <linearGradient id="fieldG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f8fafc" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="720" cy="680" rx="520" ry="180" fill="url(#fieldG)" />
        <ellipse
          cx="720"
          cy="670"
          rx="480"
          ry="160"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          strokeDasharray="8 6"
        />
      </svg>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#ffffff_78%)]" />
    </div>
  );
}
