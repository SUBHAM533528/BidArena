import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Select, Input, Label, Button } from "../../components/UI";

export default function Settings() {
  const [tournaments, setTournaments] = useState([]);
  const [tid, setTid] = useState("");
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = () => api.get("/tournaments").then(r => { setTournaments(r.data); return r.data; });
  useEffect(() => { load().then(data => { if(data[0]) setTid(data[0]._id); }); }, []);
  useEffect(() => {
    const t = tournaments.find(t=>t._id===tid);
    if (t) setForm({
      registrationOpen: t.registrationOpen,
      auctionTimerSeconds: t.auctionTimerSeconds||60,
      auctionMode: t.auctionMode||"random",
      bidIncrements: (t.bidIncrements||[]).join(", "),
      defaultBasePrice: t.defaultBasePrice??100000,
      defaultTeamPurse: t.defaultTeamPurse??10000000,
      closedMessage: t.closedMessage||"",
      contactDetails: t.contactDetails||"",
    });
  }, [tid, tournaments]);

  const toggleReg = async () => { await api.patch(`/tournaments/${tid}/toggle-registration`); await load(); };

  const save = async (e) => {
    e.preventDefault();
    await api.put(`/tournaments/${tid}`, {
      auctionTimerSeconds: Number(form.auctionTimerSeconds),
      auctionMode: form.auctionMode,
      bidIncrements: form.bidIncrements.split(",").map(n=>Number(n.trim())).filter(Boolean),
      defaultBasePrice: Number(form.defaultBasePrice),
      defaultTeamPurse: Number(form.defaultTeamPurse),
      closedMessage: form.closedMessage,
      contactDetails: form.contactDetails,
    });
    await load();
    setSaved(true); setTimeout(()=>setSaved(false), 2500);
  };

  if (!form) return <p className="dark:text-ink-500 text-ink-400 text-sm">Loading settings…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div><p className="eyebrow mb-1.5">Configuration</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Settings</h1></div>
        {tournaments.length > 0 && (
          <Select value={tid} onChange={e=>setTid(e.target.value)} className="w-auto text-xs">
            {tournaments.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
          </Select>
        )}
      </div>

      {/* Registration toggle */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold dark:text-ink-100 text-ink-900 mb-0.5">Player Registration</p>
            <p className="text-sm dark:text-ink-500 text-ink-400">Toggle the public player registration form on or off.</p>
          </div>
          <button onClick={toggleReg}
            className={`relative h-7 w-14 rounded-full transition-colors duration-300 shrink-0 ${form.registrationOpen ? "bg-jade-600" : "dark:bg-ink-700 bg-ink-300"}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${form.registrationOpen ? "translate-x-1" : "-translate-x-6"}`}/>
          </button>
        </div>
        <p className={`text-xs mt-3 font-semibold ${form.registrationOpen ? "text-jade-500" : "dark:text-ink-600 text-ink-400"}`}>
          Registration is currently {form.registrationOpen ? "OPEN" : "CLOSED"}
        </p>
      </div>

      {/* Auction config */}
      <div className="card p-5 mb-4">
        <p className="font-semibold dark:text-ink-100 text-ink-900 mb-5">Auction Configuration</p>
        <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Auction Mode</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[["random","🎲 Random","Players drawn randomly from the pool"],["serial","🔢 Serial","Players go up in registration order"]].map(([val,title,desc])=>(
                <button type="button" key={val} onClick={()=>setForm({...form,auctionMode:val})}
                  className={`p-3 rounded-xl border text-left transition-all ${form.auctionMode===val
                    ? "border-gold-500 bg-gold-500/8 dark:bg-gold-500/10"
                    : "dark:border-ink-700 border-ink-200 dark:hover:border-ink-600 hover:border-ink-300"}`}>
                  <p className={`text-sm font-bold mb-0.5 ${form.auctionMode===val?"text-gold-500":"dark:text-ink-200 text-ink-700"}`}>{title}</p>
                  <p className="text-2xs dark:text-ink-500 text-ink-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div><Label>Default Player Base Price (₹)</Label><Input type="number" min="0" value={form.defaultBasePrice} onChange={e=>setForm({...form,defaultBasePrice:e.target.value})}/></div>
          <div><Label>Default Team Purse (₹)</Label><Input type="number" min="0" value={form.defaultTeamPurse} onChange={e=>setForm({...form,defaultTeamPurse:e.target.value})}/></div>
          <div><Label>Auction Timer (seconds)</Label><Input type="number" min="10" value={form.auctionTimerSeconds} onChange={e=>setForm({...form,auctionTimerSeconds:e.target.value})}/></div>
          <div><Label>Bid Increment Presets (₹, comma-separated)</Label><Input value={form.bidIncrements} onChange={e=>setForm({...form,bidIncrements:e.target.value})}/></div>
          <div className="sm:col-span-2"><Label>Registration Closed Message</Label><Input value={form.closedMessage} onChange={e=>setForm({...form,closedMessage:e.target.value})}/></div>
          <div className="sm:col-span-2"><Label>Contact Details</Label><Input value={form.contactDetails} onChange={e=>setForm({...form,contactDetails:e.target.value})}/></div>
          <div className="sm:col-span-2 flex items-center gap-3 pt-1">
            <Button type="submit">Save Settings</Button>
            {saved && <span className="text-jade-500 text-sm font-medium animate-fade-up">Saved ✓</span>}
          </div>
        </form>
      </div>

      {/* Change password shortcut */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold dark:text-ink-100 text-ink-900 mb-0.5">Admin Password</p>
            <p className="text-sm dark:text-ink-500 text-ink-400">Update your login credentials.</p>
          </div>
          <Link to="/admin/change-password"
            className="px-4 py-2 text-sm font-semibold border dark:border-ink-700 border-ink-300 dark:text-ink-300 text-ink-600 rounded-lg hover:border-gold-500 hover:text-gold-500 transition">
            Change Password →
          </Link>
        </div>
      </div>
    </div>
  );
}
