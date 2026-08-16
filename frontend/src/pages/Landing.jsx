import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CountdownTimer from "../components/CountdownTimer";
import StadiumBg from "../components/StadiumBg";
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

  const navSolid = scrolled || nav || !hasBanners;

  return (
    <div className="relative min-h-screen text-ink-100 font-body overflow-x-hidden">
      <StadiumBg opacity={hasBanners ? 0.55 : 0.85} showPhoto={!hasBanners} />

      <SEO
        title={t ? `${t.name} — Live Cricket Auction` : "Live Cricket Auction Platform"}
        description={t?.description || "IPL-style live cricket auction platform. Register teams, conduct live auctions with real-time bidding and purse tracking."}
        jsonLd={t ? [buildSportsEventSchema(t), buildOrganizationSchema()] : [buildOrganizationSchema()]}
      />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        navSolid
          ? "bg-ink-950/80 backdrop-blur-xl border-b border-gold-500/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            {t?.logo && (
              <div className="h-9 w-9 rounded-lg overflow-hidden ring-2 ring-gold-500/30 group-hover:ring-gold-500/60 transition">
                <img src={t.logo} className="h-full w-full object-cover" alt="logo" />
              </div>
            )}
            <span className={`font-display text-xl font-semibold tracking-wide transition-colors ${
              navSolid ? "gold-gradient-text" : "text-white drop-shadow-lg"
            }`}>
              BidArena<span className={`font-normal ${navSolid ? "text-ink-400" : "text-white/70"}`}> Auctions</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {[
              ["/player-registration", "Player Registration"],
            ].map(([to, label]) => (
              <Link key={to} to={to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  navSolid
                    ? "text-ink-300 hover:text-gold-400 hover:bg-gold-500/10"
                    : "text-white/85 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                }`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className={`p-2 rounded-lg transition ${navSolid ? "text-ink-300 hover:bg-ink-800" : "text-white hover:bg-white/10"}`}
              onClick={() => setNav(!nav)}>
              <div className={`w-5 h-px mb-1.5 transition-all ${navSolid ? "bg-ink-300" : "bg-white"} ${nav ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-px mb-1.5 transition-all ${navSolid ? "bg-ink-300" : "bg-white"} ${nav ? "opacity-0" : ""}`} />
              <div className={`w-5 h-px transition-all ${navSolid ? "bg-ink-300" : "bg-white"} ${nav ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {nav && (
          <div className="md:hidden glass-panel border-t border-gold-500/10 px-4 py-3 space-y-1 animate-slide-down">
            {[
              ...(t?[[`/watch/${t._id}`,"Watch Live Auction"]]:[])]
              .map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setNav(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg text-ink-200 hover:bg-gold-500/10 hover:text-gold-400 transition">
                  {to.startsWith("/watch") && <i className="fa-solid fa-satellite-dish mr-2 text-flame-500" />}
                  {label}
                </Link>
              ))}
          </div>
        )}
      </header>

      {/* ── BANNER CAROUSEL ─────────────────────────────────── */}
      {hasBanners && (
        <div className="w-full relative">
          <BannerCarousel banners={banners} />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-950 to-transparent pointer-events-none z-10" />
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className={`relative flex-1 min-h-[60vh] ${hasBanners ? "" : "pt-16"}`}>

        {/* Hero — only show when no banners */}
        {!hasBanners && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="animate-fade-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500" />
                  </span>
                  <span className="text-2xs font-semibold uppercase tracking-widest text-gold-400">Live Auction Platform</span>
                </div>
                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] tracking-tight text-white mb-6 drop-shadow-lg">
                  {t?.name || "Cricket\nAuction\nSystem"}
                </h1>
                <p className="text-base text-ink-300 leading-relaxed max-w-md mb-8">
                  {t?.description || "IPL-style bidding platform — create tournaments, register teams, run live auctions with real-time purse tracking."}
                </p>
                {tStart && tStart > now && (
                  <div className="mb-8 p-5 rounded-2xl glass-panel">
                    <p className="eyebrow mb-3 flex items-center gap-1.5 text-gold-400">
                      <i className="fa-solid fa-trophy text-gold-500" /> Tournament starts in
                    </p>
                    <CountdownTimer target={t.startDate} />
                  </div>
                )}
                {regOpen && (
                  <div className="mb-8 p-5 rounded-2xl border border-jade-500/25 bg-jade-500/10 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-jade-400 animate-pulse" />
                      <p className="eyebrow text-jade-400">Registration open — closes in</p>
                    </div>
                    <CountdownTimer target={t.registrationEndDate} />
                    <Link to="/player-registration"
                      className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-gradient-to-r from-jade-600 to-jade-500 hover:from-jade-500 hover:to-jade-400 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-jade-500/20">
                      Register as Player <i className="fa-solid fa-arrow-right text-xs" />
                    </Link>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link to="/owner/register"
                    className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-ink-950 font-bold text-sm rounded-xl transition shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:-translate-y-0.5">
                    Register Your Team
                  </Link>
                  <Link to="/player-registration"
                    className="px-6 py-3 glass-panel glass-panel-hover text-ink-100 font-semibold text-sm rounded-xl transition hover:-translate-y-0.5">
                    Player Registration
                  </Link>
                  {t && (
                    <Link to={`/watch/${t._id}`}
                      className="px-6 py-3 border border-flame-500/50 text-flame-400 hover:bg-flame-500/10 font-semibold text-sm rounded-xl transition flex items-center gap-2 hover:-translate-y-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live
                    </Link>
                  )}
                </div>
              </div>

              {t ? (
                <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden animate-fade-up">
                  <div className="px-6 py-5 border-b border-gold-500/10 bg-gradient-to-r from-gold-500/10 to-transparent">
                    <p className="eyebrow mb-1 text-gold-400">Tournament Details</p>
                    <p className="font-display text-xl font-semibold text-white">{t.name}</p>
                  </div>
                  <div className="divide-y divide-ink-800/80">
                    {[
                      ["fa-solid fa-location-dot", "Venue",       t.venue || "TBA"],
                      ["fa-regular fa-calendar",   "Start",       t.startDate ? new Date(t.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "TBA"],
                      ["fa-regular fa-calendar-check","End",      t.endDate   ? new Date(t.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})   : "TBA"],
                      ["fa-solid fa-shield-halved","Max Teams",   `${t.maxTeams} teams`],
                      ["fa-solid fa-baseball-bat-ball","Max Players", `${t.maxPlayers} players`],
                    ].map(([icon, l, v]) => (
                      <div key={l} className="flex justify-between items-center px-6 py-3.5 hover:bg-white/[0.02] transition">
                        <span className="text-sm text-ink-400 flex items-center gap-2">
                          <i className={`${icon} text-gold-500/80 w-4 text-center`} />{l}
                        </span>
                        <span className="text-sm font-medium text-ink-100">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-6 py-3.5">
                      <span className="text-sm text-ink-400 flex items-center gap-2">
                        <i className="fa-solid fa-pen-to-square text-gold-500/80 w-4 text-center" />Registration
                      </span>
                      <span className={`badge ${t.registrationOpen ? "badge-green" : "badge-red"}`}>
                        {t.registrationOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-center h-64 rounded-2xl border border-dashed border-gold-500/20 glass-panel">
                  <div className="text-center">
                    <i className="fa-solid fa-baseball-bat-ball text-5xl mb-3 text-gold-500/30" />
                    <p className="text-ink-400 text-sm">No active tournament</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Quick links strip — shown below banner when banners exist */}
        {hasBanners && (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 -mt-4 relative z-20">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { to:"/player-registration", icon:"fa-solid fa-baseball-bat-ball", label:"Player Registration", desc:"Register yourself for the auction", accent:"from-gold-500/20 to-transparent", iconColor:"text-gold-400" },
                { to:t?`/watch/${t._id}`:"/", icon:"fa-solid fa-satellite-dish", label:"Watch Live Auction", desc:"Live broadcast for your venue", accent:"from-flame-500/20 to-transparent", iconColor:"text-flame-400" },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="group relative overflow-hidden rounded-2xl glass-panel glass-panel-hover p-6 transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-ink-900/60 border border-white/10 mb-4 ${item.iconColor}`}>
                      <i className={`${item.icon} text-xl`} />
                    </div>
                    <p className="font-bold text-base text-white group-hover:text-gold-400 transition">{item.label}</p>
                    <p className="text-xs text-ink-400 mt-1">{item.desc}</p>
                    <span className="inline-flex items-center gap-1.5 mt-4 text-2xs font-semibold uppercase tracking-wider text-gold-500/70 group-hover:text-gold-400 transition">
                      Get started <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {t && (
              <div className="mt-6 glass-panel rounded-2xl p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {t.logo && (
                      <div className="h-12 w-12 rounded-xl overflow-hidden ring-2 ring-gold-500/30">
                        <img src={t.logo} className="h-full w-full object-cover" alt={t.name} />
                      </div>
                    )}
                    <div>
                      <p className="eyebrow mb-0.5 text-gold-400">Active Tournament</p>
                      <p className="font-display text-xl font-bold text-white">{t.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm items-center">
                    <span className="text-ink-300">
                      <i className="fa-solid fa-location-dot mr-1.5 text-gold-500/80" />{t.venue || "TBA"}
                    </span>
                    <span className={`badge ${t.registrationOpen ? "badge-green" : "badge-red"}`}>
                      Registration {t.registrationOpen ? "Open" : "Closed"}
                    </span>
                    {t && (
                      <Link to={`/watch/${t._id}`} className="text-flame-400 font-semibold flex items-center gap-1.5 hover:text-flame-300 transition">
                        <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live
                      </Link>
                    )}
                  </div>
                </div>
                {regOpen && (
                  <div className="relative mt-5 pt-5 border-t border-ink-800/80">
                    <p className="eyebrow mb-2 text-jade-400">Registration closes in</p>
                    <CountdownTimer target={t.registrationEndDate} />
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── TEAMS ─────────────────────────────────────────────── */}
        {teams.length > 0 && (
          <section className="section-bg-image border-t border-gold-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="eyebrow mb-2 text-gold-400">Participating</p>
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white">Teams</h2>
                </div>
                <span className="text-sm text-ink-400 px-3 py-1 rounded-full glass-panel">{teams.length} registered</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {teams.map(tm => {
                  const pct = Math.max(0, Math.min(100, (tm.remainingPurse / tm.initialPurse) * 100));
                  return (
                    <Link key={tm._id} to={`/team/${tm._id}`}
                      className="group glass-panel glass-panel-hover rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-xl bg-ink-900/80 overflow-hidden flex items-center justify-center shrink-0 border border-gold-500/20 group-hover:border-gold-500/40 transition">
                          {tm.logo
                            ? <img src={tm.logo} className="h-full w-full object-cover" alt={tm.name} />
                            : <i className="fa-solid fa-shield-halved text-lg text-gold-500/50" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-gold-400 transition">{tm.name}</p>
                          <p className="text-2xs text-ink-500 truncate">{tm.ownerName}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-2xs mb-1.5">
                          <span className="text-ink-500">Purse left</span>
                          <span className="font-mono font-semibold text-jade-400">₹{(tm.remainingPurse||tm.initialPurse)?.toLocaleString()}</span>
                        </div>
                        <div className="purse-track">
                          <div className={`h-full rounded-full transition-all ${pct<25?"bg-flame-500":"bg-jade-500"}`} style={{width:`${pct}%`}}/>
                        </div>
                        <div className="flex justify-between text-2xs mt-1.5 text-ink-500">
                          <span>{tm.squad?.length||0}/{tm.maxPlayers} players</span>
                          <span className="group-hover:text-gold-400 transition flex items-center gap-1">
                            View squad <i className="fa-solid fa-arrow-right text-2xs" />
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
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="relative border-t border-gold-500/10 bg-ink-950/90 backdrop-blur-md">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-base font-semibold gold-gradient-text">BidArena Auctions</span>
            <span className="text-2xs text-ink-500">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-ink-400">
            <Link to="/player-registration" className="hover:text-gold-400 transition">Player Registration</Link>
            {t && <Link to={`/watch/${t._id}`} className="hover:text-gold-400 transition">Watch Auction</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}
