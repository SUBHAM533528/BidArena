import React, { useEffect, useState } from "react";
function getLeft(t) {
  const d = +new Date(t) - Date.now();
  return d <= 0 ? null : { d:Math.floor(d/86400000), h:Math.floor((d/3600000)%24), m:Math.floor((d/60000)%60), s:Math.floor((d/1000)%60) };
}
export default function CountdownTimer({ target }) {
  const [left, setLeft] = useState(getLeft(target));
  useEffect(() => { const id = setInterval(() => setLeft(getLeft(target)), 1000); return () => clearInterval(id); }, [target]);
  if (!target || !left) return null;
  return (
    <div className="flex gap-2">
      {[["D", left.d], ["H", left.h], ["M", left.m], ["S", left.s]].map(([l, v]) => (
        <div key={l} className="dark:bg-ink-900 bg-white rounded-lg border dark:border-ink-700 border-ink-200 px-3 py-2 text-center min-w-[52px]">
          <p className="font-mono text-lg font-bold text-gold-500 leading-none">{String(v).padStart(2,"0")}</p>
          <p className="text-2xs dark:text-ink-600 text-ink-400 mt-1 uppercase tracking-widest">{l}</p>
        </div>
      ))}
    </div>
  );
}
