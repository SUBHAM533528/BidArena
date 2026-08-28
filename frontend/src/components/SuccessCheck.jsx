import React from "react";

// Classic "payment successful" style animation: a glowing ring pulses
// out once, the circle outline draws itself, then the checkmark draws
// in right after. Pure SVG + CSS (see .animate-success-* in index.css)
// — no animation library needed.
export default function SuccessCheck({ size = 110, color = "#22c55e" }) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full animate-success-glow"
        style={{ background: color }}
      />
      <svg viewBox="0 0 100 100" width={size} height={size} className="relative z-10">
        <circle
          cx="50" cy="50" r="44"
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          pathLength="100" strokeDasharray="100" strokeDashoffset="100"
          className="animate-success-circle"
        />
        <path
          d="M30 52 L44 66 L72 36"
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          pathLength="100" strokeDasharray="100" strokeDashoffset="100"
          className="animate-success-check"
        />
      </svg>
    </div>
  );
}
