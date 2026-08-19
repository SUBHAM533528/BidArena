import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import { Input, Label, Button, Empty, Alert } from "../../components/UI";

const empty = { name:"", ownerName:"", mobile:"", email:"", initialPurse:10000000, maxPlayers:18 };

export default function TeamsByTournament() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams]           = useState([]);
  const [form, setForm]             = useState(empty);
  const [logo, setLogo]             = useState(null);
  const [editId, setEditId]         = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [error, setError]           = useState("");
  const [saving, setSaving]         = useState(false);

  const loadTeams = () => api.get(`/teams?tournament=${tournamentId}`).then(r => setTeams(r.data))
    .catch(err => setError(err.response?.data?.message || "Failed to load teams"));

  useEffect(() => {
    setError("");
    api.get(`/tournaments/${tournamentId}`).then(r => {
      setTournament(r.data);
      setForm(f => ({ ...f, initialPurse: r.data.defaultTeamPurse || 10000000 }));
    }).catch(err => setError(err.response?.data?.message || "Failed to load tournament"));
    loadTeams();
  }, [tournamentId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("tournament", tournamentId);
      if (logo) fd.append("logo", logo);
      const opts = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) await api.put(`/teams/${editId}`, fd, opts);
      else        await api.post("/teams", fd, opts);
      setForm({ ...empty, initialPurse: tournament?.defaultTeamPurse || 10000000 });
      setLogo(null); setEditId(null); setShowForm(false);
      loadTeams();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team");
    } finally {
      setSaving(false);
    }
  };

  const edit = t => {
    setForm({ name: t.name, ownerName: t.ownerName, mobile: t.mobile, email: t.email, initialPurse: t.initialPurse, maxPlayers: t.maxPlayers });
    setEditId(t._id); setShowForm(true);
  };

  const remove = async id => {
    if (!confirm("Delete this team?")) return;
    try { await api.delete(`/teams/${id}`); loadTeams(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <div>
      <Link to="/admin/teams" className="inline-flex items-center gap-1.5 text-xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-600 transition mb-4">
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
            <p className="eyebrow mb-1">{tournament ? tournament.venue || "Teams" : "Teams"}</p>
            <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900 truncate">
              {tournament ? tournament.name : "Loading…"}
            </h1>
          </div>
        </div>
        <Button className="shrink-0" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty, initialPurse: tournament?.defaultTeamPurse || 10000000 }); }}>
          {showForm ? "Cancel" : "+ Add Team"}
        </Button>
      </div>

      {error && <div className="mb-6"><Alert type="error">{error}</Alert></div>}

      {/* Add/Edit form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">
            {editId ? "Edit Team" : `Add New Team to ${tournament?.name || "this tournament"}`}
          </h2>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div><Label>Team Name</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div><Label>Team Logo</Label><Input type="file" accept="image/*" onChange={e=>setLogo(e.target.files[0])}/></div>
            <div><Label>Owner Name</Label><Input required value={form.ownerName} onChange={e=>setForm({...form,ownerName:e.target.value})}/></div>
            <div><Label>Mobile</Label><Input required value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
            <div><Label>Initial Purse (₹)</Label><Input type="number" min="0" required value={form.initialPurse} onChange={e=>setForm({...form,initialPurse:e.target.value})}/></div>
            <div><Label>Max Players</Label><Input type="number" min="1" required value={form.maxPlayers} onChange={e=>setForm({...form,maxPlayers:e.target.value})}/></div>
            <div className="sm:col-span-2 pt-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : (editId ? "Update Team" : "Add Team")}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Team grid */}
      {teams.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-shield-halved" title="No teams yet" body="Add the first team using the button above." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {teams.map(t => {
            const spent = (t.initialPurse || 0) - (t.remainingPurse || 0);
            const pct   = Math.max(0, Math.min(100, (t.remainingPurse / t.initialPurse) * 100));
            return (
              <div key={t._id} className="card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-20 w-20 rounded-2xl dark:bg-white/[0.06] bg-ink-50 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.logo ? <img src={t.logo} className="h-full w-full object-contain p-1.5" alt={t.name} /> : <i className="fa-solid fa-shield-halved text-2xl opacity-30" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-lg dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                    <p className="text-sm dark:text-ink-500 text-ink-400 truncate">{t.ownerName}</p>
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
                    className="flex-1 py-2 text-xs font-semibold text-center rounded-lg dark:bg-white/[0.08] bg-ink-100 dark:text-ink-300 text-ink-600 hover:bg-gold-500/10 hover:text-gold-500 border dark:border-white/[0.1] border-ink-200 transition">
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
