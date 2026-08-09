import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

export default function BannerCarousel({ banners = [] }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState("next"); // "next" | "prev"

  const go = useCallback((idx, dir = "next") => {
    if (animating || idx === current) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  }, [animating, current]);

  const next = () => go((current + 1) % banners.length, "next");
  const prev = () => go((current - 1 + banners.length) % banners.length, "prev");

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [current, banners.length, animating]);

  if (!banners.length) return null;

  const b = banners[current];

  // Slide animation classes
  const slideClass = animating
    ? direction === "next"
      ? "translate-x-full opacity-0"
      : "-translate-x-full opacity-0"
    : "translate-x-0 opacity-100";

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 500, maxHeight: 700 }}>
      {/* Background image */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-in-out ${slideClass}`}
        style={{
          backgroundImage: `url(${b.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      {(b.title || b.subtitle || b.link) && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-500 ease-in-out ${slideClass}`}>
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
            <Link
              to={b.link.startsWith("http") ? b.link : b.link}
              className="px-8 py-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-lg transition shadow-lg hover:shadow-xl"
            >
              Learn More <i className="fa-solid fa-arrow-right ml-1.5" />
            </Link>
          )}
        </div>
      )}

      {/* ── Arrows ──────────────────────────── */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
          >
            <i className="fa-solid fa-chevron-left text-sm" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
          >
            <i className="fa-solid fa-chevron-right text-sm" />
          </button>
        </>
      )}

      {/* ── Dots ─────────────────────────────── */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i, i > current ? "next" : "prev")}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-gold-500 w-6 h-2.5"
                  : "bg-white/40 hover:bg-white/70 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ─────────────────────── */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 right-5 text-white/50 text-xs font-mono z-10">
          {current + 1} / {banners.length}
        </div>
      )}
    </div>
  );
}
