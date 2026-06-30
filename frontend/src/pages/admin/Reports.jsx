import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Select, Button, Empty } from "../../components/UI";

const PDF_REPORTS = [
  {
    key:      "all-players",
    icon:     "👥",
    title:    "All Registered Players",
    desc:     "Every player who registered — name, role, district, base price, approval status.",
    filename: "all_registered_players.pdf",
    accent:   "dark:border-ink-700 border-ink-200 hover:border-gold-500/50",
    badge:    "badge-gold",
  },
  {
    key:      "sold-players",
    icon:     "✅",
    title:    "Sold Players Report",
    desc:     "All sold players ranked by final price, with team, profit over base price, and totals.",
    filename: "sold_players.pdf",
    accent:   "dark:border-ink-700 border-ink-200 hover:border-jade-500/50",
    badge:    "badge-green",
  },
  {
    key:      "unsold-players",
    icon:     "❌",
    title:    "Unsold Players Report",
    desc:     "Players who went through auction but remained unsold — by role and base price.",
    filename: "unsold_players.pdf",
    accent:   "dark:border-ink-700 border-ink-200 hover:border-flame-500/50",
    badge:    "badge-red",
  },
  {
    key:      "all-teams",
    icon:     "🏆",
    title:    "All Teams Combined",
    desc:     "Cover page + one full squad page per team. Share with organisers, sponsors, or media.",
    filename: "all_teams_squads.pdf",
    accent:   "dark:border-ink-700 border-ink-200 hover:border-gold-500/50",
    badge:    "badge-gold",
  },
];

export default function Reports() {
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid]                 = useState("");
  const [teams, setTeams]             = useState([]);
  const [bids, setBids]               = useState([]);
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    api.get("/tournaments").then(r => {
      setTournaments(r.data);
      if (r.data[0]) setTid(r.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!tid) return;
    api.get(`/teams?tournament=${tid}`).then(r => setTeams(r.data));
    api.get(`/reports/bid-logs?tournament=${tid}`).then(r => setBids(r.data));
  }, [tid]);

  const dlPDF = async (endpoint, filename) => {
    setDownloading(filename);
    try {
      const token = localStorage.getItem("token");
      const qs    = tid ? `?tournament=${tid}` : "";
      const res   = await fetch(`/api/reports/${endpoint}${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert("PDF error: " + e.message);
    } finally {
      setDownloading("");
    }
  };

  const dlTeamPDF = async (team) => {
    setDownloading(team._id);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`/api/reports/pdf/team/${team._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob  = await res.blob();
      const a     = document.createElement("a");
      a.href      = URL.createObjectURL(blob);
      a.download  = `${team.name.replace(/\s+/g,"_")}_squad.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setDownloading("");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-1.5">Export</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Reports & PDFs</h1>
        </div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e => setTid(e.target.value)} className="w-auto text-xs">
            {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      {/* ── PDF REPORTS ─────────────────────────── */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-semibold dark:text-ink-200 text-ink-700 mb-4">Tournament PDFs</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PDF_REPORTS.map(r => (
            <div key={r.key}
              className={`dark:bg-ink-850 bg-white rounded-xl border transition-all duration-200 p-5 ${r.accent} shadow-card-light dark:shadow-card-dark`}>
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl dark:bg-ink-800 bg-ink-100 flex items-center justify-center text-2xl shrink-0">
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm dark:text-ink-100 text-ink-900">{r.title}</p>
                    <span className={r.badge}>PDF</span>
                  </div>
                  <p className="text-xs dark:text-ink-500 text-ink-400 mb-4 leading-relaxed">{r.desc}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={downloading === r.filename}
                    onClick={() => dlPDF(`pdf/${r.key}`, r.filename)}
                  >
                    {downloading === r.filename ? "⏳ Generating…" : "⬇ Download PDF"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PER-TEAM SQUAD PDFs ─────────────────── */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-xl font-semibold dark:text-ink-200 text-ink-700">Per-Team Squad PDFs</h2>
          <p className="text-xs dark:text-ink-500 text-ink-400">{teams.length} teams</p>
        </div>

        {teams.length === 0 ? (
          <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-8">
            <Empty icon="🛡️" title="No teams yet" body="Add teams in Team Management first." />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {teams.map(tm => (
              <div key={tm._id}
                className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-4 text-center hover:border-gold-500/50 transition shadow-card-light dark:shadow-card-dark">
                <div className="h-12 w-12 rounded-xl dark:bg-ink-700 bg-ink-100 mx-auto mb-3 overflow-hidden flex items-center justify-center border dark:border-ink-600 border-ink-200">
                  {tm.logo
                    ? <img src={tm.logo} className="h-full w-full object-cover" alt={tm.name} />
                    : <span className="text-xl">🛡️</span>}
                </div>
                <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate mb-0.5">{tm.name}</p>
                <p className="text-2xs dark:text-ink-500 text-ink-400 mb-3">{tm.squad?.length || 0} players</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => dlTeamPDF(tm)}
                    disabled={downloading === tm._id}
                    className="flex-1 py-1.5 text-2xs font-semibold rounded-lg dark:bg-ink-700 bg-ink-100 dark:text-ink-300 text-ink-600 hover:bg-gold-500/10 hover:text-gold-500 border dark:border-ink-600 border-ink-200 transition disabled:opacity-40"
                  >
                    {downloading === tm._id ? "⏳" : "⬇ PDF"}
                  </button>
                  <Link to={`/admin/teams/${tm._id}`}
                    className="flex-1 py-1.5 text-2xs font-semibold rounded-lg dark:bg-ink-700 bg-ink-100 dark:text-ink-300 text-ink-600 hover:bg-gold-500/10 hover:text-gold-500 border dark:border-ink-600 border-ink-200 transition text-center">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── BID LOGS ────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-xl font-semibold dark:text-ink-200 text-ink-700">Recent Bid Logs</h2>
          <span className="text-xs dark:text-ink-500 text-ink-400">{bids.length} bids</span>
        </div>
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 overflow-hidden shadow-card-light dark:shadow-card-dark">
          {bids.length === 0 ? (
            <div className="p-8">
              <Empty icon="🔨" title="No bids recorded yet" body="Bid logs appear here once the auction starts." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Bid Amount</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b, i) => (
                    <tr key={b._id}>
                      <td className="dark:text-ink-600 text-ink-400 font-mono text-xs">{i + 1}</td>
                      <td className="font-medium dark:text-ink-200 text-ink-700">{b.player?.fullName}</td>
                      <td className="dark:text-ink-400 text-ink-500">{b.team?.name}</td>
                      <td className="font-mono font-bold text-gold-500">₹{b.amount?.toLocaleString()}</td>
                      <td className="dark:text-ink-500 text-ink-400 text-xs">
                        {new Date(b.createdAt).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
