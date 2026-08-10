import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CountdownTimer from "../components/CountdownTimer";
import StadiumBg from "../components/StadiumBg";
import { ThemeToggle } from "../components/UI";
import SEO, { buildSportsEventSchema, buildOrganizationSchema } from "../components/SEO";
import BannerCarousel from "../components/BannerCarousel";

const BACKEND = "https://bidarena-backend-su27.onrender.com/api";

export default function Landing() {
  const [tournaments, setTournaments] = useState([]);
  const [teams,       setTeams]       = useState([]);
  const [banners,     setBanners]     = useState([]);
  const [nav,         setNav]         = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  const t = tournaments.find(x => x.isActive) || tournaments[0];

  useEffect(() => { api.get("/tournaments").then(r => setTournaments(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (t) api.get(`/teams?tournament=${t._id}`).then(r => setTeams(r.data)).catch(() => {}); }, [t?._id]);
  useEffect(() => {
    // fetch banners — try with tournament filter, fallback to all
    const url = t ? `${BACKEND}/banners/public?tournament=${t._id}` : `${BACKEND}/banners/public`;
    fetch(url).then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length) setBanners(data);
      else if (t) fetch(`${BACKEND}/banners/public`).then(r=>r.json()).then(d => setBanners(Array.isArray(d)?d:[])).catch(()=>{});
    }).catch(() => {});
  }, [t?._id]);

  // Transparent navbar — becomes solid after scrolling past banner
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hasBanners = banners.length > 0;
  const now = Date.now();
  const regEnd  = t?.registrationEndDate ? +new Date(t.registrationEndDate) : null;
  const tStart  = t?.startDate           ? +new Date(t.startDate)           : null;
  const regOpen = t?.registrationOpen && regEnd && regEnd > now;

  return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 dark:text-ink-100 text-ink-900 font-body transition-colors duration-300">
      {!hasBanners && <StadiumBg opacity={0.22} />}

      <SEO
        title={t ? `${t.name} — Live Cricket Auction` : "Live Cricket Auction Platform"}
        description={t?.description || "IPL-style live cricket auction platform. Register teams, conduct live auctions with real-time bidding and purse tracking."}
        jsonLd={t ? [buildSportsEventSchema(t), buildOrganizationSchema()] : [buildOrganizationSchema()]}
      />

      {/* ── NAV — transparent over banner, solid after scroll ─── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        hasBanners && !scrolled && !nav
          ? "bg-transparent"
          : "dark:bg-ink-950/95 bg-white/95 backdrop-blur-md border-b dark:border-ink-800 border-ink-200 shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {t?.logo && <img src={t.logo} className="h-8 w-8 rounded object-cover" alt="logo" />}
            <span className={`font-display text-xl font-semibold tracking-wide transition-colors ${
              hasBanners && !scrolled ? "text-white drop-shadow" : "text-gold-500"
            }`}>
              BidArena<span className={`font-normal ${hasBanners && !scrolled ? "text-white/70" : "dark:text-ink-400 text-ink-400"}`}> Auctions</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              ["/player-registration", "Player Registration"],
              
            ].map(([to, label]) => (
              <Link key={to} to={to}
                className={`px-3 py-2 text-sm rounded-lg transition ${
                  hasBanners && !scrolled
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "dark:text-ink-400 text-ink-500 dark:hover:text-ink-200 hover:text-ink-800 dark:hover:bg-ink-800 hover:bg-ink-100"
                }`}>
                {label}
              </Link>
            ))}
            
            <div className={`ml-3 pl-3 ${hasBanners && !scrolled ? "border-l border-white/20" : "border-l dark:border-ink-800 border-ink-200"}`}>
              <ThemeToggle />
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className={`p-2 rounded-lg transition ${hasBanners && !scrolled ? "text-white hover:bg-white/10" : "dark:hover:bg-ink-800 hover:bg-ink-100"}`}
              onClick={() => setNav(!nav)}>
              <div className={`w-5 h-px mb-1.5 transition-all ${hasBanners && !scrolled ? "bg-white" : "dark:bg-ink-400 bg-ink-600"} ${nav ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-px mb-1.5 transition-all ${hasBanners && !scrolled ? "bg-white" : "dark:bg-ink-400 bg-ink-600"} ${nav ? "opacity-0" : ""}`} />
              <div className={`w-5 h-px transition-all ${hasBanners && !scrolled ? "bg-white" : "dark:bg-ink-400 bg-ink-600"} ${nav ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {nav && (
          <div className="md:hidden dark:bg-ink-950 bg-white border-t dark:border-ink-800 border-ink-200 px-4 py-3 space-y-1 animate-slide-down">
            {[
              ...(t?[[`/watch/${t._id}`,"Watch Live Auction"]]:[])]
              .map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setNav(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg dark:text-ink-300 text-ink-600 dark:hover:bg-ink-800 hover:bg-ink-100 transition">
                  {to.startsWith("/watch") && <i className="fa-solid fa-satellite-dish mr-2 text-flame-500" />}
                  {label}
                </Link>
              ))}
          </div>
        )}
      </header>

      {/* ── BANNER CAROUSEL (full screen, under transparent nav) ── */}
      {hasBanners && (
        <div className="w-full">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className={`flex-1 min-h-[60vh] ${hasBanners ? "" : "pt-16"}`}>

        {/* Hero — only show when no banners or to supplement */}
        {!hasBanners && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full dark:bg-ink-800 bg-ink-100 border dark:border-ink-700 border-ink-200 mb-6">
                  <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                  <span className="text-2xs font-semibold uppercase tracking-widest text-gold-500">Live Auction Platform</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] tracking-tight dark:text-white text-ink-900 mb-6">
                  {t?.name || "Cricket\nAuction\nSystem"}
                </h1>
                <p className="text-base dark:text-ink-400 text-ink-500 leading-relaxed max-w-md mb-8">
                  {t?.description || "IPL-style bidding platform — create tournaments, register teams, run live auctions with real-time purse tracking."}
                </p>
                {tStart && tStart > now && (
                  <div className="mb-8 p-4 rounded-xl dark:bg-ink-800/60 bg-white border dark:border-ink-700 border-ink-200">
                    <p className="eyebrow mb-3 flex items-center gap-1.5"><i className="fa-solid fa-trophy text-gold-500" /> Tournament starts in</p>
                    <CountdownTimer target={t.startDate} />
                  </div>
                )}
                {regOpen && (
                  <div className="mb-8 p-4 rounded-xl dark:bg-jade-500/5 bg-jade-50 border dark:border-jade-500/20 border-jade-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-jade-500 animate-pulse" />
                      <p className="eyebrow text-jade-500">Registration open — closes in</p>
                    </div>
                    <CountdownTimer target={t.registrationEndDate} />
                    <Link to="/player-registration"
                      className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-jade-600 hover:bg-jade-500 text-white text-sm font-semibold rounded-lg transition">
                      Register as Player <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link to="/owner/register"
                    className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-sm rounded-lg transition shadow-sm hover:shadow-md">
                    Register Your Team
                  </Link>
                  <Link to="/player-registration"
                    className="px-6 py-3 dark:bg-ink-800 bg-white dark:hover:bg-ink-700 hover:bg-ink-50 dark:text-ink-200 text-ink-700 font-semibold text-sm rounded-lg border dark:border-ink-700 border-ink-300 transition">
                    Player Registration
                  </Link>
                  {t && (
                    <Link to={`/watch/${t._id}`}
                      className="px-6 py-3 border border-flame-500/40 dark:text-flame-400 text-flame-600 hover:bg-flame-500/10 font-semibold text-sm rounded-lg transition flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live
                    </Link>
                  )}
                </div>
              </div>

              {t ? (
                <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 overflow-hidden shadow-card-light dark:shadow-card-dark animate-fade-up">
                  <div className="px-6 py-4 border-b dark:border-ink-800 border-ink-100 dark:bg-ink-900/40 bg-ink-50">
                    <p className="eyebrow mb-1">Tournament Details</p>
                    <p className="font-display text-xl font-semibold dark:text-ink-50 text-ink-900">{t.name}</p>
                  </div>
                  <div className="divide-y dark:divide-ink-800 divide-ink-100">
                    {[
                      ["fa-solid fa-location-dot", "Venue",       t.venue || "TBA"],
                      ["fa-regular fa-calendar",   "Start",       t.startDate ? new Date(t.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "TBA"],
                      ["fa-regular fa-calendar-check","End",      t.endDate   ? new Date(t.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})   : "TBA"],
                      ["fa-solid fa-shield-halved","Max Teams",   `${t.maxTeams} teams`],
                      ["fa-solid fa-baseball-bat-ball","Max Players", `${t.maxPlayers} players`],
                    ].map(([icon, l, v]) => (
                      <div key={l} className="flex justify-between items-center px-6 py-3">
                        <span className="text-sm dark:text-ink-500 text-ink-500 flex items-center gap-2">
                          <i className={`${icon} text-gold-500/70 w-4 text-center`} />{l}
                        </span>
                        <span className="text-sm font-medium dark:text-ink-200 text-ink-800">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-6 py-3">
                      <span className="text-sm dark:text-ink-500 text-ink-500 flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-gold-500/70 w-4 text-center" />Registration
                      </span>
                      <span className={`badge ${t.registrationOpen ? "badge-green" : "badge-red"}`}>
                        {t.registrationOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-center h-64 rounded-2xl border-2 border-dashed dark:border-ink-800 border-ink-200">
                  <div className="text-center">
                    <i className="fa-solid fa-baseball-bat-ball text-5xl mb-3 opacity-30" />
                    <p className="dark:text-ink-500 text-ink-400 text-sm">No active tournament</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick links strip — shown below banner when banners exist */}
        {hasBanners && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { to:"/player-registration", icon:"fa-solid fa-baseball-bat-ball", label:"Player Registration", desc:"Register yourself for the auction", color:"text-gold-500" },

                { to:t?`/watch/${t._id}`:"/", icon:"fa-solid fa-satellite-dish",   label:"Watch Live Auction",  desc:"Live broadcast for your venue",  color:"text-flame-500" },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5 hover:border-gold-500/50 transition group shadow-card-light dark:shadow-card-dark">
                  <i className={`${item.icon} text-2xl ${item.color} mb-3 block`} />
                  <p className="font-bold text-sm dark:text-ink-100 text-ink-900 group-hover:text-gold-500 transition">{item.label}</p>
                  <p className="text-xs dark:text-ink-500 text-ink-400 mt-0.5">{item.desc}</p>
                </Link>
              ))}
            </div>

            {/* Tournament info strip */}
            {t && (
              <div className="mt-6 dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5 shadow-card-light dark:shadow-card-dark">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {t.logo && <img src={t.logo} className="h-10 w-10 rounded-lg object-cover" alt={t.name} />}
                    <div>
                      <p className="eyebrow mb-0.5">Active Tournament</p>
                      <p className="font-display text-lg font-bold dark:text-ink-50 text-ink-900">{t.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="dark:text-ink-400 text-ink-500"><i className="fa-solid fa-location-dot mr-1.5 text-gold-500/70" />{t.venue || "TBA"}</span>
                    <span className={`badge ${t.registrationOpen ? "badge-green" : "badge-red"}`}>
                      Registration {t.registrationOpen ? "Open" : "Closed"}
                    </span>
                    {t && <Link to={`/watch/${t._id}`} className="text-flame-500 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse"/>Watch Live</Link>}
                  </div>
                </div>
                {regOpen && (
                  <div className="mt-4 pt-4 border-t dark:border-ink-800 border-ink-100">
                    <p className="eyebrow mb-2 text-jade-500">Registration closes in</p>
                    <CountdownTimer target={t.registrationEndDate} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── TEAMS ─────────────────────────────────────────────── */}
        {teams.length > 0 && (
          <section className="border-t dark:border-ink-800 border-ink-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="eyebrow mb-1">Participating</p>
                  <h2 className="font-display text-3xl font-semibold dark:text-ink-50 text-ink-900">Teams</h2>
                </div>
                <span className="text-sm dark:text-ink-500 text-ink-400">{teams.length} registered</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {teams.map(tm => {
                  const pct = Math.max(0, Math.min(100, (tm.remainingPurse / tm.initialPurse) * 100));
                  return (
                    <Link key={tm._id} to={`/team/${tm._id}`}
                      className="group dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-4 hover:border-gold-500/50 dark:hover:bg-ink-800 hover:bg-ink-50 transition-all duration-200 shadow-card-light dark:shadow-card-dark">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg dark:bg-ink-700 bg-ink-100 overflow-hidden flex items-center justify-center shrink-0 border dark:border-ink-600 border-ink-200">
                          {tm.logo
                            ? <img src={tm.logo} className="h-full w-full object-cover" alt={tm.name} />
                            : <i className="fa-solid fa-shield-halved text-lg opacity-50" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold dark:text-ink-100 text-ink-900 truncate group-hover:text-gold-500 transition">{tm.name}</p>
                          <p className="text-2xs dark:text-ink-500 text-ink-400 truncate">{tm.ownerName}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-2xs mb-1.5">
                          <span className="dark:text-ink-500 text-ink-400">Purse left</span>
                          <span className="font-mono font-semibold text-jade-500">₹{(tm.remainingPurse||tm.initialPurse)?.toLocaleString()}</span>
                        </div>
                        <div className="purse-track">
                          <div className={`h-full rounded-full transition-all ${pct<25?"bg-flame-500":"bg-jade-500"}`} style={{width:`${pct}%`}}/>
                        </div>
                        <div className="flex justify-between text-2xs mt-1.5 dark:text-ink-600 text-ink-400">
                          <span>{tm.squad?.length||0}/{tm.maxPlayers} players</span>
                          <span className="group-hover:text-gold-500 transition flex items-center gap-1">View squad <i className="fa-solid fa-arrow-right text-2xs" /></span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t dark:border-ink-800 border-ink-200 dark:bg-ink-950 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold text-gold-500">BidArena Auctions</span>
            <span className="text-2xs dark:text-ink-600 text-ink-400">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm dark:text-ink-500 text-ink-400">
            <Link to="/player-registration" className="hover:text-gold-500 transition">Player Registration</Link>
            {t && <Link to={`/watch/${t._id}`} className="hover:text-gold-500 transition">Watch Auction</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}
