import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CountdownTimer from "../components/CountdownTimer";
import SEO, {
  buildSportsEventSchema,
  buildOrganizationSchema,
} from "../components/SEO";
import { cldOptimize } from "../utils/cloudinaryOptimize";

function AnimatedWords({ text, startIndex = 0 }) {
  return text.split(" ").map((word, i) => (
    <span
      key={`${startIndex}-${i}`}
      className="hero-word"
      style={{ "--i": startIndex + i + 1 }}
    >
      {word}&nbsp;
    </span>
  ));
}

// Derives a short badge code from a tournament name for the auctions
// slider, e.g. "Pro Cricket League 2025" -> "PCL"
function shortCode(name = "") {
  const letters = name
    .split(" ")
    .filter((w) => /^[A-Za-z]/.test(w))
    .map((w) => w[0].toUpperCase())
    .join("");
  return (letters || name.slice(0, 3).toUpperCase()).slice(0, 4);
}

const HOW_IT_WORKS = [
  {
    icon: "fa-solid fa-user-group",
    ring: "bg-gold-500/15 text-gold-400 border-gold-500/25",
    title: "Register Your Team",
    body: "Create your franchise, set your budget, and prepare your strategy.",
    tall: true,
  },
  {
    icon: "fa-solid fa-gavel",
    ring: "bg-jade-500/15 text-jade-400 border-jade-500/25",
    title: "Live Bidding",
    body: "Compete in real-time against rival owners for top cricket talent.",
  },
  {
    icon: "fa-solid fa-trophy",
    ring: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    title: "Win the Trophy",
    body: "Lead your squad to victory and claim bragging rights.",
  },
];

