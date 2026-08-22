import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../api/axios";
import { Select, Empty, Alert, Button } from "../../components/UI";

const COLORS = ["#f59e0b","#22c55e","#ef4444","#60a5fa","#a78bfa","#f97316"];

const TT = ({ contentStyle, ...p }) => (
  <Tooltip {...p} contentStyle={{ background:"#12160f", border:"1px solid rgba(255,255,255,0.09)", borderRadius:"8px", fontSize:"12px", padding:"8px 12px", ...contentStyle }}
    labelStyle={{ color:"#94a3b8" }} itemStyle={{ color:"#e2e8f0" }} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
);

/* Bold colour-block stat card, matching the reference dashboard mock */
function GlowCard({ icon, label, value, sub, tone = "gold" }) {
  const tones = {
    gold:  "bg-jade-400 text-ink-950",
    jade:  "bg-jade-600 text-white",
    flame: "bg-flame-600 text-white",
    dark:  "dark:bg-[#12160f] bg-ink-900 text-white border dark:border-white/[0.08] border-white/[0.08]",
  };
  return (
    <div className={`rounded-2xl p-4 flex flex-col justify-between min-h-[92px] min-w-0 shadow-card-hover ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2 min-w-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 truncate">{label}</span>
        {icon && <i className={`${icon} text-sm opacity-70 shrink-0`} />}
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold leading-none mt-2 truncate">{value}</p>
        {sub && <p className="text-[11px] opacity-75 mt-1 truncate">{sub}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [recentSold, setRecentSold] = useState([]);

  const loadTournaments = () => {
    setError("");
    api.get("/tournaments")
      .then(r => { setTournaments(r.data); if (r.data[0]) setTid(r.data[0]._id); else setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || "Failed to load tournaments"); setLoading(false); });
  };

  useEffect(loadTournaments, []);

  useEffect(() => {
    if (!tid) return;
    setLoading(true);
    api.get(`/reports/stats${tid ? `?tournament=${tid}` : ""}`)
      .then(r => setStats(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load dashboard stats"))
      .finally(() => setLoading(false));

    const queueParams = new URLSearchParams({ tournament: tid, auctionStatus: "Not Started", auctionEligible: "true" });
    api.get(`/players?${queueParams}`)
      .then(r => setQueue(r.data.slice(0, 5))).catch(() => setQueue([]));

    const soldParams = new URLSearchParams({ tournament: tid, auctionStatus: "Sold" });
    api.get(`/players?${soldParams}`)
      .then(r => {
        const sorted = [...r.data].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setRecentSold(sorted.slice(0, 4));
      }).catch(() => setRecentSold([]));
  }, [tid]);

  const t = tournaments.find(x => x._id === tid);

  if (error) return (
    <div className="max-w-lg">
      <Alert type="error">{error}</Alert>
      <Button variant="ghost" size="sm" className="mt-3" onClick={loadTournaments}>
        <i className="fa-solid fa-rotate-right" /> Retry
      </Button>
    </div>
  );

  if (loading || !stats) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {[...Array(5)].map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}
    </div>
  );

  const roleData  = stats.soldByRole.map(r => ({ name: r._id, value: r.count }));
  const spendData = stats.teamSpending.map(t => ({ name: t.name.split(" ")[0], spent: t.initialPurse - t.remainingPurse }));
  const highestSold = recentSold.length
    ? [...recentSold].sort((a, b) => (b.soldPrice||0) - (a.soldPrice||0))[0]
    : null;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div className="min-w-0">
          <p className="eyebrow mb-1.5">Overview</p>
          <h1 className="font-editorial text-3xl font-bold dark:text-white text-ink-900">Dashboard</h1>
        </div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e => setTid(e.target.value)} className="!w-auto max-w-full text-xs shrink-0">
            {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="col-span-2 sm:col-span-1 rounded-2xl p-4 flex flex-col justify-between min-h-[92px] min-w-0 bg-gradient-to-br from-ink-900 to-[#161c17] border border-jade-500/25 text-white shadow-card-hover">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-jade-400 truncate">{t?.name || "Tournament"}</span>
            <i className="fa-solid fa-trophy text-sm text-jade-400 opacity-80 shrink-0" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold leading-none mt-2 truncate">{t?.name || "—"}</p>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold uppercase tracking-wide ${t?.isActive ? "text-jade-400" : "text-ink-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${t?.isActive ? "bg-jade-400 animate-pulse" : "bg-ink-500"}`} />
              {t?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <GlowCard tone="jade"  icon="fa-solid fa-circle-check" label="Sold Players"
          value={`${stats.soldPlayers}/${stats.auctionPlayers}`} />
        <GlowCard tone="gold"  icon="fa-solid fa-sack-dollar" label="Total Spend"
          value={`₹${(stats.totalAuctionValue/100000).toFixed(1)}L`} />
        <GlowCard tone="dark"  icon="fa-solid fa-xmark" label="Unsold Players"
          value={stats.unsoldPlayers} />
        <GlowCard tone="dark"  icon="fa-solid fa-arrow-trend-up" label="Highest Bid"
          value={highestSold ? `₹${(highestSold.soldPrice/100000).toFixed(1)}L` : "—"}
          sub={highestSold ? `${highestSold.fullName} · ${highestSold.soldTo?.name || ""}` : undefined} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 min-w-0">
        {/* Left: charts */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="grid md:grid-cols-2 gap-4 min-w-0">
            <div className="card p-5 border-l-4 border-l-jade-600 min-w-0">
              <p className="eyebrow mb-5">Team Spending</p>
              {spendData.every(d => d.spent === 0)
                ? <Empty icon="fa-solid fa-sack-dollar" title="No bids placed yet" />
                : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={spendData} barSize={28} margin={{ top:4, right:4, bottom:0, left:0 }}>
                      <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} width={50}
                        tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                      <TT formatter={v => [`₹${v.toLocaleString()}`, "Spent"]} />
                      <Bar dataKey="spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </div>
            <div className="card p-5 border-l-4 border-l-jade-500 min-w-0">
              <p className="eyebrow mb-5">Sold by Role</p>
              {roleData.length === 0
                ? <Empty icon="fa-solid fa-bullseye" title="No players sold yet" />
                : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={75} innerRadius={36} paddingAngle={3}>
                        {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <TT />
                    </PieChart>
                  </ResponsiveContainer>
                )}
            </div>
          </div>

          {/* Quick link to the live auction room */}
          <Link to={t ? `/admin/auction/${t._id}` : "/admin/auction"}
            className="flex items-center justify-between gap-3 rounded-2xl border dark:border-white/[0.08] border-ink-200 dark:bg-white/[0.03] bg-white p-4 hover:border-jade-500/40 transition group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-jade-500/15 border border-jade-500/25 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-gavel text-jade-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold dark:text-white text-ink-900">Open Live Auction Room</p>
                <p className="text-xs dark:text-ink-500 text-ink-400 truncate">Run bidding, manage teams, mark players sold in real time</p>
              </div>
            </div>
            <i className="fa-solid fa-arrow-right dark:text-ink-500 text-ink-400 group-hover:text-jade-500 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>

        {/* Right: Player Queue + Recent Sold */}
        <div className="space-y-4 min-w-0">
          <div className="card p-5 border-l-4 border-l-sky-500">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow">Player Queue</p>
              <Link to="/admin/players" className="text-2xs text-jade-500 hover:text-jade-400 transition font-semibold">View all</Link>
            </div>
            {queue.length === 0
              ? <Empty icon="fa-solid fa-hourglass-half" title="Queue is empty" body="No players waiting for auction." />
              : (
                <div className="space-y-1">
                  {queue.map(p => (
                    <div key={p._id} className="flex items-center gap-3 px-1 py-2 rounded-lg dark:hover:bg-white/[0.04] hover:bg-ink-50 transition">
                      <div className="h-8 w-8 rounded-full dark:bg-white/[0.06] bg-ink-100 overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold dark:text-ink-300 text-ink-400">
                        {p.photo ? <img src={p.photo} className="h-full w-full object-cover" alt={p.fullName} /> : p.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium dark:text-ink-200 text-ink-700 truncate">{p.fullName}</p>
                        <p className="text-[10px] dark:text-ink-500 text-ink-400">{p.role}</p>
                      </div>
                      <span className="text-[10px] font-mono dark:text-ink-500 text-ink-400">₹{(p.basePrice/100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="card p-5 border-l-4 border-l-flame-500">
            <div className="flex items-center justify-between mb-4">
              <p className="eyebrow">Recent Sold</p>
              <Link to="/admin/sold" className="text-2xs text-jade-500 hover:text-jade-400 transition font-semibold">View all</Link>
            </div>
            {recentSold.length === 0
              ? <Empty icon="fa-solid fa-tags" title="No sales yet" body="Sold players will appear here." />
              : (
                <div className="space-y-1">
                  {recentSold.map(p => (
                    <div key={p._id} className="flex items-center gap-3 px-1 py-2 rounded-lg dark:hover:bg-white/[0.04] hover:bg-ink-50 transition">
                      <div className="h-8 w-8 rounded-full dark:bg-white/[0.06] bg-ink-100 overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold dark:text-ink-300 text-ink-400">
                        {p.photo ? <img src={p.photo} className="h-full w-full object-cover" alt={p.fullName} /> : p.fullName?.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium dark:text-ink-200 text-ink-700 truncate">{p.fullName}</p>
                        <p className="text-[10px] dark:text-ink-500 text-ink-400 truncate">to {p.soldTo?.name || "—"}</p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-jade-500">₹{(p.soldPrice/100000).toFixed(1)}L</span>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
