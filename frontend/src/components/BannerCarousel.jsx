import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * Full-bleed banner carousel for the landing page hero.
 * Sits directly under the transparent navbar (rendered behind it).
 * Banners are managed from the admin panel (Banner Slides).
 */
export default function BannerCarousel({ banners = [], autoPlayMs = 5000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const count = banners.length;

  const goTo = useCallback((i) => {
    if (count === 0) return;
    setIndex(((i % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % count), autoPlayMs);
    return () => clearInterval(timerRef.current);
  }, [count, paused, autoPlayMs]);

  // Keep index in range if the banner list changes
  useEffect(() => { if (index >= count) setIndex(0); }, [count, index]);

  if (count === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden select-none group"
      style={{ height: "min(78vh, 640px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides track */}
      <div
        className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((b, i) => {
          const Wrapper = b.link ? "a" : "div";
          const wrapperProps = b.link ? { href: b.link, target: "_blank", rel: "noopener noreferrer" } : {};
          return (
            <Wrapper key={b._id || i} {...wrapperProps} className="relative w-full h-full shrink-0 grow-0 basis-full block">
              <img
                src={b.image}
                alt={b.title || `Banner ${i + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              {(b.title || b.subtitle) && (
                <div className="absolute inset-x-0 bottom-0 px-4 sm:px-8 pb-16 sm:pb-20 max-w-7xl mx-auto left-0 right-0">
                  <div className="max-w-xl animate-fade-up">
                    {b.title && (
                      <h2 className="font-display text-3xl sm:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
                        {b.title}
                      </h2>
                    )}
                    {b.subtitle && (
                      <p className="text-sm sm:text-base text-white/85 drop-shadow-md">{b.subtitle}</p>
                    )}
                  </div>
                </div>
              )}
            </Wrapper>
          );
        })}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <i className="fa-solid fa-chevron-left text-sm sm:text-base" />
          </button>
          <button
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <i className="fa-solid fa-chevron-right text-sm sm:text-base" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-7 bg-gold-500" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
