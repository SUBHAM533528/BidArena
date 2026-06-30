import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Select, Empty } from "../../components/UI";

export default function SoldPlayers() {
  const [players, setPlayers]         = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid]                 = useState("");

  useEffect(() => {
    api.get("/tournaments").then(r => { setTournaments(r.data); if (r.data[0]) setTid(r.data[0]._id); });
  }, []);

  useEffect(() => {
    const qs = new URLSearchParams({ auctionStatus:"Sold" });
    if (tid) qs.append("tournament", tid);
    api.get(`/players?${qs}`).then(r => setPlayers(r.data));
  }, [tid]);

  const total = players.reduce((s, p) => s + (p.soldPrice || 0), 0);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-1.5">Auction Results</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Sold Players</h1>
        </div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e => setTid(e.target.value)} className="w-auto text-xs">
            {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Sold",    value:players.length,                            accent:"border-l-jade-500" },
          { label:"Total Value",   value:`₹${total.toLocaleString()}`,              accent:"border-l-gold-500" },
          { label:"Highest Bid",   value:players[0]?.soldPrice ? `₹${Math.max(...players.map(p=>p.soldPrice||0)).toLocaleString()}` : "—", accent:"border-l-flame-500" },
        ].map(s => (
          <div key={s.label} className={`stat-card border-l-4 ${s.accent}`}>
            <p className="eyebrow mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold dark:text-ink-50 text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {players.length === 0 ? (
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-10">
          <Empty icon="✅" title="No players sold yet" body="Sold players will appear here once bidding starts." />
        </div>
      ) : (
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 overflow-hidden shadow-card-dark">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Base Price</th>
                  <th>Sold Price</th>
                  <th>Profit</th>
                  <th>Team</th>
                </tr>
              </thead>
              <tbody>
                {players
                  .sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))
                  .map((p, i) => {
                    const profit = (p.soldPrice || 0) - (p.basePrice || 0);
                    return (
                      <tr key={p._id}>
                        <td className="dark:text-ink-600 text-ink-400 font-mono text-xs">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg dark:bg-ink-700 bg-ink-100 overflow-hidden flex items-center justify-center border dark:border-ink-600 border-ink-200 shrink-0">
                              {p.photo ? <img src={p.photo} className="h-full w-full object-cover" /> : <span className="text-base opacity-40">🏏</span>}
                            </div>
                            <span className="font-semibold dark:text-ink-100 text-ink-900">{p.fullName}</span>
                          </div>
                        </td>
                        <td>
                          <span className={{
                            Batsman:"badge-gold", Bowler:"badge-green",
                            "All-Rounder":"badge-red","Wicket Keeper":"badge-slate"
                          }[p.role]}>
                            {p.role}
                          </span>
                        </td>
                        <td className="font-mono dark:text-ink-400 text-ink-500 text-sm">₹{p.basePrice?.toLocaleString()}</td>
                        <td className="font-mono font-bold text-gold-500">₹{p.soldPrice?.toLocaleString()}</td>
                        <td className={`font-mono font-semibold text-sm ${profit >= 0 ? "text-jade-500" : "text-flame-500"}`}>
                          {profit >= 0 ? "+" : ""}₹{profit.toLocaleString()}
                        </td>
                        <td>
                          {p.soldTo ? (
                            <Link to={`/admin/teams/${p.soldTo._id}`}
                              className="flex items-center gap-2 group">
                              <div className="h-6 w-6 rounded dark:bg-ink-700 bg-ink-100 overflow-hidden flex items-center justify-center border dark:border-ink-600 border-ink-200 shrink-0">
                                {p.soldTo.logo ? <img src={p.soldTo.logo} className="h-full w-full object-cover" /> : <span className="text-xs">🛡</span>}
                              </div>
                              <span className="text-sm font-medium dark:text-ink-300 text-ink-600 group-hover:text-gold-500 transition truncate">{p.soldTo.name}</span>
                            </Link>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t dark:border-ink-800 border-ink-100 flex justify-between items-center dark:bg-ink-900/40 bg-ink-50">
            <span className="text-xs dark:text-ink-500 text-ink-400">{players.length} players sold</span>
            <span className="font-mono font-bold text-gold-500">Total: ₹{total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
