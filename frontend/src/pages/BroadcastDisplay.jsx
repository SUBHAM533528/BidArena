import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/SEO";
import api from "../api/axios";
import { getSocket } from "../socket/socket";

// Broadcast / TV display — dark + green scoreboard theme, built for
// projection on a stadium screen or OBS overlay.
export default function BroadcastDisplay() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams]           = useState([]);
  const [state, setState]           = useState(null);
  const [secs, setSecs]             = useState(0);
  const [flash, setFlash]           = useState(null);
  const [sales, setSales]           = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/tournaments/${tournamentId}`).then(r=>setTournament(r.data)).catch(()=>{});
  }, [tournamentId]);

  const refreshTeams = () => api.get(`/teams?tournament=${tournamentId}`).then(r=>setTeams(r.data));

  useEffect(() => {
    if (!tournamentId) return;
    refreshTeams();
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket.connected) socket.connect();
    socket.emit("join_room", { tournamentId });
    socket.on("state_update", s => setState(s));
    socket.on("player_sold",  p => { setFlash({type:"sold",payload:p}); setSales(pr=>[p,...pr].slice(0,5)); setTimeout(()=>setFlash(null),3500); refreshTeams(); });
    socket.on("player_unsold",p => { setFlash({type:"unsold",payload:p}); setTimeout(()=>setFlash(null),2500); });
    socket.on("new_bid", ()=> refreshTeams());
    return () => {
      socket.emit("leave_room",{tournamentId});
      ["state_update","player_sold","player_unsold","new_bid"].forEach(e=>socket.off(e));
    };
  }, [tournamentId]);

  useEffect(() => {
    if (!state?.timerEndsAt || state.status!=="running") { setSecs(0); return; }
    const tick = ()=>setSecs(Math.max(0,Math.round((new Date(state.timerEndsAt)-Date.now())/1000)));
    tick(); const id=setInterval(tick,1000); return ()=>clearInterval(id);
  }, [state?.timerEndsAt, state?.status]);

  const player = state?.currentPlayer;
  const curAmt = state?.currentBidAmount || player?.basePrice || 0;
  const leadId = state?.currentBidTeam?._id;
  const leadTeam = state?.currentBidTeam;

  return (
    <div className="min-h-screen bg-[#060907] text-ink-100 flex flex-col overflow-hidden">
      <SEO
        title={tournament ? `${tournament.name} — Live Auction Broadcast` : "Live Auction Broadcast"}
        description="Watch the live cricket player auction in real time. Track bids, team purses and sold players as they happen."
        noIndex={false}
      />
      <SEO
        title={tournament?.name ? `Live Auction — ${tournament.name}` : "Live Auction"}
        description="Watch the cricket auction live — real-time bidding, team purse updates, and player sales as they happen."
        url={`/watch/${tournamentId}`}
      />
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-jade-500/20 bg-black/40 shrink-0">
        <div className="flex items-center gap-4">
          {tournament?.logo && <img src={tournament.logo} className="h-9 w-9 rounded-lg object-cover border border-jade-500/30"/>}
          <div>
            <p className="font-bold text-sm text-white">{tournament?.name||"Live Auction"}</p>
            <p className="text-xs text-ink-500">{tournament?.venue}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-flame-400">
          <span className="h-2 w-2 rounded-full bg-flame-500 animate-pulse"/>LIVE
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
        {/* Center — player */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-10 relative border-b lg:border-b-0 lg:border-r border-jade-500/15 min-h-[60vh]">

          {/* ── SOLD / UNSOLD full-screen flash ── */}
          {flash && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#060907]/95 backdrop-blur">
              <div className={`animate-stamp-in text-center px-10 sm:px-20 py-10 sm:py-14 rounded-3xl border-4 ${
                flash.type==="sold"
                  ? "border-jade-500 bg-jade-500/10"
                  : "border-flame-500 bg-flame-500/10"
              }`}>
                <p className={`font-display font-extrabold text-6xl sm:text-8xl tracking-tight mb-4 ${
                  flash.type==="sold" ? "text-jade-400" : "text-flame-400"
                }`}>
                  {flash.type==="sold" ? "SOLD!" : "UNSOLD"}
                </p>

                {flash.type==="sold" && (
                  <>
                    {/* ── BIG team name on sold ── */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                      {flash.payload.team.logo && (
                        <img src={flash.payload.team.logo} className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-jade-500/40" />
                      )}
                      <p className="font-display font-extrabold text-5xl sm:text-7xl text-white tracking-tight leading-none">
                        {flash.payload.team.name}
                      </p>
                    </div>
                    <p className="text-jade-400 font-mono text-2xl sm:text-3xl font-bold">
                      ₹{flash.payload.amount.toLocaleString("en-IN")}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {!player ? (
            <div className="text-center opacity-40">
              <i className="fa-solid fa-baseball-bat-ball text-4xl opacity-50" />
              <p>Waiting for next player…</p>
            </div>
          ) : (
            <>
              <div className="h-32 w-32 sm:h-44 sm:w-44 rounded-3xl bg-white/[0.04] overflow-hidden flex items-center justify-center border-2 border-jade-500/30 mb-5 shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                {player.photo ? <img src={player.photo} className="h-full w-full object-cover" alt={player.fullName}/> : <i className="fa-solid fa-baseball-bat-ball text-xl opacity-40" />}
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white text-center tracking-tight">{player.fullName}</h1>
              <p className="text-jade-400 mt-2 text-base sm:text-lg font-semibold">{player.role}</p>

              <div className="grid grid-cols-3 gap-8 sm:gap-10 mt-6 text-center">
                {[["Matches",player.matchesPlayed],["Runs",player.runs],["Wickets",player.wickets]].map(([l,v])=>(
                  <div key={l}><p className="text-2xs uppercase tracking-widest text-ink-500 mb-1">{l}</p><p className="text-xl sm:text-2xl font-bold text-white">{v??0}</p></div>
                ))}
              </div>

              {/* ── Current bid + bidding team name (grows when leading) ── */}
              <div className="flex items-center gap-8 sm:gap-12 mt-8">
                <div className="text-center">
                  <p className="text-2xs uppercase tracking-widest text-ink-500 mb-2">
                    {leadId ? "Current Bid" : "Starting Price"}
                  </p>
                  <p className="font-mono font-extrabold text-5xl sm:text-7xl text-jade-400 leading-none [text-shadow:0_0_30px_rgba(34,197,94,0.35)]">
                    ₹{curAmt.toLocaleString("en-IN")}
                  </p>

                  {/* ── BIG bidding team name ── */}
                  {leadId && leadTeam && (
                    <div key={leadId} className="animate-team-slide flex items-center justify-center gap-3 mt-4">
                      {leadTeam.logo && (
                        <img src={leadTeam.logo} className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl object-cover border border-jade-500/40" />
                      )}
                      <p className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
                        {leadTeam.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className={`h-20 w-20 sm:h-28 sm:w-28 rounded-full border-4 flex items-center justify-center font-mono text-3xl sm:text-4xl font-bold shrink-0
                  ${secs<=10&&secs>0?"border-flame-500 text-flame-400 ring-danger":"border-jade-500/40 text-jade-400"}`}>
                  {secs}
                </div>
              </div>
            </>
          )}

          {/* Sales ticker */}
          {sales.length > 0 && (
            <div className="absolute bottom-4 left-0 right-0 px-6 flex gap-3 overflow-x-auto no-scrollbar">
              {sales.map((s,i)=>(
                <div key={i} className="bg-white/[0.05] border border-jade-500/20 rounded-lg px-4 py-2 text-xs whitespace-nowrap shrink-0 backdrop-blur">
                  <span className="text-ink-400">{s.player.name}</span>
                  <span className="text-ink-600 mx-1">→</span>
                  <span className="text-white font-semibold">{s.team.name}</span>
                  <span className="text-jade-400 ml-2 font-mono">₹{s.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — team purses */}
        <div className="w-full lg:w-72 shrink-0 p-5 bg-black/40 border-l border-jade-500/15 overflow-y-auto">
          <p className="text-2xs uppercase tracking-widest text-ink-500 mb-4 px-1 font-semibold">Team Purses</p>
          <div className="space-y-2">
            {teams.map(t => {
              const pct = Math.max(0,Math.min(100,(t.remainingPurse/t.initialPurse)*100));
              const isLead = String(t._id)===String(leadId);
              return (
                <div key={t._id} className={`p-3 rounded-xl border transition-all ${isLead?"border-jade-500/60 bg-jade-500/10 scale-[1.02]":"border-white/[0.07] bg-white/[0.02]"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full bg-white/[0.06] overflow-hidden flex items-center justify-center shrink-0">
                      {t.logo?<img src={t.logo} className="h-full w-full object-cover"/>:<i className="fa-solid fa-shield-halved text-2xs opacity-50" />}
                    </div>
                    <p className={`text-sm truncate ${isLead?"font-bold text-jade-400":"font-medium text-ink-200"}`}>{t.name}</p>
                    {isLead && <span className="text-2xs text-jade-400 ml-auto shrink-0 font-semibold">● bidding</span>}
                  </div>
                  <div className="flex justify-between text-xs text-ink-500 mb-1">
                    <span>{t.squad?.length||0}/{t.maxPlayers} players</span>
                    <span className="font-mono text-ink-300">₹{t.remainingPurse.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct<20?"bg-flame-500":"bg-jade-500"}`} style={{width:`${pct}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
