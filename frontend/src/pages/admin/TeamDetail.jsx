import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { Button, Empty } from "../../components/UI";

const ROLE_BADGE = {
  Batsman: "badge-gold", Bowler: "badge-green",
  "All-Rounder": "badge-red", "Wicket Keeper": "badge-slate",
};

export default function TeamDetail() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get(`/teams/${teamId}`).then(r => setTeam(r.data));
  }, [teamId]);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/reports/pdf/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${team?.name?.replace(/\s+/g,"_")}_squad.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally { setDownloading(false); }
  };

  if (!team) return (
    <div className="flex items-center justify-center h-48">
      <p className="dark:text-ink-500 text-ink-400 text-sm animate-pulse">Loading team…</p>
    </div>
  );

  const spent = (team.initialPurse || 0) - (team.remainingPurse || 0);
  const pct   = Math.max(0, Math.min(100, (team.remainingPurse / team.initialPurse) * 100));

  const byRole = {};
  (team.squad || []).forEach(({ player: p, soldPrice, soldAt }) => {
    if (!p) return;
    if (!byRole[p.role]) byRole[p.role] = [];
    byRole[p.role].push({ ...p, soldPrice, soldAt });
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/admin/teams" className="dark:text-ink-500 text-ink-400 hover:text-gold-500 transition">Teams</Link>
        <span className="dark:text-ink-700 text-ink-300">/</span>
        <span className="dark:text-ink-200 text-ink-700 font-medium">{team.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl dark:bg-ink-700 bg-ink-100 border dark:border-ink-600 border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
            {team.logo ? <img src={team.logo} className="h-full w-full object-cover" alt={team.name} /> : <span className="text-2xl">🛡️</span>}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">{team.name}</h1>
            <p className="text-sm dark:text-ink-500 text-ink-400 mt-0.5">Owner: {team.ownerName} · {team.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} variant="primary" disabled={downloading}>
            {downloading ? "⏳ Generating…" : "⬇ Download Squad PDF"}
          </Button>
          <Link to={`/team/${teamId}`} target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border dark:border-ink-700 border-ink-300 dark:text-ink-300 text-ink-700 rounded-lg hover:border-gold-500 hover:text-gold-500 transition">
            🌐 Public Page ↗
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Players Bought",   value:team.squad?.length||0,                      accent:"border-l-gold-500"  },
          { label:"Max Squad Size",   value:team.maxPlayers,                            accent:"border-l-ink-500"   },
          { label:"Total Spent",      value:`₹${spent.toLocaleString()}`,               accent:"border-l-flame-500" },
          { label:"Purse Remaining",  value:`₹${team.remainingPurse?.toLocaleString()}`,accent:"border-l-jade-500"  },
        ].map(s => (
          <div key={s.label} className={`stat-card border-l-4 ${s.accent}`}>
            <p className="eyebrow mb-2">{s.label}</p>
            <p className="font-display text-2xl font-bold dark:text-ink-50 text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Purse bar */}
      <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5 mb-6">
        <div className="flex justify-between text-sm mb-3">
          <span className="dark:text-ink-400 text-ink-500 font-medium">Purse Utilisation</span>
          <span className="font-mono dark:text-ink-300 text-ink-600">
            ₹{spent.toLocaleString()} spent of ₹{team.initialPurse?.toLocaleString()}
          </span>
        </div>
        <div className="h-3 dark:bg-ink-800 bg-ink-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${
            (100-pct) > 80 ? "bg-flame-500" : (100-pct) > 50 ? "bg-gold-500" : "bg-jade-500"
          }`} style={{ width: `${100 - pct}%` }} />
        </div>
        <div className="flex justify-between text-2xs mt-2 dark:text-ink-600 text-ink-400">
          <span>{(100 - pct).toFixed(1)}% used</span>
          <span>{pct.toFixed(1)}% left</span>
        </div>
      </div>

      {/* Squad table by role */}
      {(team.squad?.length || 0) === 0 ? (
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-10">
          <Empty icon="🏏" title="No players purchased yet" />
        </div>
      ) : (
        Object.entries(byRole).map(([role, players]) => (
          <div key={role} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-semibold dark:text-ink-100 text-ink-800">{role}s</h2>
              <span className={ROLE_BADGE[role]}>{players.length}</span>
            </div>
            <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 overflow-hidden shadow-card-light dark:shadow-card-dark">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th>Batting Style</th>
                      <th>Bowling Style</th>
                      <th>Base Price</th>
                      <th>Sold Price</th>
                      <th>Profit</th>
                      <th>Sold At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((p, i) => {
                      const profit = (p.soldPrice || 0) - (p.basePrice || 0);
                      return (
                        <tr key={p._id}>
                          <td className="dark:text-ink-500 text-ink-400 font-mono text-xs">{i + 1}</td>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg dark:bg-ink-700 bg-ink-100 overflow-hidden flex items-center justify-center border dark:border-ink-600 border-ink-200 shrink-0">
                                {p.photo ? <img src={p.photo} className="h-full w-full object-cover" /> : <span className="text-sm opacity-40">🏏</span>}
                              </div>
                              <span className="font-semibold dark:text-ink-100 text-ink-900">{p.fullName}</span>
                            </div>
                          </td>
                          <td className="dark:text-ink-400 text-ink-500">{p.battingStyle || "—"}</td>
                          <td className="dark:text-ink-400 text-ink-500">{p.bowlingStyle || "—"}</td>
                          <td className="font-mono dark:text-ink-400 text-ink-500">₹{p.basePrice?.toLocaleString()}</td>
                          <td className="font-mono font-bold text-gold-500">₹{p.soldPrice?.toLocaleString()}</td>
                          <td className={`font-mono font-semibold ${profit >= 0 ? "text-jade-500" : "text-flame-500"}`}>
                            {profit >= 0 ? "+" : ""}₹{profit.toLocaleString()}
                          </td>
                          <td className="dark:text-ink-500 text-ink-400 text-xs">
                            {p.soldAt ? new Date(p.soldAt).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Total row */}
              <div className="px-4 py-3 border-t dark:border-ink-800 border-ink-100 flex justify-end gap-8 dark:bg-ink-900/40 bg-ink-50">
                <span className="text-sm dark:text-ink-500 text-ink-400">Role total:</span>
                <span className="font-mono font-bold text-gold-500">
                  ₹{players.reduce((s, p) => s + (p.soldPrice || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
