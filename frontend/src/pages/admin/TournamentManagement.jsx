import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Input, Label, Button, Select, Empty } from "../../components/UI";
import ConfirmDialog from "../../components/ConfirmDialog";
import useConfirm from "../../hooks/useConfirm";

const empty = { name:"", description:"", venue:"", startDate:"", endDate:"", registrationStartDate:"", registrationEndDate:"", maxTeams:8, maxPlayers:200, defaultBasePrice:300, defaultTeamPurse:10000 };

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([]);
  const [form, setForm]  = useState(empty);
  const [logo, setLogo]  = useState(null);
  const [editId, setEditId]   = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg]   = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null); // tournament _id mid-toggle, for per-card button loading
  const confirmDialog = useConfirm();

  const load = () => api.get("/tournaments").then(r => setTournaments(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (logo) fd.append("logo", logo);
      const opts = { headers: { "Content-Type":"multipart/form-data" } };
      if (editId) await api.put(`/tournaments/${editId}`, fd, opts);
      else        await api.post("/tournaments", fd, opts);
      setForm(empty); setLogo(null); setEditId(null); setShowForm(false);
      setMsg("Saved!"); setTimeout(() => setMsg(""), 2000);
      load();
    } finally {
      setSaving(false);
    }
  };

  const edit = t => {
    setForm({ name:t.name, description:t.description||"", venue:t.venue||"",
      startDate:t.startDate?.slice(0,10)||"", endDate:t.endDate?.slice(0,10)||"",
      registrationStartDate:t.registrationStartDate?.slice(0,10)||"",
      registrationEndDate:t.registrationEndDate?.slice(0,10)||"",
      maxTeams:t.maxTeams, maxPlayers:t.maxPlayers,
      defaultBasePrice:t.defaultBasePrice ?? 300, defaultTeamPurse:t.defaultTeamPurse ?? 10000 });
    setEditId(t._id); setShowForm(true);
  };

  const toggleActive = async (id) => {
    setActionId(id);
    try { await api.patch(`/tournaments/${id}/toggle-active`); load(); }
    finally { setActionId(null); }
  };
  const toggleReg = async (id) => {
    setActionId(id);
    try { await api.patch(`/tournaments/${id}/toggle-registration`); load(); }
    finally { setActionId(null); }
  };

  const remove = (t) => {
    confirmDialog.ask({
      title: "Delete this tournament?",
      message: `"${t.name}" will be permanently removed. This can't be undone.`,
      confirmLabel: "Delete Tournament",
      danger: true,
      onConfirm: async () => { await api.delete(`/tournaments/${t._id}`); load(); },
    });
  };

  const removeAll = () => {
    confirmDialog.ask({
      title: `Delete all ${tournaments.length} tournaments?`,
      message: "This removes every tournament along with all of their teams and players. This is permanent and cannot be undone.",
      confirmLabel: "Delete Everything",
      danger: true,
      onConfirm: async () => { await api.delete("/tournaments", { data: { confirm: "DELETE ALL" } }); load(); },
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Tournaments</h1></div>
        <div className="flex gap-2 shrink-0">
          {tournaments.length > 0 && (
            <Button variant="danger" onClick={removeAll}>
              <i className="fa-solid fa-trash-can" /> Delete All
            </Button>
          )}
          <Button variant="jade" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }}>
            {showForm ? "Cancel" : "+ New Tournament"}
          </Button>
        </div>
      </div>

      {showForm && (
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
            <div><Label>Default Player Base Price (₹)</Label><Input type="number" min="0" required value={form.defaultBasePrice} onChange={e=>setForm({...form,defaultBasePrice:e.target.value})}/></div>
            <div><Label>Default Team Purse (₹)</Label><Input type="number" min="0" required value={form.defaultTeamPurse} onChange={e=>setForm({...form,defaultTeamPurse:e.target.value})}/></div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit" variant="jade" loading={saving}>{editId ? "Update Tournament" : "Create Tournament"}</Button>
              {msg && <span className="text-jade-500 text-sm font-medium">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="card p-10"><Empty icon="fa-solid fa-trophy" title="No tournaments yet" body="Create your first tournament above."/></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {tournaments.map(t => (
            <div key={t._id} className="card p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-20 w-20 rounded-2xl dark:bg-white/[0.06] bg-ink-50 border dark:border-white/[0.1] border-ink-200 overflow-hidden flex items-center justify-center shrink-0">
                    {t.logo
                      ? <img src={t.logo} className="h-full w-full object-contain p-1.5" alt={t.name}/>
                      : <i className="fa-solid fa-trophy text-2xl opacity-30" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-xl dark:text-ink-100 text-ink-900 truncate">{t.name}</p>
                    <p className="text-sm dark:text-ink-500 text-ink-400 truncate">{t.venue}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0 items-end">
                  <span className={t.isActive ? "badge-green" : "badge-slate"}>{t.isActive ? "Active" : "Inactive"}</span>
                  <span className={t.registrationOpen ? "badge-gold" : "badge-slate"}>{t.registrationOpen ? "Reg Open" : "Reg Closed"}</span>
                </div>
              </div>
              {t.description && <p className="text-sm dark:text-ink-500 text-ink-400 mb-4">{t.description}</p>}
              <div className="grid grid-cols-3 gap-3 card-inset rounded-xl p-4 mb-4">
                {[
                  ["Start", t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"],
                  ["End", t.endDate ? new Date(t.endDate).toLocaleDateString() : "—"],
                  ["Teams", t.maxTeams],
                  ["Players", t.maxPlayers],
                  ["Base Price", `₹${(t.defaultBasePrice ?? 0).toLocaleString()}`],
                  ["Team Purse", `₹${(t.defaultTeamPurse ?? 0).toLocaleString()}`],
                ].map(([l,v]) => (
                  <div key={l}>
                    <p className="eyebrow mb-1">{l}</p>
                    <p className="text-sm font-bold dark:text-ink-200 text-ink-800 truncate">{v}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="sky" size="sm" onClick={() => edit(t)}>
                  <i className="fa-solid fa-pen text-flame-400" /> Edit
                </Button>
                <Button variant={t.isActive ? "soft" : "jade"} size="sm" loading={actionId===t._id} onClick={() => toggleActive(t._id)}>
                  <i className={`fa-solid ${t.isActive ? "fa-pause" : "fa-play"}`} /> {t.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button variant={t.registrationOpen ? "soft" : "soft-jade"} size="sm" loading={actionId===t._id} onClick={() => toggleReg(t._id)}>
                  {t.registrationOpen ? "Close Reg" : "Open Reg"}
                </Button>
                <Button variant="danger" size="sm" onClick={() => remove(t)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog {...confirmDialog.props} />
    </div>
  );
}
