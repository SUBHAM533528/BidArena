import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Select, Button, Empty } from "../../components/UI";

export default function UnsoldPlayers() {
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid] = useState("");

  useEffect(() => { api.get("/tournaments").then(r=>{ setTournaments(r.data); if(r.data[0]) setTid(r.data[0]._id); }); },[]);
  const load = () => {
    const p = new URLSearchParams({ auctionStatus:"Unsold" });
    if (tid) p.append("tournament", tid);
    api.get(`/players?${p}`).then(r => setPlayers(r.data));
  };
  useEffect(() => { if(tid) load(); }, [tid]);

  const relist = async id => {
    await api.patch(`/players/${id}/reset-auction-status`);
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div><p className="eyebrow mb-1.5">Auction Results</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Unsold Players</h1></div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e=>setTid(e.target.value)} className="w-auto text-xs">
            {tournaments.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      <div className="stat-card border-l-4 border-l-flame-500 mb-6">
        <p className="eyebrow mb-2">Total Unsold</p>
        <p className="font-display text-2xl font-bold dark:text-ink-50 text-ink-900">{players.length}</p>
      </div>

      {players.length === 0 ? (
        <div className="card p-10"><Empty icon="✅" title="No unsold players" body="All players either sold or still in pool."/></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => (
            <div key={p._id} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl dark:bg-ink-800 bg-ink-100 border dark:border-ink-700 border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo ? <img src={p.photo} className="h-full w-full object-cover"/> : <span className="text-xl opacity-40">🏏</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate">{p.fullName}</p>
                  <p className="text-2xs dark:text-ink-500 text-ink-400">{p.role}</p>
                  <p className="font-mono text-xs text-flame-500 mt-0.5">Base: ₹{p.basePrice?.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="badge-red">Unsold</span>
                <Button variant="ghost" size="sm" onClick={()=>relist(p._id)}>↺ Re-list</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
