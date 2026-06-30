import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../api/axios";
import { StatCard, Select, Empty } from "../../components/UI";

const COLORS = ["#f59e0b","#22c55e","#ef4444","#60a5fa","#a78bfa","#f97316"];

const TT = ({ contentStyle, ...p }) => (
  <Tooltip {...p} contentStyle={{ background:"#172033", border:"1px solid #334155", borderRadius:"8px", fontSize:"12px", padding:"8px 12px", ...contentStyle }}
    labelStyle={{ color:"#94a3b8" }} itemStyle={{ color:"#e2e8f0" }} cursor={{ fill:"rgba(255,255,255,0.03)" }} />
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid] = useState("");

  useEffect(() => { api.get("/tournaments").then(r => { setTournaments(r.data); if (r.data[0]) setTid(r.data[0]._id); }); }, []);
  useEffect(() => { api.get(`/reports/stats${tid ? `?tournament=${tid}` : ""}`).then(r => setStats(r.data)); }, [tid]);

  if (!stats) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => <div key={i} className="stat-card h-24 shimmer rounded-xl" />)}
    </div>
  );

  const roleData  = stats.soldByRole.map(r => ({ name: r._id, value: r.count }));
  const spendData = stats.teamSpending.map(t => ({ name: t.name.split(" ")[0], spent: t.initialPurse - t.remainingPurse }));

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1.5">Overview</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Dashboard</h1>
        </div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e => setTid(e.target.value)} className="w-auto text-xs">
            {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Teams"    value={stats.totalTeams}    accent="gold"  icon="🛡️" />
        <StatCard label="Players"        value={stats.totalPlayers}  accent="slate" icon="🏏" />
        <StatCard label="Sold"           value={stats.soldPlayers}   accent="green" icon="✓"
          sub={`₹${(stats.totalAuctionValue/100000).toFixed(1)}L total`} />
        <StatCard label="Unsold"         value={stats.unsoldPlayers} accent="red"   icon="✕" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5">
          <p className="eyebrow mb-5">Team Spending</p>
          {spendData.every(d => d.spent === 0)
            ? <Empty icon="💰" title="No bids placed yet" />
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
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5">
          <p className="eyebrow mb-5">Sold by Role</p>
          {roleData.length === 0
            ? <Empty icon="🎯" title="No players sold yet" />
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
    </div>
  );
}
