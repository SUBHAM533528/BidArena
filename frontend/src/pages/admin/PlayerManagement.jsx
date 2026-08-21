import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Empty, Alert, Button } from "../../components/UI";

// "Players" starts at the tournament level, same as Teams — pick a
// tournament, then review/approve/pool its players on the next screen.
export default function PlayerManagement() {
  const [tournaments, setTournaments] = useState(null);
  const [players, setPlayers]         = useState([]);
  const [error, setError]             = useState("");

  const load = () => {
    setError("");
    Promise.all([api.get("/tournaments"), api.get("/players")])
      .then(([tRes, pRes]) => { setTournaments(tRes.data); setPlayers(pRes.data); })
      .catch(err => setError(err.response?.data?.message || "Failed to load tournaments"));
  };
  useEffect(load, []);

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1.5">Manage</p>
        <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Players</h1>
        <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Pick a tournament to review registrations, approve, or build the auction pool.</p>
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
          {[...Array(2)].map((_, i) => <div key={i} className="card h-52 shimmer" />)}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-trophy" title="No tournaments yet" body="Create a tournament first, then come back here to review its players." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {tournaments.map(t => {
            const tPlayers = players.filter(p => p.tournament === t._id);
            const pending  = tPlayers.filter(p => p.status === "Pending").length;
            const pool     = tPlayers.filter(p => p.auctionEligible).length;
            return (
              <Link key={t._id} to={`/admin/players/tournament/${t._id}`}
                className="card p-6 hover:border-jade-500/40 hover:-translate-y-0.5 transition-all block">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-20 w-20 rounded-2xl dark:bg-white/[0.06] bg-ink-50 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.logo ? <img src={t.logo} className="h-full w-full object-contain p-1.5" alt={t.name} /> : <i className="fa-solid fa-trophy text-2xl opacity-30" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-lg dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                    <p className="text-sm dark:text-ink-500 text-ink-400 truncate">{t.venue || "Venue TBA"}</p>
                  </div>
                  {pending > 0 && (
                    <span className="badge-gold shrink-0">{pending} Pending</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center card-inset rounded-lg p-3 mb-4">
                  <div>
                    <p className="font-bold text-sm dark:text-ink-200 text-ink-800">{tPlayers.length}</p>
                    <p className="eyebrow mt-0.5">Registered</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-jade-600">{pending}</p>
                    <p className="eyebrow mt-0.5">Pending</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-jade-600">{pool}</p>
                    <p className="eyebrow mt-0.5">In Pool</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade-600 hover:text-jade-500 transition">
                  Manage Players <i className="fa-solid fa-arrow-right text-2xs" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
