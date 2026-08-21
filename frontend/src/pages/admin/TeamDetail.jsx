import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import { Button, Empty, Alert } from "../../components/UI";

const ROLE_BADGE = {
  Batsman: "badge-gold", Bowler: "badge-green",
  "All-Rounder": "badge-red", "Wicket Keeper": "badge-slate",
};

export default function TeamDetail() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api.get(`/teams/${teamId}`).then(r => setTeam(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load team"));
  };
  useEffect(load, [teamId]);

  const downloadPDF = async () => {
  setDownloading(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://bidarena-backend-su27.onrender.com/api/reports/pdf/team/${teamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error("Failed to generate PDF");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${team?.name?.replace(/\s+/g, "_")}_squad.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (err) {
    alert(err.message || "Failed to download PDF");
  } finally { setDownloading(false); }
};

  if (error) return (
    <div className="max-w-lg">
      <Alert type="error">{error}</Alert>
      <Button variant="ghost" size="sm" className="mt-3" onClick={load}>
        <i className="fa-solid fa-rotate-right" /> Retry
      </Button>
    </div>
  );

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
        <Link to={team.tournament ? `/admin/teams/tournament/${team.tournament}` : "/admin/teams"} className="dark:text-ink-500 text-ink-400 hover:text-jade-500 transition">Teams</Link>
        <span className="dark:text-ink-700 text-ink-400">/</span>
        <span className="dark:text-ink-200 text-ink-700 font-medium">{team.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl dark:bg-white/[0.08] bg-ink-100 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
            {team.logo ? <img src={team.logo} className="h-full w-full object-cover" alt={team.name} /> : <i className="fa-solid fa-shield-halved text-base opacity-60" />}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">{team.name}</h1>
            <p className="text-sm dark:text-ink-500 text-ink-400 mt-0.5">Owner: {team.ownerName} · {team.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} variant="primary" disabled={downloading}>
            {downloading ? "Generating…" : "⬇ Download Squad PDF"}
          </Button>
          <Link to={`/team/${teamId}`} target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border dark:border-white/[0.08] border-ink-300 dark:text-ink-300 text-ink-700 rounded-lg hover:border-jade-500 hover:text-jade-500 transition">
            🌐 Public Page ↗
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Players Bought",   value:team.squad?.length||0,                      accent:"border-l-jade-500"  },
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
      <div className="dark:bg-white/[0.03] bg-white rounded-xl border dark:border-white/[0.08] border-ink-200 p-5 mb-6">
        <div className="flex justify-between text-sm mb-3">
          <span className="dark:text-ink-400 text-ink-400 font-medium">Purse Utilisation</span>
          <span className="font-mono dark:text-ink-300 text-ink-400">
            ₹{spent.toLocaleString()} spent of ₹{team.initialPurse?.toLocaleString()}
          </span>
        </div>
        <div className="h-3 dark:bg-white/[0.05] bg-ink-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${
            (100-pct) > 80 ? "bg-flame-500" : (100-pct) > 50 ? "bg-jade-500" : "bg-jade-500"
          }`} style={{ width: `${100 - pct}%` }} />
        </div>
        <div className="flex justify-between text-2xs mt-2 dark:text-ink-400 text-ink-400">
          <span>{(100 - pct).toFixed(1)}% used</span>
          <span>{pct.toFixed(1)}% left</span>
        </div>
      </div>

      {/* Squad table by role */}
      {(team.squad?.length || 0) === 0 ? (
        <div className="dark:bg-white/[0.03] bg-white rounded-xl border dark:border-white/[0.08] border-ink-200 p-10">
          <Empty icon="fa-solid fa-baseball-bat-ball" title="No players purchased yet" />
        </div>
      ) : (
        Object.entries(byRole).map(([role, players]) => (
          <div key={role} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-display text-xl font-semibold dark:text-ink-100 text-ink-800">{role}s</h2>
              <span className={ROLE_BADGE[role]}>{players.length}</span>
            </div>
            <div className="dark:bg-white/[0.03] bg-white rounded-xl border dark:border-white/[0.08] border-ink-200 overflow-hidden shadow-card-light dark:shadow-card-dark">
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
                              <div className="h-8 w-8 rounded-lg dark:bg-white/[0.08] bg-ink-100 overflow-hidden flex items-center justify-center border dark:border-white/[0.1] border-ink-200 shrink-0">
                                {p.photo ? <img src={p.photo} className="h-full w-full object-cover" /> : <i className="fa-solid fa-baseball-bat-ball text-xl opacity-40" />}
                              </div>
                              <span className="font-semibold dark:text-ink-100 text-ink-900">{p.fullName}</span>
                            </div>
                          </td>
                          <td className="dark:text-ink-400 text-ink-400">{p.battingStyle || "—"}</td>
                          <td className="dark:text-ink-400 text-ink-400">{p.bowlingStyle || "—"}</td>
                          <td className="font-mono dark:text-ink-400 text-ink-400">₹{p.basePrice?.toLocaleString()}</td>
                          <td className="font-mono font-bold text-jade-500">₹{p.soldPrice?.toLocaleString()}</td>
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
              <div className="px-4 py-3 border-t dark:border-white/[0.06] border-ink-100 flex justify-end gap-8 dark:bg-ink-900/40 bg-ink-50">
                <span className="text-sm dark:text-ink-500 text-ink-400">Role total:</span>
                <span className="font-mono font-bold text-jade-500">
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
