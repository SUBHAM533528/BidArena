import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Alert, Button, Badge, Empty } from "../../components/UI";

const STATUS_META = {
  running: { label: "Live now",  dot: "bg-jade-500 animate-pulse",  badge: "badge-green" },
  paused:  { label: "Paused",    dot: "bg-jade-500",                badge: "badge-gold"  },
  ended:   { label: "Ended",     dot: "dark:bg-white/[0.12] bg-ink-300", badge: "badge-slate" },
  idle:    { label: "Not started", dot: "dark:bg-white/[0.12] bg-ink-300", badge: "badge-slate" },
};

// Every tournament runs its own isolated auction (own socket room, own
// timer, own AuctionState document) so any number of them can be live
// at the same time — e.g. 3 different venues auctioning simultaneously —
// without one affecting another. This page is the control-center view:
// a single glance at every tournament's live auction status, so you can
// jump straight into whichever one needs attention.
export default function AuctionOverview() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get("/auction/overview")
      .then(r => setRows(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load auctions"));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 8000); // light polling so live status stays fresh across all rooms
    return () => clearInterval(id);
  }, []);

  const liveCount = rows?.filter(r => r.status === "running").length || 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1.5">Control Center</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Live Auctions</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">
            Run auctions for multiple tournaments at the same time — each one is fully independent.
          </p>
        </div>
        {liveCount > 0 && (
          <span className="badge-green flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />{liveCount} live now
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error">{error}</Alert>
          <Button variant="ghost" size="sm" className="mt-3" onClick={load}>
            <i className="fa-solid fa-rotate-right" /> Retry
          </Button>
        </div>
      )}

      {!rows ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-44 shimmer" />)}
        </div>
      ) : rows.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-gavel" title="No tournaments yet" body="Create a tournament first to run an auction." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map(row => {
            const meta = STATUS_META[row.status] || STATUS_META.idle;
            const t = row.tournament;
            return (
              <div key={t._id} className="card p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg dark:bg-white/[0.08] bg-ink-100 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                      {t.logo ? <img src={t.logo} className="h-full w-full object-cover" alt={t.name} /> : <i className="fa-solid fa-trophy text-sm opacity-50" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                      <p className="text-2xs dark:text-ink-500 text-ink-400 truncate">{t.venue || "Venue TBA"}</p>
                    </div>
                  </div>
                  <span className={`${meta.badge} shrink-0 flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />{meta.label}
                  </span>
                </div>

                <div className="card-inset rounded-lg p-3 mb-4 flex-1">
                  {row.status === "running" || row.status === "paused" ? (
                    row.currentPlayer ? (
                      <>
                        <p className="eyebrow mb-1">On the block</p>
                        <p className="text-sm font-semibold dark:text-ink-100 text-ink-900 truncate">{row.currentPlayer}</p>
                        <p className="font-mono text-lg font-bold text-jade-500 mt-1">
                          ₹{row.currentBidAmount.toLocaleString()}
                        </p>
                        {row.currentBidTeam && (
                          <p className="text-2xs text-jade-600 mt-0.5">{row.currentBidTeam}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs dark:text-ink-500 text-ink-400">Waiting to pick next player…</p>
                    )
                  ) : (
                    <p className="text-xs dark:text-ink-500 text-ink-400">Auction hasn't started yet.</p>
                  )}
                </div>

                <div className="flex justify-between text-2xs dark:text-ink-500 text-ink-400 mb-4">
                  <span>{row.teamCount} teams</span>
                  <span>{row.soldCount} sold</span>
                  <span>{row.poolCount} in pool</span>
                </div>

                <Link to={`/admin/auction/${t._id}`}>
                  <Button variant="primary" className="w-full">
                    {row.status === "running" ? "Open Live Room" : "Open Auction Room"} <i className="fa-solid fa-arrow-right text-xs" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
