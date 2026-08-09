import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

/**
 * Infinite-loop carousel.
 * Technique: we render [last, ...slides, first] — the clones at each end.
 * When the user lands on a clone we silently snap to the real slide.
 * Result: seamless forward loop AND backward loop, every direction smooth.
 */
export default function BannerCarousel({ banners = [] }) {
  const total = banners.length;

  // Nothing to show
  if (total === 0) return null;

  // Single banner — just show it, no controls
  if (total === 1) {
    const b = banners[0];
    return (
      <div className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 500, maxHeight: 700 }}>
        <div className="absolute inset-0"
          style={{ backgroundImage:`url(${b.image})`, backgroundSize:"cover", backgroundPosition:"center" }}/>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"/>
        {(b.title||b.subtitle||b.link) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            {b.title    && <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 drop-shadow-lg">{b.title}</h1>}
            {b.subtitle && <p className="text-base sm:text-xl text-white/80 max-w-2xl mb-8 drop-shadow">{b.subtitle}</p>}
            {b.link && (
              <Link to={b.link} className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-lg transition shadow-lg">
                Learn More <i className="fa-solid fa-arrow-right ml-1.5"/>
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  // Build the extended list: [last, 0, 1, 2, ..., last, 0]
  const slides = [banners[total - 1], ...banners, banners[0]];
  // Real slides live at indices 1 … total in the extended list
  // We start at index 1 (= banners[0])
  const [index,    setIndex]    = useState(1);          // position in slides[]
  const [animated, setAnimated] = useState(true);        // CSS transition on/off
  const timerRef  = useRef(null);
  const lockRef   = useRef(false);                        // prevent rapid clicks

  const goTo = useCallback((nextIndex, withAnim = true) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setAnimated(withAnim);
    setIndex(nextIndex);
    // After transition ends, check if we landed on a clone and silently snap
    setTimeout(() => {
      setIndex(idx => {
        if (idx === 0) {           // landed on clone of last → snap to real last
          setAnimated(false);
          return total;
        }
        if (idx === total + 1) {   // landed on clone of first → snap to real first
          setAnimated(false);
          return 1;
        }
        return idx;
      });
      // allow next click after a short buffer
      setTimeout(() => { lockRef.current = false; }, 60);
    }, 520);
  }, [total]);

  const next = useCallback(() => goTo(index + 1, true), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1, true), [index, goTo]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next]);

  // Reset auto-timer when user manually navigates
  const manualNext = () => {
    clearInterval(timerRef.current);
    next();
    timerRef.current = setInterval(next, 5000);
  };
  const manualPrev = () => {
    clearInterval(timerRef.current);
    prev();
    timerRef.current = setInterval(next, 5000);
  };
  const manualDot = (realIdx) => {
    clearInterval(timerRef.current);
    goTo(realIdx + 1, true);
    timerRef.current = setInterval(next, 5000);
  };

  // The real banner index (0-based) for the dot indicator
  const currentReal = index <= 0 ? total - 1 : index >= total + 1 ? 0 : index - 1;

  return (
    <div className="relative w-full overflow-hidden select-none"
      style={{ height:"100vh", minHeight:500, maxHeight:700 }}>

      {/* ── Slide track ───────────────────────────────────── */}
      <div
        className="flex h-full"
        style={{
          width:     `${slides.length * 100}%`,
          transform: `translateX(-${(index / slides.length) * 100}%)`,
          transition: animated ? "transform 0.55s cubic-bezier(0.77,0,0.18,1)" : "none",
        }}
      >
        {slides.map((b, i) => (
          <div key={`${i}-${b._id||i}`}
            className="relative h-full flex-shrink-0"
            style={{ width:`${100 / slides.length}%` }}>
            {/* Background */}
            <div className="absolute inset-0"
              style={{ backgroundImage:`url(${b.image})`, backgroundSize:"cover", backgroundPosition:"center" }}/>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70"/>
            {/* Content */}
            {(b.title||b.subtitle||b.link) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                {b.title && (
                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
                    {b.title}
                  </h1>
                )}
                {b.subtitle && (
                  <p className="text-base sm:text-xl text-white/80 max-w-2xl mb-8 drop-shadow">
                    {b.subtitle}
                  </p>
                )}
                {b.link && (
                  <Link to={b.link}
                    className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-lg transition shadow-lg hover:shadow-xl">
                    Learn More <i className="fa-solid fa-arrow-right ml-1.5"/>
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Left arrow ────────────────────────────────────── */}
      <button onClick={manualPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95">
        <i className="fa-solid fa-chevron-left text-sm"/>
      </button>

      {/* ── Right arrow ───────────────────────────────────── */}
      <button onClick={manualNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95">
        <i className="fa-solid fa-chevron-right text-sm"/>
      </button>

      {/* ── Dot indicators ────────────────────────────────── */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
        {banners.map((_, i) => (
          <button key={i} onClick={() => manualDot(i)}
            className={`rounded-full transition-all duration-400 ${
              i === currentReal
                ? "bg-gold-500 w-7 h-2.5"
                : "bg-white/40 hover:bg-white/70 w-2.5 h-2.5"
            }`}
          />
        ))}
      </div>

      {/* ── Counter ───────────────────────────────────────── */}
      <div className="absolute bottom-6 right-5 text-white/50 text-xs font-mono z-10">
        {currentReal + 1} / {total}
      </div>
    </div>
  );
}
