import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CountdownTimer from "../components/CountdownTimer";
import SEO, { buildSportsEventSchema, buildOrganizationSchema } from "../components/SEO";

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
  const [teams,       setTeams]       = useState([]);
  const [nav,         setNav]         = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  const t = tournaments.find(x => x.isActive) || tournaments[0];

  useEffect(() => { api.get("/tournaments").then(r => setTournaments(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (t) api.get(`/teams?tournament=${t._id}`).then(r => setTeams(r.data)).catch(() => {}); }, [t?._id]);

  // Transparent navbar — becomes solid after scrolling past the hero
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const now = Date.now();
  const regEnd  = t?.registrationEndDate ? +new Date(t.registrationEndDate) : null;
  const tStart  = t?.startDate           ? +new Date(t.startDate)           : null;
  const regOpen = t?.registrationOpen && regEnd && regEnd > now;

  const navSolid = scrolled || nav;

  return (
    <div className="relative min-h-screen bg-[#0a0d0a] text-ink-100 font-body overflow-x-hidden">
      <SEO
        title={t ? `${t.name} — Live Cricket Auction` : "Live Cricket Auction Platform"}
        description={t?.description || "IPL-style live cricket auction platform. Register teams, conduct live auctions with real-time bidding and purse tracking."}
        jsonLd={t ? [buildSportsEventSchema(t), buildOrganizationSchema()] : [buildOrganizationSchema()]}
      />

      {/* ── NAV ─────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        navSolid ? "bg-[#0a0d0a]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_8px_24px_rgba(0,0,0,0.4)]" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            {t?.logo && (
              <div className="h-9 w-9 rounded-lg overflow-hidden ring-2 ring-gold-500/30 group-hover:ring-gold-500/60 transition">
                <img src={t.logo} className="h-full w-full object-cover" alt="logo" />
              </div>
            )}
            <span className="font-editorial text-2xl font-bold tracking-wide text-gold-400">
              Bid<span className="font-normal text-ink-400 text-2xl">Arena</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/player-registration"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-ink-300 hover:text-gold-400 hover:bg-white/5">
              Player Registration
            </Link>
            {t && (
              <Link to={`/watch/${t._id}`}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-ink-300 hover:text-flame-400 hover:bg-white/5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live
              </Link>
            )}
          </nav>

          <div className="hidden md:block">
            <Link to="/owner/register"
              className="px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-[#1a1206] font-bold text-sm rounded-lg transition shadow-lg shadow-gold-500/20">
              Register Now
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button className="p-2 rounded-lg transition text-ink-300 hover:bg-white/5" onClick={() => setNav(!nav)}>
              <div className={`w-5 h-px mb-1.5 transition-all bg-ink-300 ${nav ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-px mb-1.5 transition-all bg-ink-300 ${nav ? "opacity-0" : ""}`} />
              <div className={`w-5 h-px transition-all bg-ink-300 ${nav ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {nav && (
          <div className="md:hidden bg-[#0d100d] border-t border-white/[0.06] px-4 py-3 space-y-1 animate-slide-down">
            <Link to="/player-registration" onClick={() => setNav(false)}
              className="block px-3 py-2.5 text-sm rounded-lg text-ink-300 hover:bg-white/5 hover:text-gold-400 transition">
              Player Registration
            </Link>
            <Link to="/owner/register" onClick={() => setNav(false)}
              className="block px-3 py-2.5 text-sm rounded-lg text-ink-300 hover:bg-white/5 hover:text-gold-400 transition">
              Register Your Team
            </Link>
            {t && (
              <Link to={`/watch/${t._id}`} onClick={() => setNav(false)}
                className="block px-3 py-2.5 text-sm rounded-lg text-ink-300 hover:bg-white/5 hover:text-gold-400 transition">
                <i className="fa-solid fa-satellite-dish mr-2 text-flame-500" />Watch Live Auction
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        {/* stadium photo + dark scrim */}
        <div className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/29949985/pexels-photo-29949985.jpeg?cs=srgb&dl=pexels-imddicted-29949985.jpg&fm=jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#0a0d0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-32 pb-16 md:pb-24 w-full">
          <h1 className="font-editorial text-5xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-green-500 mb-5 max-w-3xl">
            {t
              ? <>Build Your Dream XI at the<br className="hidden sm:block" /> {t.name}</>
              : <>Build Your Dream XI at the<br className="hidden sm:block" /> Ultimate Cricket Auction</>}
          </h1>
          <p className="text-base sm:text-lg text-ink-300 leading-relaxed max-w-xl mb-8">
            {t?.description || "Bid, strategize, and assemble a championship squad. Real-time auctions. Real cricket glory."}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            
            <Link to="/player-registration"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/90 text-white hover:bg-white/40 font-semibold text-sm rounded-lg transition hover:-translate-y-0.5">
              Player Registration
            </Link>
            {t && (
              <Link to={`/watch/${t._id}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-flame-500/80 text-flame-400 hover:bg-flame-500/30 font-semibold text-sm rounded-lg transition hover:-translate-y-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live
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
                <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />Registration closes in
              </p>
              <CountdownTimer target={t.registrationEndDate} dark />
            </div>
          )}
        </div>
      </section>

      {/* ── TOURNAMENT DETAILS STRIP ──────────────────────────── */}
      {t && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 border-b border-white/[0.06]">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["fa-solid fa-location-dot", "Venue", t.venue || "TBA"],
              ["fa-regular fa-calendar", "Start Date", t.startDate ? new Date(t.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) : "TBA"],
              ["fa-solid fa-shield-halved", "Teams", `${teams.length}/${t.maxTeams}`],
              ["fa-solid fa-pen-to-square", "Registration", t.registrationOpen ? "Open" : "Closed"],
            ].map(([icon, l, v]) => (
              <div key={l} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 shrink-0">
                  <i className={`${icon} text-sm`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xs uppercase tracking-widest text-ink-500">{l}</p>
                  <p className="text-sm font-semibold text-ink-100 truncate">{v}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-10">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {(() => {
            const links = ["/owner/register", "/player-registration", t ? `/watch/${t._id}` : "/player-registration"];
            return (
              <>
                <Link to={links[0]}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-gold-500/20 transition-all p-8 flex flex-col justify-start min-h-[220px] md:min-h-[280px]">
                  <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-5 ${HOW_IT_WORKS[0].ring}`}>
                    <i className={`${HOW_IT_WORKS[0].icon} text-lg`} />
                  </div>
                  <p className="font-display text-xl font-semibold text-white mb-2">{HOW_IT_WORKS[0].title}</p>
                  <p className="text-sm text-ink-400 leading-relaxed max-w-sm">{HOW_IT_WORKS[0].body}</p>
                </Link>

                <div className="grid gap-5">
                  {HOW_IT_WORKS.slice(1).map((item, i) => (
                    <Link key={item.title} to={links[i + 1]}
                      className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04] hover:border-white/20 transition-all p-6">
                      <div className={`w-11 h-11 rounded-full border flex items-center justify-center mb-4 ${item.ring}`}>
                        <i className={`${item.icon} text-base`} />
                      </div>
                      <p className="font-display text-lg font-semibold text-white mb-1.5">{item.title}</p>
                      <p className="text-sm text-ink-400 leading-relaxed">{item.body}</p>
                    </Link>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* ── SPLIT: PLAYER REGISTRATION ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Every Player. Every Stat. One Platform.
            </h2>
            <p className="text-ink-400 leading-relaxed max-w-md mb-7">
              Browse detailed player profiles with career statistics, form ratings, and auction history. Register yourself to enter the player pool.
            </p>
            <Link to="/player-registration"
              className="inline-flex items-center gap-2 px-6 py-3 bg-jade-500 hover:bg-jade-400 text-[#08170f] font-bold text-sm rounded-lg transition shadow-lg shadow-jade-500/20">
              Register as Player
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/[0.08]">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JpY2tldCUyMHN0YWRpdW0lMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
              alt="Cricket player batting"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* ── SPLIT: WATCH LIVE / TEAMS TEASER ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] order-2 md:order-1">
            <img
              src="https://i.pinimg.com/736x/a6/0b/24/a60b245ed4eec51cbaa324bd1a1599d6.jpg"
              alt="Team celebrating on the field"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              Celebrate Like Champions
            </h2>
            <p className="text-ink-400 leading-relaxed max-w-md mb-7">
              From nail-biting auction wars to on-field glory — watch every bid live and follow your team's journey from squad to silverware.
            </p>
            {t ? (
              <Link to={`/watch/${t._id}`}
                className="inline-flex items-center gap-2 px-6 py-3 border border-flame-500/50 text-flame-400 hover:bg-flame-500/10 font-semibold text-sm rounded-lg transition">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500 animate-pulse" />Watch Live Auction
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
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-widest text-gold-400 mb-2">Participating</p>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white">Teams</h2>
              </div>
              <span className="text-sm text-ink-500 px-3 py-1 rounded-full border border-white/10">{teams.length} registered</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams.map(tm => {
                const pct = Math.max(0, Math.min(100, (tm.remainingPurse / tm.initialPurse) * 100));
                return (
                  <Link key={tm._id} to={`/team/${tm._id}`}
                    className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.05] hover:border-gold-500/30 p-4 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-11 w-11 rounded-xl bg-gold-500/10 overflow-hidden flex items-center justify-center shrink-0 border border-gold-500/20 group-hover:border-gold-500/40 transition">
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
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
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

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#0a0d0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-editorial text-lg font-bold text-gold-400">BidArena</span>
            <span className="text-base text-ink-500">©{new Date().getFullYear()} All rights reserved here.</span>
          </div>
          <div className="flex gap-6 text-sm text-ink-500">
            <Link to="/player-registration" className="hover:text-gold-400 transition">Player Registration</Link>
            {t && <Link to={`/watch/${t._id}`} className="hover:text-gold-400 transition">Watch Auction</Link>}
          </div>
        </div>
      </footer>
    </div>
  );
}
