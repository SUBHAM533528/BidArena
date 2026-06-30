import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { Empty, ThemeToggle } from "../components/UI";
import StadiumBg from "../components/StadiumBg";

const ROLE_BADGE = {
  Batsman:        "badge-gold",
  Bowler:         "badge-green",
  "All-Rounder":  "badge-red",
  "Wicket Keeper":"badge-slate",
};

export default function TeamProfile() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/teams/${teamId}`)
      .then(r => setTeam(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl animate-pulse mb-3">🏏</div>
        <p className="text-sm dark:text-ink-500 text-ink-400">Loading team…</p>
      </div>
    </div>
  );

  if (!team) return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🛡️</div>
        <p className="dark:text-ink-300 text-ink-600 font-semibold mb-2">Team not found</p>
        <Link to="/" className="text-sm text-gold-500 hover:text-gold-400">← Back to home</Link>
      </div>
    </div>
  );

  const spent = (team.initialPurse || 0) - (team.remainingPurse || 0);
  const pct   = Math.max(0, Math.min(100, (team.remainingPurse / team.initialPurse) * 100));

  // Group squad by role
  const byRole = {};
  (team.squad || []).forEach(({ player: p, soldPrice }) => {
    if (!p) return;
    const r = p.role || "Other";
    if (!byRole[r]) byRole[r] = [];
    byRole[r].push({ ...p, soldPrice });
  });

  const totalPlayers = team.squad?.length || 0;

  return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 dark:text-ink-100 text-ink-900 transition-colors duration-300">
      <StadiumBg opacity={0.18} />

      {/* ── NAV ─────────────────────────────────── */}
      <header className="sticky top-0 z-30 dark:bg-ink-950/90 bg-white/90 backdrop-blur-md border-b dark:border-ink-800 border-ink-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-base font-bold text-gold-500 tracking-wide">
            StrikeZone <span className="dark:text-ink-500 text-ink-400 font-normal">Auctions</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="text-sm dark:text-ink-400 text-ink-500 hover:text-gold-500 transition">
              ← All Teams
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">

        {/* ── TEAM HERO ────────────────────────── */}
        <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 shadow-card-dark overflow-hidden mb-8">
          {/* Gold top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo */}
              <div className="h-24 w-24 rounded-2xl dark:bg-ink-700 bg-ink-100 border dark:border-ink-600 border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                {team.logo
                  ? <img src={team.logo} className="h-full w-full object-cover" alt={team.name} />
                  : <span className="text-4xl">🛡️</span>}
              </div>

              <div className="flex-1 min-w-0">
                <p className="eyebrow mb-1">Team Owner: {team.ownerName}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold dark:text-white text-ink-900 mb-5">
                  {team.name}
                </h1>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Players Bought",   value: totalPlayers,                       color: "text-gold-500" },
                    { label: "Max Squad Size",   value: team.maxPlayers,                    color: "dark:text-ink-300 text-ink-700" },
                    { label: "Total Spent",      value: `₹${spent.toLocaleString()}`,       color: "text-flame-500" },
                    { label: "Purse Remaining",  value: `₹${team.remainingPurse?.toLocaleString()}`, color: "text-jade-500" },
                  ].map(s => (
                    <div key={s.label} className="card-inset rounded-xl p-3">
                      <p className="eyebrow mb-1.5">{s.label}</p>
                      <p className={`font-mono font-bold text-lg leading-none ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Purse bar */}
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="dark:text-ink-500 text-ink-400">Purse used</span>
                    <span className="font-mono dark:text-ink-400 text-ink-500">
                      ₹{spent.toLocaleString()} / ₹{team.initialPurse?.toLocaleString()}
                    </span>
                  </div>
                  <div className="purse-track">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct < 25 ? "bg-flame-500" : pct < 60 ? "bg-gold-500" : "bg-jade-500"
                      }`}
                      style={{ width: `${100 - pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-2xs mt-1.5 dark:text-ink-600 text-ink-400">
                    <span>{(100 - pct).toFixed(1)}% used</span>
                    <span>{pct.toFixed(1)}% remaining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SQUAD ───────────────────────────── */}
        {totalPlayers === 0 ? (
          <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 p-10">
            <Empty icon="🏏" title="No players purchased yet"
              body="This team hasn't made any bids yet. Check back once the auction begins." />
          </div>
        ) : (
          Object.entries(byRole).map(([role, players]) => (
            <div key={role} className="mb-10">
              {/* Role header */}
              <div className="flex items-center gap-3 mb-5">
                <h2 className="font-display text-2xl font-semibold dark:text-ink-100 text-ink-800">{role}s</h2>
                <span className={ROLE_BADGE[role]}>{players.length} player{players.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 h-px dark:bg-ink-800 bg-ink-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((p, idx) => (
                  <div key={p._id}
                    className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-4 flex items-center gap-4 hover:border-gold-500/50 dark:hover:bg-ink-800 hover:bg-ink-50 transition-all duration-200 shadow-card-light dark:shadow-card-dark group">
                    {/* Photo */}
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 rounded-xl dark:bg-ink-700 bg-ink-100 overflow-hidden flex items-center justify-center border dark:border-ink-600 border-ink-200">
                        {p.photo
                          ? <img src={p.photo} className="h-full w-full object-cover" alt={p.fullName} />
                          : <span className="text-2xl opacity-40">🏏</span>}
                      </div>
                      <span className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full dark:bg-ink-900 bg-white border dark:border-ink-700 border-ink-200 flex items-center justify-center text-2xs font-bold dark:text-ink-500 text-ink-400">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate group-hover:text-gold-500 transition">
                        {p.fullName}
                      </p>
                      <p className="text-2xs dark:text-ink-500 text-ink-400 truncate mt-0.5">
                        {p.battingStyle || p.bowlingStyle || role}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="eyebrow" style={{ fontSize: "9px" }}>Sold for</p>
                          <p className="font-mono font-bold text-gold-500">₹{p.soldPrice?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="eyebrow" style={{ fontSize: "9px" }}>Base</p>
                          <p className="font-mono text-xs dark:text-ink-500 text-ink-400">₹{p.basePrice?.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
