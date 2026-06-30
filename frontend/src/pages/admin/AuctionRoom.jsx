import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { getSocket } from "../../socket/socket";
import { Button, Select, Input, Label, Badge } from "../../components/UI";

export default function AuctionRoom() {
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid]     = useState("");
  const [teams, setTeams] = useState([]);
  const [state, setState] = useState(null);
  const [pool, setPool]   = useState(0);
  const [flash, setFlash] = useState(null);
  const [secs, setSecs]   = useState(0);
  const [inc, setInc]     = useState(1000);
  const [startPrice, setStartPrice] = useState("");
  const [manualAmt, setManualAmt]   = useState("");
  const [manualTeam, setManualTeam] = useState("");
  const socket = useRef(null);

  useEffect(()=>{
    api.get("/tournaments").then(r=>{
      setTournaments(r.data);
      const a = r.data.find(t=>t.isActive)||r.data[0];
      if(a){ setTid(a._id); setInc(a.bidIncrements?.[1]||1000); }
    });
  },[]);

  const t = tournaments.find(x=>x._id===tid);

  const refresh = ()=>{
    api.get(`/teams?tournament=${tid}`).then(r=>setTeams(r.data));
    api.get(`/auction/pool/${tid}`).then(r=>setPool(r.data.length));
  };

  useEffect(()=>{
    if(!tid) return;
    refresh();
    const s = getSocket();
    socket.current = s;
    if(!s.connected) s.connect();
    s.emit("join_room",{tournamentId:tid});
    s.on("state_update", setState);
    s.on("player_sold",  p=>{ setFlash({type:"sold",p}); setTimeout(()=>setFlash(null),3000); refresh(); });
    s.on("player_unsold",p=>{ setFlash({type:"unsold",p}); setTimeout(()=>setFlash(null),2500); refresh(); });
    s.on("error_message",m=>alert(m));
    s.on("auction_pool_empty",()=>alert("Pool is empty."));
    return ()=>{
      s.emit("leave_room",{tournamentId:tid});
      s.off("state_update"); s.off("player_sold"); s.off("player_unsold");
      s.off("error_message"); s.off("auction_pool_empty");
    };
  },[tid]);

  useEffect(()=>{
    if(!state?.timerEndsAt||state.status!=="running"){ setSecs(0); return; }
    const tick=()=>setSecs(Math.max(0,Math.round((+new Date(state.timerEndsAt)-Date.now())/1000)));
    tick(); const id=setInterval(tick,1000); return()=>clearInterval(id);
  },[state?.timerEndsAt,state?.status]);

  const emit=(ev,data={})=> socket.current?.emit(ev,{tournamentId:tid,...data});

  const player = state?.currentPlayer;
  const curAmt = state?.currentBidAmount || player?.basePrice || 0;
  const presets = t?.bidIncrements || [500,1000,2000,5000,10000];

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="label-xs mb-1">Live</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl text-slate-100">Auction Room</h1>
            {t && (
              <Badge color={t.auctionMode==="serial"?"green":"gold"}>
                {t.auctionMode==="serial"?"Serial":"Random"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {tournaments.length>0 && (
            <Select value={tid} onChange={e=>setTid(e.target.value)} className="w-auto text-xs">
              {tournaments.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
            </Select>
          )}
          <button onClick={()=>window.open(`/watch/${tid}`,"_blank")}
            className="px-3 py-1.5 text-xs border border-ink-500 hover:border-gold-500 text-slate-400 hover:text-gold-400 rounded transition">
            TV Display ↗
          </button>
        </div>
      </div>

      {/* Controls bar */}
      <div className="surface rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <Label>Starting price (optional)</Label>
            <Input type="number" placeholder="Player's base price" value={startPrice}
              onChange={e=>setStartPrice(e.target.value)} className="w-44 text-xs"/>
          </div>
          <Button variant="primary" size="sm"
            onClick={()=>{ emit("admin:next_player",startPrice?{startingPrice:+startPrice}:{}); setStartPrice(""); }}>
            {t?.auctionMode==="serial"?"Next Player →":"Random Player →"}
          </Button>
          <Button variant="ghost" size="sm" onClick={()=>emit("admin:pause_auction")}>Pause</Button>
          <Button variant="ghost" size="sm" onClick={()=>emit("admin:resume_auction")}>Resume</Button>
          <Button variant="jade"  size="sm" disabled={!state?.currentBidTeam} onClick={()=>emit("admin:force_sold")}>Mark Sold</Button>
          <Button variant="danger" size="sm" onClick={()=>emit("admin:mark_unsold")}>Mark Unsold</Button>
          <Button variant="ghost"  size="sm" onClick={()=>emit("admin:undo_last_sale")}>↩ Undo</Button>
          <Button variant="danger" size="sm" onClick={()=>emit("admin:end_auction")}>End Auction</Button>
          <span className="ml-auto text-xs text-slate-500 self-center">Pool: {pool}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Player card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface rounded-lg relative overflow-hidden" style={{minHeight:320}}>
            {/* SOLD / UNSOLD flash */}
            {flash && (
              <div className="absolute inset-0 z-10 bg-ink-900/90 flex items-center justify-center">
                <div className={`animate-stamp border-2 px-12 py-6 rounded font-display text-5xl tracking-wider ${
                  flash.type==="sold"
                    ? "border-jade-500 text-jade-400"
                    : "border-flame-500 text-flame-400"
                }`}>
                  {flash.type==="sold" ? "SOLD" : "UNSOLD"}
                  {flash.type==="sold" && (
                    <p className="text-base font-body mt-2 text-slate-300 text-center">
                      {flash.p.team?.name} — ₹{flash.p.amount?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!player ? (
              <div className="flex flex-col items-center justify-center h-80 text-slate-600">
                <p className="text-4xl mb-3">🏏</p>
                <p className="text-sm">No player in auction. Click "Next Player" to begin.</p>
              </div>
            ) : (
              <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
                {/* Photo */}
                <div className="h-32 w-32 rounded-lg bg-ink-700 overflow-hidden flex items-center justify-center shrink-0">
                  {player.photo
                    ? <img src={player.photo} className="h-full w-full object-cover" alt={player.fullName}/>
                    : <span className="text-4xl opacity-40">🏏</span>}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="font-display text-3xl text-slate-100 leading-tight">{player.fullName}</h2>
                    <Badge color="gold">{player.role}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{player.battingStyle}{player.bowlingStyle?` · ${player.bowlingStyle}`:""}</p>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[["Matches",player.matchesPlayed],["Runs",player.runs],["Wickets",player.wickets]].map(([l,v])=>(
                      <div key={l} className="surface-inset rounded p-2">
                        <p className="label-xs">{l}</p>
                        <p className="font-display text-xl text-slate-200 mt-1">{v??0}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bid display */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="label-xs">{state?.currentBidTeam?"Current Bid":"Opening Price"}</p>
                      <p className="font-mono text-3xl font-bold text-gold-400 mt-0.5">₹{curAmt.toLocaleString()}</p>
                      {state?.currentBidTeam && (
                        <p className="text-xs text-jade-400 mt-0.5">{state.currentBidTeam.name}</p>
                      )}
                    </div>
                    {/* Countdown */}
                    <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center font-mono text-xl font-bold transition-colors ${
                      secs<=10 && state?.status==="running"
                        ? "border-flame-500 text-flame-400 ring-danger"
                        : "border-ink-500 text-slate-400"
                    }`}>
                      {secs>0 ? secs : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual bid panel */}
          {player && (
            <div className="surface rounded-lg p-5">
              <p className="label-xs mb-4">Manual Bid Entry</p>
              <div className="grid sm:grid-cols-3 gap-3 items-end mb-4">
                <div>
                  <Label>Team</Label>
                  <Select value={manualTeam} onChange={e=>setManualTeam(e.target.value)}>
                    <option value="">Select team…</option>
                    {teams.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
                  </Select>
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input type="number" placeholder={`> ${curAmt.toLocaleString()}`}
                    value={manualAmt} onChange={e=>setManualAmt(e.target.value)}/>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" className="flex-1"
                    onClick={()=>{ if(!manualTeam||!manualAmt) return; emit("team:place_bid",{teamId:manualTeam,amount:+manualAmt}); setManualAmt(""); }}>
                    Place Bid
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm"
                onClick={()=>{ if(!manualAmt) return; emit("admin:set_current_bid",{amount:+manualAmt}); setManualAmt(""); }}>
                Update price only (no team)
              </Button>

              <div className="mt-4 pt-4 border-t border-ink-600">
                <Label>Quick-bid increment</Label>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <Input type="number" value={inc} onChange={e=>setInc(e.target.value)} className="w-28 text-xs"/>
                  {presets.map(p=>(
                    <button key={p} onClick={()=>setInc(p)}
                      className={`px-2.5 py-1 rounded text-xs border transition ${+inc===p?"border-gold-500 text-gold-400 bg-gold-500/10":"border-ink-500 text-slate-500 hover:border-ink-400"}`}>
                      +{p.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team purse column */}
        <div className="space-y-2">
          <p className="label-xs px-1 mb-3">Team Purses</p>
          {teams.map(tm=>{
            const disabled = !player||state?.status!=="running"||tm.remainingPurse<curAmt+(+inc)||tm.squad.length>=tm.maxPlayers||String(state?.currentBidTeam?._id)===String(tm._id);
            const isLeading = String(state?.currentBidTeam?._id)===String(tm._id);
            const pct = Math.max(0,Math.min(100,(tm.remainingPurse/tm.initialPurse)*100));
            return (
              <div key={tm._id} className={`surface rounded-lg p-3 ${isLeading?"border-gold-500/50":""}`}
                style={{borderColor: isLeading?"#f2b70566":undefined, borderWidth: isLeading?"1px":undefined}}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded bg-ink-600 overflow-hidden flex items-center justify-center shrink-0">
                    {tm.logo?<img src={tm.logo} className="h-full w-full object-cover"/>:<span className="text-xs">🛡</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{tm.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">₹{tm.remainingPurse.toLocaleString()}</p>
                  </div>
                  <Button variant={isLeading?"jade":"primary"} size="sm" disabled={disabled}
                    onClick={()=>emit("team:place_bid",{teamId:tm._id,amount:curAmt+(+inc)})}>
                    +{Number(inc).toLocaleString()}
                  </Button>
                </div>
                <div className="h-1 bg-ink-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct<20?"bg-flame-500":"bg-jade-600"}`} style={{width:`${pct}%`}}/>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">{tm.squad.length}/{tm.maxPlayers} players</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
