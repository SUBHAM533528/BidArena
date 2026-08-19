import React, { useEffect, useState } from "react";
function getLeft(t) {
  const d = +new Date(t) - Date.now();
  return d <= 0 ? null : { d:Math.floor(d/86400000), h:Math.floor((d/3600000)%24), m:Math.floor((d/60000)%60), s:Math.floor((d/1000)%60) };
}
// `dark` renders explicit dark-on-dark boxes (used on the dark hero section of the
// landing page) independent of the app-wide theme, which is otherwise always light.
export default function CountdownTimer({ target, dark = false }) {
  const [left, setLeft] = useState(getLeft(target));
  useEffect(() => { const id = setInterval(() => setLeft(getLeft(target)), 1000); return () => clearInterval(id); }, [target]);
  if (!target || !left) return null;
  return (
    <div className="flex gap-2">
      {[["Days", left.d], ["Hrs", left.h], ["Min", left.m], ["Sec", left.s]].map(([l, v]) => (
        <div key={l} className={dark
          ? "bg-black/40 rounded-lg border border-gold-500/20 px-3.5 py-2.5 text-center min-w-[56px] backdrop-blur-sm"
          : "bg-white rounded-lg border border-ink-200 px-3 py-2 text-center min-w-[52px]"
        }>
          <p className={`font-mono font-bold leading-none ${dark ? "text-xl text-red-700" : "text-lg text-gold-500"}`}>{String(v).padStart(2,"0")}</p>
          <p className={`text-2xs mt-1 uppercase tracking-widest ${dark ? "text-ink-400" : "text-ink-400"}`}>{l}</p>
        </div>
      ))}
    </div>
  );
}