export default function Landing() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nav, setNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const auctionScrollRef = useRef(null);
  const scrollAuctions = (dir) =>
    auctionScrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  const t = tournaments.find((x) => x.isActive) || tournaments[0];

  useEffect(() => {
    api
      .get("/tournaments")
      .then((r) => setTournaments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (t)
      api
        .get(`/teams?tournament=${t._id}`)
        .then((r) => setTeams(r.data))
        .catch(() => {});
  }, [t?._id]);

  // Transparent navbar — becomes solid after scrolling past the hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const now = Date.now();
  const regEnd = t?.registrationEndDate
    ? +new Date(t.registrationEndDate)
    : null;
  const tStart = t?.startDate ? +new Date(t.startDate) : null;
  const regOpen = t?.registrationOpen && regEnd && regEnd > now;

  const navSolid = scrolled || nav;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d0a] flex flex-col items-center justify-center gap-4">
        <img
          src="/logo2.png"
          alt="BidArenaX"
          className="h-20 w-20 object-contain animate-pulse"
        />
        <div className="flex items-center gap-2 text-jade-500">
          <i className="fa-solid fa-circle-notch animate-spin" />
          <span className="text-sm font-medium">Loading tournament data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0d0a] text-ink-100 font-body overflow-x-hidden">
      <SEO
        title={
          t
            ? `${t.name} — Live Cricket Auction`
            : "Live Cricket Auction Platform"
        }
        description={
          t?.description ||
          "IPL-style live cricket auction platform. Register teams, conduct live auctions with real-time bidding and purse tracking."
        }
        jsonLd={
          t
            ? [buildSportsEventSchema(t), buildOrganizationSchema()]
            : [buildOrganizationSchema()]
        }
      />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          navSolid
            ? "bg-[#0a0d0a]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo2.png"
              className="h-32 w-32 object-contain -ml-3 mt-7  transition group-hover:scale-105"
              alt="BidArenaX"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/player-registration"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-ink-300 hover:text-green-400 hover:bg-white/20"
            >
              Player Registration
            </Link>
            {t && (
              <Link
                to={`/watch/${t._id}`}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-ink-300 hover:text-flame-400 hover:bg-white/5 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />
                Watch Live
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 rounded-lg transition text-ink-300 hover:bg-white/5"
              onClick={() => setNav(!nav)}
            >
              <div
                className={`w-5 h-px mb-1.5 transition-all bg-ink-300 ${nav ? "rotate-45 translate-y-2" : ""}`}
              />
              <div
                className={`w-5 h-px mb-1.5 transition-all bg-ink-300 ${nav ? "opacity-0" : ""}`}
              />
              <div
                className={`w-5 h-px transition-all bg-ink-300 ${nav ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {nav && (
          <div className="md:hidden bg-[#0d100d] border-t border-white/[0.06] px-4 py-3 space-y-1 animate-slide-down">
            <Link
              to="/player-registration"
              onClick={() => setNav(false)}
              className="block px-3 py-2.5 text-sm rounded-lg text-ink-300 hover:bg-white/5 hover:text-green-400 transition"
            >
              Player Registration
            </Link>
            
            {t && (
              <Link
                to={`/watch/${t._id}`}
                onClick={() => setNav(false)}
                className="block px-3 py-2.5 text-sm rounded-lg text-ink-300 hover:bg-white/5 hover:text-gold-400 transition"
              >
                <i className="fa-solid fa-satellite-dish mr-2 text-flame-500" />
                Watch Live Auction
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* stadium photo + dark scrim */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('hero.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-[#0a0d0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-32 pb-16 md:pb-24 w-full">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5 max-w-3xl">
                {t ? (
                  <>
                    <AnimatedWords text="Build Your Dream XI at the" />
                    <br className="hidden sm:block" />
                    <span className="text-green-600 inline-block mt-1 sm:mt-2">
                      <AnimatedWords text={t.name} startIndex={6} />
                    </span>
                  </>
                ) : (
                  <>
                    <AnimatedWords text="Build Your Dream XI at the" />
                    <br className="hidden sm:block" />
                    <span className="text-green-600 inline-block mt-1 sm:mt-2">
                      <AnimatedWords
                        text="Ultimate Cricket Auction"
                        startIndex={6}
                      />
                    </span>
                  </>
                )}
              </h1>
              <p className="text-base sm:text-lg text-ink-300 leading-relaxed max-w-xl mb-8">
                {t?.description ||
                  "Bid, strategize, and assemble a championship squad. Real-time auctions. Real cricket glory."}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  to="/player-registration"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-green-700 text-white hover:bg-green-600 font-semibold text-sm rounded-lg transition hover:-translate-y-0.5"
                >
                  Player Registration
                </Link>
                {t && (
                  <Link
                    to={`/watch/${t._id}`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 border border-flame-500/50 text-flame-400 hover:bg-flame-500/10 font-semibold text-sm rounded-lg transition hover:-translate-y-0.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />
                    Watch Live
                  </Link>
                )}
              </div>

              {tStart && tStart > now && (
                <div>
                  <p className="text-2xs font-semibold uppercase tracking-widest text-gold-400 mb-2.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-trophy" /> Tournament starts in
                  </p>
                  <CountdownTimer target={t.startDate} dark />
                </div>
              )}
              {regOpen && (
                <div className={tStart && tStart > now ? "mt-6" : ""}>
                  <p className="text-2xs font-semibold uppercase tracking-widest text-jade-400 mb-2.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />
                    Registration closes in
                  </p>
                  <CountdownTimer target={t.registrationEndDate} dark />
                </div>
              )}
            </div>

            {/* ── HERO IMAGE — replace src below with your own image URL ── */}
            <div className="lg:flex items-center justify-center h-[460px]">
              <img
                src="hero-right.png"
                alt="BidArenaX"
                className="max-h-full w-auto object-contain animate-float drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE & RECENT AUCTIONS (auto-updates as admin creates tournaments) ── */}
      {tournaments.length > 0 && (
        <section className="relative max-w-7xl mx-auto px-5 sm:px-8 py-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
          <div className="relative z-10 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <div>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <i className="fa-solid fa-gavel text-flame-500 text-xl" />
                  Live &amp; Recent Auctions
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollAuctions(-1)}
                  aria-label="Previous"
                  className="h-9 w-9 rounded-full border border-white/[0.12] flex items-center justify-center text-ink-400 hover:text-white hover:border-white/30 transition"
                >
                  <i className="fa-solid fa-chevron-left text-xs" />
                </button>
                <button
                  onClick={() => scrollAuctions(1)}
                  aria-label="Next"
                  className="h-9 w-9 rounded-full border border-white/[0.12] flex items-center justify-center text-ink-400 hover:text-white hover:border-white/30 transition"
                >
                  <i className="fa-solid fa-chevron-right text-xs" />
                </button>
              </div>
            </div>

            <div
              ref={auctionScrollRef}
              className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-1"
            >
              {tournaments.map((tt) => {
                const isLive = tt.isActive;
                const dateLabel = tt.startDate
                  ? new Date(tt.startDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "TBA";
                return (
                  <Link
                    key={tt._id}
                    to={`/watch/${tt._id}`}
                    className="group shrink-0 w-[300px] sm:w-[320px] snap-start rounded-2xl border border-white/[0.08] bg-[#0d100d] hover:border-green-500/30 transition-all p-6 mt-4 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xs font-semibold uppercase tracking-wide text-green-500 px-2 py-1 rounded-md border border-white/[0.1]">
                        {tt.registrationOpen
                          ? "Registration Open"
                          : "Registration Closed"}
                      </span>
                      {isLive && (
                        <span className="text-2xs font-bold uppercase tracking-wide text-red-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          Live
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-lg bg-gold-500/15 border border-green-500/25 flex items-center justify-center shrink-0 overflow-hidden">
                        {tt.logo ? (
                          <img
                            src={cldOptimize(tt.logo, 88)}
                            className="h-full w-full object-cover"
                            alt={tt.name}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-green-400 font-display font-bold text-xs">
                            {shortCode(tt.name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-white truncate group-hover:text-green-400 transition">
                          {tt.name}
                        </p>
                        <p className="text-2xs text-ink-500 truncate">
                          {tt.registeredPlayers ?? 0} players registered
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-2xs text-ink-400 pt-3 border-t border-white/[0.07]">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-regular fa-calendar" />
                        {dateLabel}
                      </span>
                      <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                        <i className="fa-solid fa-location-dot" />
                        {tt.venue || "TBA"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-right mt-5">
              <a
                href="#all-tournaments"
                className="text-xs font-semibold text-green-600 hover:text-green-400 transition"
              >
                View All →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── TOURNAMENT DETAILS STRIP ──────────────────────────── */}
      {t && (
        <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-10 border-b border-white/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
          <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              ["fa-solid fa-location-dot", "Venue", t.venue || "TBA"],
              [
                "fa-regular fa-calendar",
                "Start Date",
                t.startDate
                  ? new Date(t.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "TBA",
              ],
              [
                "fa-solid fa-shield-halved",
                "Teams",
                `${teams.length}/${t.maxTeams}`,
              ],
              [
                "fa-solid fa-user-group",
                "Players Registered",
                `${t.registeredPlayers ?? 0}`,
              ],
              [
                "fa-solid fa-pen-to-square",
                "Registration",
                t.registrationOpen ? "Open" : "Closed",
              ],
            ].map(([icon, l, v]) => (
              <div
                key={l}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shrink-0">
                  <i className={`${icon} text-sm`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xs uppercase tracking-widest text-ink-500">
                    {l}
                  </p>
                  <p className="text-sm font-semibold text-ink-100 truncate">
                    {v}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* stadium photo + dark scrim, same treatment as the hero */}
        {/* <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=70')" }} />
        <div className="absolute inset-0 bg-black/78" /> */}
        <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <p className="font-editorial text-xs sm:text-4xl font-semibold text-gold-400 tracking-widest mb-10">
            How It Works
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {(() => {
              const links = [t ? `/watch/${t._id}` : "/player-registration"];
              return (
                <>
                  <img
                    src="bid.png"
                    alt="Live cricket auction in progress"
                    className="w-full h-full object-cover rounded-3xl aspect-[4/3]"
                    loading="lazy"
                    width="800"
                    height="600"
                  />

                  <div className="grid gap-5">
                    {HOW_IT_WORKS.slice(1).map((item, i) => (
                      <Link
                        key={item.title}
                        to={links[i + 1]}
                        className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/20 transition-all p-6"
                      >
                        <div
                          className={`w-11 h-11 rounded-full border flex items-center justify-center mb-4 ${item.ring}`}
                        >
                          <i className={`${item.icon} text-base`} />
                        </div>
                        <p className="font-display text-lg font-semibold text-white mb-1.5">
                          {item.title}
                        </p>
                        <p className="text-sm text-ink-400 leading-relaxed">
                          {item.body}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
        <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-widest text-gold-400 mb-3">
              Who We Are
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-6 leading-tight">
              About <span className="font-editorial text-4xl sm:text-5xl font-bold text-green-600">
               BidArenaX
            </span>
            </h2>
            <p className="text-ink-400 leading-relaxed mb-4">
              BidArenaX is a cricket tournament management and player auction
              platform built to simplify every aspect of organizing professional
              cricket tournaments — from registering players and forming teams
              to running the auction itself, live, in front of everyone
              watching.
            </p>
            <p className="text-ink-400 leading-relaxed mb-4">
              Designed for leagues of every size, BidArenaX replaces manual
              auction processes with a secure, transparent, real-time system —
              team owners bid live, purses update instantly, and every sale is
              recorded the moment it happens.
            </p>
            <p className="text-ink-400 leading-relaxed mb-8">
              From local society tournaments to large IPL-style competitions,
              BidArenaX gives organizers a professional, cloud-based dashboard
              to run the whole event — no spreadsheets, no manual tallying.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
            <img
              src="image.png"
              alt="Live cricket auction in progress"
              className="w-full h-full object-cover aspect-[4/3]"
              loading="lazy"
              width="800"
              height="600"
            />
          </div>
        </div>
      </section>

      {/* ── SPLIT: PLAYER REGISTRATION ────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
        <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Every Player. Every Stat. One Platform.
            </h2>
            <p className="text-ink-400 leading-relaxed max-w-md mb-7">
              Browse detailed player profiles with career statistics, form
              ratings, and auction history. Register yourself to enter the
              player pool.
            </p>
            <Link
              to="/player-registration"
              className="inline-flex items-center gap-2 px-6 py-3 bg-jade-500 hover:bg-jade-400 text-[#08170f] font-bold text-sm rounded-lg transition shadow-lg shadow-jade-500/20"
            >
              Register as Player
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
            <img
              src="ball.png"
              alt="Cricket player batting"
              className="w-full h-full object-cover aspect-[4/3]"
              loading="lazy"
              width="700"
              height="525"
            />
          </div>
        </div>
      </section>

      {/* ── ALL TOURNAMENTS — registration counts per tournament ── */}
      {tournaments.length > 1 && (
        <section
          id="all-tournaments"
          className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 border-t border-white/[0.06] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
          <h2 className="relative z-10 font-editorial text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
            Tournaments Open for Registration
          </h2>
          <p className="relative z-10 text-ink-400 max-w-lg mb-10">
            See how many players have already signed up for each tournament.
          </p>
          <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((tt) => (
              <div
                key={tt._id}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-green-500/30 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-xl bg-white/[0.06] border border-white/[0.08] overflow-hidden flex items-center justify-center shrink-0">
                    {tt.logo ? (
                      <img
                        src={cldOptimize(tt.logo, 96)}
                        className="h-full w-full object-cover"
                        alt={tt.name}
                        loading="lazy"
                      />
                    ) : (
                      <i className="fa-solid fa-trophy text-gold-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white truncate">{tt.name}</p>
                    <p className="text-2xs text-ink-500 truncate">
                      {tt.venue || "Venue TBA"}
                    </p>
                  </div>
                  {tt.registrationOpen ? (
                    <span className="text-2xs font-semibold uppercase tracking-wide text-jade-400 flex items-center gap-1.5 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />
                      Open
                    </span>
                  ) : (
                    <span className="text-2xs font-semibold uppercase tracking-wide text-ink-500 shrink-0">
                      Closed
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-black/20 border border-white/[0.06] px-4 py-3">
                  <span className="text-sm text-ink-300">
                    Players Registered
                  </span>
                  <span className="font-mono text-xl font-bold text-gold-400">
                    {tt.registeredPlayers ?? 0}
                  </span>
                </div>
                {tt.registrationOpen && (
                  <Link
                    to="/player-registration"
                    className="mt-4 block text-center text-xs font-semibold text-jade-400 hover:text-jade-300 transition"
                  >
                    Register for this tournament →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
        <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] order-2 md:order-1">
            <img
              src="dhoni.webp"
              alt="Team celebrating on the field"
              className="w-full h-full object-cover aspect-[4/3]"
              loading="lazy"
              width="700"
              height="525"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Celebrate Like Champions
            </h2>
            <p className="text-ink-400 leading-relaxed max-w-md mb-7">
              From nail-biting auction wars to on-field glory — watch every bid
              live and follow your team's journey from squad to silverware.
            </p>
            {t ? (
              <Link
                to={`/watch/${t._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-flame-500/50 text-flame-400 hover:bg-flame-500/10 font-semibold text-sm rounded-lg transition"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />
                Watch Live Auction
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-ink-500 font-semibold text-sm rounded-lg">
                No live auction right now
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── TEAMS ─────────────────────────────────────────────── */}
      {teams.length > 0 && (
        <section className="relative border-t border-white/[0.06] bg-white/[0.015] overflow-hidden">
          <div className="absolute inset-0 bg-[url('/cricket-paint.svg')] bg-cover bg-center opacity-[0.3] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-widest text-gold-400 mb-2">
                  Participating
                </p>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">
                  Teams
                </h2>
              </div>
              <span className="text-sm text-ink-500 px-3 py-1 rounded-full border border-white/10">
                {teams.length} registered
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.map((tm) => {
                const pct = Math.max(
                  0,
                  Math.min(100, (tm.remainingPurse / tm.initialPurse) * 100),
                );
                return (
                  <Link
                    key={tm._id}
                    to={`/team/${tm._id}`}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-gold-500/30 p-4 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-gold-500/10 overflow-hidden flex items-center justify-center shrink-0 border border-gold-500/20 group-hover:border-gold-500/40 transition">
                        {tm.logo ? (
                          <img
                            src={cldOptimize(tm.logo, 88)}
                            className="h-full w-full object-cover"
                            alt={tm.name}
                            loading="lazy"
                          />
                        ) : (
                          <i className="fa-solid fa-shield-halved text-lg text-gold-500/50" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover:text-gold-400 transition">
                          {tm.name}
                        </p>
                        <p className="text-2xs text-ink-500 truncate">
                          {tm.ownerName}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-2xs mb-1.5">
                        <span className="text-ink-500">Purse left</span>
                        <span className="font-mono font-semibold text-jade-400">
                          ₹
                          {(
                            tm.remainingPurse || tm.initialPurse
                          )?.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct < 25 ? "bg-flame-500" : "bg-jade-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-2xs mt-1.5 text-ink-500">
                        <span>
                          {tm.squad?.length || 0}/{tm.maxPlayers} players
                        </span>
                        <span className="group-hover:text-gold-400 transition flex items-center gap-1">
                          View squad{" "}
                          <i className="fa-solid fa-arrow-right text-2xs" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#0a0d0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo2.png"
              className="h-16 w-16 object-contain"
              alt="BidArenaX"
            />
          </div>
          <div className="flex items-center gap-3">
           
            <span className="text-xs text-ink-500">
              ©{new Date().getFullYear()} BidArenaX All rights reserved here 
            </span>
          </div>
          <div className="flex gap-6 text-sm text-ink-500">
            <Link
              to="/player-registration"
              className="hover:text-green-400 transition"
            >
              Player Registration
            </Link>
            {t && (
              <Link
                to={`/watch/${t._id}`}
                className="hover:text-green-400 transition"
              >
                Watch Auction
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
