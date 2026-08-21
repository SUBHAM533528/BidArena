import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Empty, Alert, Button } from "../../components/UI";

// "Teams" now starts at the tournament level — pick a tournament, then
// manage (add/edit/view) its teams on the next screen. Keeps things sane
// once there are several tournaments running teams/auctions in parallel.
export default function TeamManagement() {
  const [tournaments, setTournaments] = useState(null);
  const [teams, setTeams]             = useState([]);
  const [error, setError]             = useState("");

  const load = () => {
    setError("");
    Promise.all([api.get("/tournaments"), api.get("/teams")])
      .then(([tRes, teamRes]) => { setTournaments(tRes.data); setTeams(teamRes.data); })
      .catch(err => setError(err.response?.data?.message || "Failed to load tournaments"));
  };
  useEffect(load, []);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1.5">Manage</p>
        <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Teams</h1>
        <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Pick a tournament to view, add, or edit its teams.</p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error">{error}</Alert>
          <Button variant="ghost" size="sm" className="mt-3" onClick={load}>
            <i className="fa-solid fa-rotate-right" /> Retry
          </Button>
        </div>
      )}

      {!tournaments ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => <div key={i} className="card h-48 shimmer" />)}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-trophy" title="No tournaments yet" body="Create a tournament first, then come back here to add its teams." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {tournaments.map(t => {
            const tTeams = teams.filter(tm => tm.tournament === t._id);
            const pct = t.maxTeams ? Math.min(100, (tTeams.length / t.maxTeams) * 100) : 0;
            return (
              <Link key={t._id} to={`/admin/teams/tournament/${t._id}`}
                className="card p-6 hover:border-jade-500/40 hover:-translate-y-0.5 transition-all block">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-20 w-20 rounded-2xl dark:bg-white/[0.06] bg-ink-50 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.logo ? <img src={t.logo} className="h-full w-full object-contain p-1.5" alt={t.name} /> : <i className="fa-solid fa-trophy text-2xl opacity-30" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-lg dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                    <p className="text-sm dark:text-ink-500 text-ink-400 truncate">{t.venue || "Venue TBA"}</p>
                  </div>
                  {t.isActive && (
                    <span className="badge-green shrink-0 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />Active
                    </span>
                  )}
                </div>

                <div className="mb-1.5 flex justify-between text-xs dark:text-ink-500 text-ink-400">
                  <span>Teams registered</span>
                  <span className="font-mono font-semibold dark:text-ink-200 text-ink-700">{tTeams.length}/{t.maxTeams}</span>
                </div>
                <div className="purse-track mb-4">
                  <div className="h-full rounded-full bg-jade-500" style={{ width: `${pct}%` }} />
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade-600 hover:text-jade-500 transition">
                  Manage Teams <i className="fa-solid fa-arrow-right text-2xs" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
