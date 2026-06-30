import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Input, Label, Button, Select, Empty } from "../../components/UI";

const empty = { name:"", description:"", venue:"", startDate:"", endDate:"", registrationStartDate:"", registrationEndDate:"", maxTeams:8, maxPlayers:200 };

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm]  = useState(empty);
  const [logo, setLogo]  = useState(null);
  const [editId, setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]   = useState("");

  const load = () => api.get("/tournaments").then(r => setTournaments(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k, v));
    if (logo) fd.append("logo", logo);
    const opts = { headers: { "Content-Type":"multipart/form-data" } };
    if (editId) await api.put(`/tournaments/${editId}`, fd, opts);
    else        await api.post("/tournaments", fd, opts);
    setForm(empty); setLogo(null); setEditId(null); setShowForm(false);
    setMsg("Saved!"); setTimeout(() => setMsg(""), 2000);
    load();
  };

  const edit = t => {
    setForm({ name:t.name, description:t.description||"", venue:t.venue||"",
      startDate:t.startDate?.slice(0,10)||"", endDate:t.endDate?.slice(0,10)||"",
      registrationStartDate:t.registrationStartDate?.slice(0,10)||"",
      registrationEndDate:t.registrationEndDate?.slice(0,10)||"",
      maxTeams:t.maxTeams, maxPlayers:t.maxPlayers });
    setEditId(t._id); setShowForm(true);
  };

  const remove = async id => { if(!confirm("Delete tournament?")) return; await api.delete(`/tournaments/${id}`); load(); };
  const toggleActive = async id => { await api.patch(`/tournaments/${id}/toggle-active`); load(); };
  const toggleReg    = async id => { await api.patch(`/tournaments/${id}/toggle-registration`); load(); };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Tournaments</h1></div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }}>
          {showForm ? "Cancel" : "+ New Tournament"}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border p-6 mb-6 html-dark-bg" style={{ background:"var(--surface)", borderColor:"var(--border)" }}>
          <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">{editId ? "Edit Tournament" : "New Tournament"}</h2>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Label>Tournament Name</Label><Input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
            <div className="sm:col-span-2"><Label>Description</Label><Input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
            <div><Label>Venue</Label><Input required value={form.venue} onChange={e=>setForm({...form,venue:e.target.value})}/></div>
            <div><Label>Tournament Logo</Label><Input type="file" accept="image/*" onChange={e=>setLogo(e.target.files[0])}/></div>
            <div><Label>Start Date</Label><Input type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></div>
            <div><Label>End Date</Label><Input type="date" required value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></div>
            <div><Label>Registration Start</Label><Input type="date" required value={form.registrationStartDate} onChange={e=>setForm({...form,registrationStartDate:e.target.value})}/></div>
            <div><Label>Registration End</Label><Input type="date" required value={form.registrationEndDate} onChange={e=>setForm({...form,registrationEndDate:e.target.value})}/></div>
            <div><Label>Max Teams</Label><Input type="number" min="2" value={form.maxTeams} onChange={e=>setForm({...form,maxTeams:e.target.value})}/></div>
            <div><Label>Max Players</Label><Input type="number" min="2" value={form.maxPlayers} onChange={e=>setForm({...form,maxPlayers:e.target.value})}/></div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit">{editId ? "Update Tournament" : "Create Tournament"}</Button>
              {msg && <span className="text-jade-500 text-sm font-medium">{msg}</span>}
            </div>
          </form>
          </div>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="card p-10"><Empty icon="🏆" title="No tournaments yet" body="Create your first tournament above."/></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tournaments.map(t => (
            <div key={t._id} className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {t.logo && <img src={t.logo} className="h-10 w-10 rounded-lg object-cover border dark:border-ink-700 border-ink-200" alt={t.name}/>}
                  <div>
                    <p className="font-bold dark:text-ink-100 text-ink-900">{t.name}</p>
                    <p className="text-xs dark:text-ink-500 text-ink-400">{t.venue}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={t.isActive ? "badge-green" : "badge-slate"}>{t.isActive ? "Active" : "Inactive"}</span>
                  <span className={t.registrationOpen ? "badge-gold" : "badge-slate"}>{t.registrationOpen ? "Reg Open" : "Reg Closed"}</span>
                </div>
              </div>
              {t.description && <p className="text-sm dark:text-ink-500 text-ink-400 mb-3">{t.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs dark:text-ink-500 text-ink-400 mb-4">
                <span>Start: {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"}</span>
                <span>End: {t.endDate ? new Date(t.endDate).toLocaleDateString() : "—"}</span>
                <span>Teams: {t.maxTeams}</span>
                <span>Players: {t.maxPlayers}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => edit(t)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(t._id)}>{t.isActive ? "Deactivate" : "Activate"}</Button>
                <Button variant="ghost" size="sm" onClick={() => toggleReg(t._id)}>{t.registrationOpen ? "Close Reg" : "Open Reg"}</Button>
                <Button variant="danger" size="sm" onClick={() => remove(t._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
