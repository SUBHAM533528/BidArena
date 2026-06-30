import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import { Card, Input, Label, Button, Select, Empty } from "../../components/UI";

const empty = { tournament:"", name:"", ownerName:"", mobile:"", email:"", initialPurse:10000000, maxPlayers:18 };

export default function TeamManagement() {
  const [teams, setTeams]             = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm]               = useState(empty);
  const [logo, setLogo]               = useState(null);
  const [editId, setEditId]           = useState(null);
  const [showForm, setShowForm]       = useState(false);

  useEffect(() => {
    api.get("/tournaments").then(r => {
      setTournaments(r.data);
      const first = r.data[0];
      if (first) setForm(f => ({ ...f, tournament: first._id, initialPurse: first.defaultTeamPurse || 10000000 }));
    });
  }, []);

  const load = () => api.get("/teams").then(r => setTeams(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (logo) fd.append("logo", logo);
    const opts = { headers: { "Content-Type": "multipart/form-data" } };
    if (editId) await api.put(`/teams/${editId}`, fd, opts);
    else        await api.post("/teams", fd, opts);
    setForm({ ...empty, tournament: form.tournament }); setLogo(null); setEditId(null); setShowForm(false);
    load();
  };

  const edit = t => {
    setForm({ tournament: t.tournament, name: t.name, ownerName: t.ownerName, mobile: t.mobile, email: t.email, initialPurse: t.initialPurse, maxPlayers: t.maxPlayers });
    setEditId(t._id); setShowForm(true);
  };

  const remove = async id => {
    if (!confirm("Delete this team?")) return;
    await api.delete(`/teams/${id}`); load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1.5">Manage</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Teams</h1>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty, tournament: form.tournament }); }}>
          {showForm ? "Cancel" : "+ Add Team"}
        </Button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-6 mb-6 shadow-card-dark">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">
            {editId ? "Edit Team" : "Add New Team"}
          </h2>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Tournament</Label>
              <Select required value={form.tournament}
                onChange={e => {
                  const t = tournaments.find(t => t._id === e.target.value);
                  setForm({ ...form, tournament: e.target.value, initialPurse: t?.defaultTeamPurse || 10000000 });
                }}>
                {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </Select>
            </div>
            <div><Label>Team Name</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><Label>Team Logo</Label><Input type="file" accept="image/*" onChange={e=>setLogo(e.target.files[0])}/></div>
            <div><Label>Owner Name</Label><Input required value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})}/></div>
            <div><Label>Mobile</Label><Input required value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            <div><Label>Initial Purse (₹)</Label><Input type="number" min="0" required value={form.initialPurse} onChange={e=>setForm({...form,initialPurse:e.target.value})}/></div>
            <div><Label>Max Players</Label><Input type="number" min="1" required value={form.maxPlayers} onChange={e=>setForm({...form,maxPlayers:e.target.value})}/></div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit">{editId ? "Update Team" : "Add Team"}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Team grid */}
      {teams.length === 0 ? (
        <div className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-10">
          <Empty icon="🛡️" title="No teams yet" body="Add your first team using the button above." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map(t => {
            const spent = (t.initialPurse || 0) - (t.remainingPurse || 0);
            const pct   = Math.max(0, Math.min(100, (t.remainingPurse / t.initialPurse) * 100));
            return (
              <div key={t._id} className="dark:bg-ink-850 bg-white rounded-xl border dark:border-ink-700 border-ink-200 p-5 hover:border-gold-500/40 transition shadow-card-light dark:shadow-card-dark">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl dark:bg-ink-700 bg-ink-100 border dark:border-ink-600 border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.logo ? <img src={t.logo} className="h-full w-full object-cover" alt={t.name} /> : <span className="text-xl">🛡️</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                    <p className="text-xs dark:text-ink-500 text-ink-400">{t.ownerName}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="dark:text-ink-500 text-ink-400 text-xs">Remaining Purse</span>
                    <span className="font-mono font-bold text-jade-500 text-xs">₹{t.remainingPurse?.toLocaleString()}</span>
                  </div>
                  <div className="purse-track">
                    <div className={`h-full rounded-full ${pct < 25 ? "bg-flame-500" : "bg-jade-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs dark:text-ink-600 text-ink-400">
                    <span>Squad: {t.squad?.length || 0}/{t.maxPlayers}</span>
                    <span>Spent: ₹{spent.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Link to={`/admin/teams/${t._id}`}
                    className="flex-1 py-2 text-xs font-semibold text-center rounded-lg dark:bg-ink-700 bg-ink-100 dark:text-ink-300 text-ink-600 hover:bg-gold-500/10 hover:text-gold-500 border dark:border-ink-600 border-ink-200 transition">
                    👥 View Squad
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => edit(t)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => remove(t._id)}>Delete</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
