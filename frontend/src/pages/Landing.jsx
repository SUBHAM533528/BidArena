import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import CountdownTimer from "../components/CountdownTimer";
import StadiumBg from "../components/StadiumBg";
import { ThemeToggle } from "../components/UI";

export default function Landing() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [nav, setNav] = useState(false);
  const t = tournaments.find(x => x.isActive) || tournaments[0];

  useEffect(() => { api.get("/tournaments").then(r => setTournaments(r.data)).catch(() => {}); }, []);
  useEffect(() => { if (t) api.get(`/teams?tournament=${t._id}`).then(r => setTeams(r.data)).catch(() => {}); }, [t?._id]);

  const now = Date.now();
  const regEnd  = t?.registrationEndDate   ? +new Date(t.registrationEndDate) : null;
  const tStart  = t?.startDate             ? +new Date(t.startDate)           : null;
  const regOpen = t?.registrationOpen && regEnd && regEnd > now;

  return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 dark:text-ink-100 text-ink-900 font-body transition-colors duration-300">
      <StadiumBg opacity={0.22} />

      {/* ── NAV ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 dark:bg-ink-950/90 bg-white/90 backdrop-blur-md border-b dark:border-ink-800 border-ink-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            {t?.logo && <img src={t.logo} className="h-8 w-8 rounded object-cover" alt="logo" />}
            <span className="font-display text-3xl font-semibold text-gold-500 tracking-wide">
              Bid<span className="dark:text-ink-400 text-ink-400 font-normal">Arena</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/player-registration" className="px-3 py-2 text-sm dark:text-ink-400 text-ink-500 dark:hover:text-ink-200 hover:text-ink-800 rounded-lg dark:hover:bg-ink-800 hover:bg-ink-100 transition">Player Registration</Link>            
            <div className="ml-3 pl-3 border-l dark:border-ink-800 border-ink-200">
              {/* <ThemeToggle /> */}
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button className="p-2 rounded-lg dark:hover:bg-ink-800 hover:bg-ink-100 transition" onClick={() => setNav(!nav)}>
              <div className={`w-5 h-px dark:bg-ink-400 bg-ink-600 mb-1.5 transition-all ${nav ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-5 h-px dark:bg-ink-400 bg-ink-600 mb-1.5 transition-all ${nav ? "opacity-0" : ""}`} />
              <div className={`w-5 h-px dark:bg-ink-400 bg-ink-600 transition-all ${nav ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {nav && (
          <div className="md:hidden dark:bg-ink-950 bg-white border-t dark:border-ink-800 border-ink-200 px-4 py-3 space-y-1 animate-slide-down">
            {[["/player-registration","Player Registration"],["/owner/register","Team Owner Signup"],["/owner/login","Owner Login"],
              ...(t?[[`/watch/${t._id}`,"📡 Watch Live Auction"]]:[])]
              .map(([to, label]) => (
                <Link key={to} to={to} onClick={() => setNav(false)}
                  className="block px-3 py-2.5 text-sm rounded-lg dark:text-ink-300 text-ink-600 dark:hover:bg-ink-800 hover:bg-ink-100 transition">
                  {label}
                </Link>
              ))}
          </div>
        )}
      </header>

      {/* ── HERO ────────────────────────────────── */}
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

            {/* Countdowns */}
            {tStart && tStart > now && (
              <div className="mb-8 p-4 rounded-xl dark:bg-ink-800/60 bg-white border dark:border-ink-700 border-ink-200">
                <p className="eyebrow mb-3">🏆 Tournament starts in</p>
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
                  Register as Player →
                </Link>
              </div>
            )}

            <div className="flex flex-wrap gap-3">

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

          {/* Tournament info card */}
          {t ? (
            <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 overflow-hidden shadow-card-light dark:shadow-card-dark animate-fade-up">
              <div className="px-6 py-4 border-b dark:border-ink-800 border-ink-100 dark:bg-ink-900/40 bg-ink-50">
                <p className="eyebrow mb-1">Tournament Details</p>
                <p className="font-display text-xl font-semibold dark:text-ink-50 text-ink-900">{t.name}</p>
              </div>
              <div className="divide-y dark:divide-ink-800 divide-ink-100">
                {[
                  ["📍 Venue",       t.venue || "TBA"],
                  ["📅 Start",       t.startDate ? new Date(t.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) : "TBA"],
                  ["📅 End",         t.endDate   ? new Date(t.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})   : "TBA"],
                  ["🛡️ Max Teams",   `${t.maxTeams} teams`],
                  ["🏏 Max Players", `${t.maxPlayers} players`],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between items-center px-6 py-3">
                    <span className="text-sm dark:text-ink-500 text-ink-500">{l}</span>
                    <span className="text-sm font-medium dark:text-ink-200 text-ink-800">{v}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-6 py-3">
                  <span className="text-sm dark:text-ink-500 text-ink-500">📝 Registration</span>
                  <span className={`badge ${t.registrationOpen ? "badge-green" : "badge-red"}`}>
                    {t.registrationOpen ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-center h-64 rounded-2xl border-2 border-dashed dark:border-ink-800 border-ink-200">
              <div className="text-center">
                <p className="text-5xl mb-3">🏏</p>
                <p className="dark:text-ink-500 text-ink-400 text-sm">No active tournament</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── TEAMS ───────────────────────────────── */}
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
                        {tm.logo ? <img src={tm.logo} className="h-full w-full object-cover" alt={tm.name} />
                          : <span className="text-xl">🛡️</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold dark:text-ink-100 text-ink-900 truncate group-hover:text-gold-500 transition">{tm.name}</p>
                        <p className="text-2xs dark:text-ink-500 text-ink-400 truncate">{tm.ownerName}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-2xs mb-1.5">
                        <span className="dark:text-ink-500 text-ink-400">Purse left</span>
                        <span className="font-mono font-semibold text-jade-500">₹{(tm.remainingPurse || tm.initialPurse)?.toLocaleString()}</span>
                      </div>
                      <div className="purse-track">
                        <div className={`h-full rounded-full transition-all ${pct < 25 ? "bg-flame-500" : "bg-jade-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-2xs mt-1.5 dark:text-ink-600 text-ink-400">
                        <span>{tm.squad?.length || 0}/{tm.maxPlayers} players</span>
                        <span className="group-hover:text-gold-500 transition">View squad →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="border-t dark:border-ink-800 border-ink-200 dark:bg-ink-950 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-base font-semibold text-gold-500">BidArena</span>
            <span className="text-xs mt-1 dark:text-ink-600 text-ink-400">©{new Date().getFullYear()} all rights reserved here</span>
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
