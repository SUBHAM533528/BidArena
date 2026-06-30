export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold:  { 50:"#fffbeb",100:"#fef3c7",200:"#fde68a",300:"#fcd34d",400:"#fbbf24",500:"#f59e0b",600:"#d97706",700:"#b45309" },
        jade:  { 400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d" },
        flame: { 400:"#f87171",500:"#ef4444",600:"#dc2626" },
        ink: {
          50:"#f8fafc", 100:"#f0f4f8", 200:"#e2e8f0", 300:"#cbd5e1",
          400:"#94a3b8", 500:"#64748b", 600:"#475569", 700:"#334155",
          800:"#1e293b", 850:"#172033", 900:"#0f1624", 950:"#090e18",
        },
      },
      fontFamily: {
        display: ["'Oswald'","sans-serif"],
        body:    ["'Inter'","sans-serif"],
        mono:    ["'JetBrains Mono'","monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem",{ lineHeight:"1rem" }],
      },
      boxShadow: {
        "card-dark":  "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
        "card-light": "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        "card-light-hover":"0 4px 16px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
        "glow-gold":  "0 0 0 3px rgba(245,158,11,0.2)",
        "inner-sm":   "inset 0 1px 2px rgba(0,0,0,0.2)",
      },
      animation: {
        "stamp-in":   "stampIn 0.42s cubic-bezier(.15,1.3,.4,1) forwards",
        "slide-down": "slideDown 0.2s ease forwards",
        "fade-up":    "fadeUp 0.35s ease forwards",
        "ring-pulse": "ringPulse 1.2s ease-out infinite",
        "shimmer":    "shimmer 1.8s infinite",
      },
      keyframes: {
        stampIn:  { "0%":{transform:"scale(2.2) rotate(-5deg)",opacity:0}, "60%":{transform:"scale(0.95) rotate(-5deg)",opacity:1}, "100%":{transform:"scale(1) rotate(-5deg)",opacity:1} },
        slideDown:{ "0%":{opacity:0,transform:"translateY(-6px)"}, "100%":{opacity:1,transform:"translateY(0)"} },
        fadeUp:   { "0%":{opacity:0,transform:"translateY(10px)"}, "100%":{opacity:1,transform:"translateY(0)"} },
        ringPulse:{ "0%":{boxShadow:"0 0 0 0 rgba(239,68,68,0.5)"}, "100%":{boxShadow:"0 0 0 10px rgba(239,68,68,0)"} },
        shimmer:  { "0%":{backgroundPosition:"-400px 0"}, "100%":{backgroundPosition:"400px 0"} },
      },
    },
  },
  plugins: [],
};
