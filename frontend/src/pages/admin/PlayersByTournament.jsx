import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import { Button, Select, Input, Empty, Alert } from "../../components/UI";

export default function PlayersByTournament() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [players, setPlayers]       = useState([]);
  const [filters, setFilters]       = useState({ status:"", role:"", search:"" });
  const [error, setError]           = useState("");

  useEffect(() => {
    setError("");
    api.get(`/tournaments/${tournamentId}`).then(r => setTournament(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load tournament"));
  }, [tournamentId]);

  const load = () => {
    const p = new URLSearchParams({ tournament: tournamentId });
    Object.entries(filters).forEach(([k,v]) => v && p.append(k,v));
    setError("");
    api.get(`/players?${p}`).then(r => setPlayers(r.data))
      .catch(err => setError(err.response?.data?.message || "Failed to load players"));
  };
  useEffect(load, [tournamentId, filters]);

  const setStatus   = async (id, status)   => { try { await api.patch(`/players/${id}/status`, { status }); load(); } catch(err){ alert(err.response?.data?.message || "Action failed"); } };
  const setEligible = async (id, eligible) => { try { await api.patch(`/players/${id}/auction-eligible`, { eligible }); load(); } catch(err){ alert(err.response?.data?.message || "Action failed"); } };
  const remove      = async id             => { if(!confirm("Delete player?")) return; try { await api.delete(`/players/${id}`); load(); } catch(err){ alert(err.response?.data?.message || "Delete failed"); } };

  const ROLE_BADGE   = { Batsman:"badge-gold", Bowler:"badge-green", "All-Rounder":"badge-red", "Wicket Keeper":"badge-slate" };
  const STATUS_BADGE = { Pending:"badge-gold", Approved:"badge-green", Rejected:"badge-red" };

  return (
    <div>
      <Link to="/admin/players" className="inline-flex items-center gap-1.5 text-xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-600 transition mb-4">
        <i className="fa-solid fa-arrow-left text-2xs" /> All Tournaments
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {tournament?.logo && (
            <div className="h-11 w-11 rounded-xl dark:bg-white/[0.08] bg-ink-100 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
              <img src={tournament.logo} className="h-full w-full object-cover" alt={tournament.name} />
            </div>
          )}
          <div className="min-w-0">
            <p className="eyebrow mb-1">Players</p>
            <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900 truncate">
              {tournament ? tournament.name : "Loading…"}
            </h1>
          </div>
        </div>
        <span className="text-sm dark:text-ink-500 text-ink-400 mt-3 shrink-0">{players.length} found</span>
      </div>

      {error && <div className="mb-6"><Alert type="error">{error}</Alert></div>}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <Input placeholder="Search by name…" value={filters.search}
            onChange={e=>setFilters({...filters,search:e.target.value})}/>
          <Select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
            <option value="">All Statuses</option>
            <option>Pending</option><option>Approved</option><option>Rejected</option>
          </Select>
          <Select value={filters.role} onChange={e=>setFilters({...filters,role:e.target.value})}>
            <option value="">All Roles</option>
            <option>Batsman</option><option>Bowler</option>
            <option>All-Rounder</option><option>Wicket Keeper</option>
          </Select>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-users" title="No players found" body="Try adjusting your filters, or wait for registrations to come in."/>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(p => (
            <div key={p._id} className="card p-4">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-3">
                <div className="h-14 w-14 rounded-xl dark:bg-white/[0.05] bg-ink-100 border dark:border-white/[0.08] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo
                    ? <img src={p.photo} className="h-full w-full object-cover" alt={p.fullName}/>
                    : <i className="fa-solid fa-baseball-bat-ball text-xl opacity-40" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate">{p.fullName}</p>
                  <p className="text-2xs dark:text-ink-500 text-ink-400 mt-0.5">{p.district}, {p.state}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={ROLE_BADGE[p.role]}>{p.role}</span>
                    <span className={STATUS_BADGE[p.status]}>{p.status}</span>
                    {p.auctionEligible && <span className="badge-gold">In Pool</span>}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="card-inset rounded-lg p-3 mb-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[["Matches", p.matchesPlayed||0], ["Runs", p.runs||0], ["Wickets", p.wickets||0]].map(([l,v]) => (
                    <div key={l}>
                      <p className="font-bold text-sm dark:text-ink-200 text-ink-800">{v}</p>
                      <p className="eyebrow mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs font-mono dark:text-ink-400 text-ink-500 mb-3">
                Base Price: ₹{p.basePrice?.toLocaleString()}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5">
                {p.status !== "Approved" && (
                  <Button variant="jade" size="sm" onClick={()=>setStatus(p._id,"Approved")}>
                    <i className="fa-solid fa-check" /> Approve
                  </Button>
                )}
                {p.status !== "Rejected" && (
                  <Button variant="danger" size="sm" onClick={()=>setStatus(p._id,"Rejected")}>
                    <i className="fa-solid fa-xmark" /> Reject
                  </Button>
                )}
                {p.status === "Approved" && (
                  <Button variant={p.auctionEligible ? "ghost" : "soft"} size="sm"
                    onClick={()=>setEligible(p._id, !p.auctionEligible)}>
                    <i className={`fa-solid ${p.auctionEligible ? "fa-minus" : "fa-plus"}`} />
                    {p.auctionEligible ? "Remove from Pool" : "Add to Pool"}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={()=>remove(p._id)}>
                  <i className="fa-solid fa-trash text-flame-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
