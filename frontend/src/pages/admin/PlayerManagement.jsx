import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button, Select, Input, Empty } from "../../components/UI";

export default function PlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [filters, setFilters] = useState({ status:"", role:"", search:"" });

  const load = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k,v]) => v && p.append(k,v));
    api.get(`/players?${p}`).then(r => setPlayers(r.data));
  };
  useEffect(() => { load(); }, [filters]);

  const setStatus  = async (id, status)  => { await api.patch(`/players/${id}/status`, { status }); load(); };
  const setEligible= async (id, eligible) => { await api.patch(`/players/${id}/auction-eligible`, { eligible }); load(); };
  const remove     = async id             => { if(!confirm("Delete player?")) return; await api.delete(`/players/${id}`); load(); };

  const ROLE_BADGE = { Batsman:"badge-gold", Bowler:"badge-green", "All-Rounder":"badge-red", "Wicket Keeper":"badge-slate" };
  const STATUS_BADGE = { Pending:"badge-gold", Approved:"badge-green", Rejected:"badge-red" };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Players</h1></div>
        <span className="text-sm dark:text-ink-500 text-ink-400 mt-3">{players.length} found</span>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Search by name…" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/>
          <Select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
            <option value="">All Statuses</option>
            <option>Pending</option><option>Approved</option><option>Rejected</option>
          </Select>
          <Select value={filters.role} onChange={e=>setFilters({...filters,role:e.target.value})}>
            <option value="">All Roles</option>
            <option>Batsman</option><option>Bowler</option><option>All-Rounder</option><option>Wicket Keeper</option>
          </Select>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="card p-10"><Empty icon="🏏" title="No players found" body="Try adjusting your filters."/></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => (
            <div key={p._id} className="card p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-14 w-14 rounded-xl dark:bg-ink-800 bg-ink-100 border dark:border-ink-700 border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo ? <img src={p.photo} className="h-full w-full object-cover"/> : <span className="text-2xl opacity-40">🏏</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate">{p.fullName}</p>
                  <p className="text-2xs dark:text-ink-500 text-ink-400">{p.district}, {p.state}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={ROLE_BADGE[p.role]}>{p.role}</span>
                    <span className={STATUS_BADGE[p.status]}>{p.status}</span>
                    {p.auctionEligible && <span className="badge-gold">In Pool</span>}
                  </div>
                </div>
              </div>

              <div className="card-inset rounded-lg p-3 mb-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["Matches",p.matchesPlayed||0],["Runs",p.runs||0],["Wickets",p.wickets||0]].map(([l,v])=>(
                    <div key={l}>
                      <p className="font-bold text-sm dark:text-ink-200 text-ink-800">{v}</p>
                      <p className="eyebrow mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-mono dark:text-ink-400 text-ink-500 mb-3">Base: ₹{p.basePrice?.toLocaleString()}</p>

              <div className="flex flex-wrap gap-1.5">
                {p.status !== "Approved"  && <Button variant="jade"   size="sm" onClick={()=>setStatus(p._id,"Approved")}>Approve</Button>}
                {p.status !== "Rejected"  && <Button variant="danger"  size="sm" onClick={()=>setStatus(p._id,"Rejected")}>Reject</Button>}
                {p.status === "Approved"  && (
                  <Button variant={p.auctionEligible ? "ghost" : "soft"} size="sm" onClick={()=>setEligible(p._id,!p.auctionEligible)}>
                    {p.auctionEligible ? "Remove from Pool" : "Add to Pool"}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={()=>remove(p._id)}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
