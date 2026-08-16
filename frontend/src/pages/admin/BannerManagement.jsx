import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button, Input, Label, Empty, Alert } from "../../components/UI";

const BACKEND = "https://bidarena-backend-su27.onrender.com/api";

export default function BannerManagement() {
  const [banners,    setBanners]    = useState([]);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [form,       setForm]       = useState({ title:"", subtitle:"", link:"", order:"0", isActive:true });
  const [imageFile,  setImageFile]  = useState(null);
  const [preview,    setPreview]    = useState("");
  const [error,      setError]      = useState("");
  const [saving,     setSaving]     = useState(false);

  const load = () => api.get(`${BACKEND}/banners`).then(r => setBanners(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openForm = (b = null) => {
    setEditId(b?._id || null);
    setForm({ title: b?.title||"", subtitle: b?.subtitle||"", link: b?.link||"", order: b?.order||0, isActive: b?.isActive ?? true });
    setPreview(b?.image || "");
    setImageFile(null);
    setError("");
    setShowForm(true);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const save = async (e) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      const opts = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) await api.put(`${BACKEND}/banners/${editId}`, fd, opts);
      else        await api.post(`${BACKEND}/banners`, fd, opts);
      setShowForm(false); setEditId(null); load();
    } catch(err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this banner?")) return;
    await api.delete(`${BACKEND}/banners/${id}`);
    load();
  };

  const toggle = async (b) => {
    await api.put(`${BACKEND}/banners/${b._id}`, { isActive: !b.isActive });
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1.5">Manage</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Banner Carousel</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">These banners appear on the public landing page.</p>
        </div>
        <Button onClick={() => openForm()}>
          <i className="fa-solid fa-plus" /> Add Banner
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">
            {editId ? "Edit Banner" : "New Banner"}
          </h2>
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Banner Image {!editId && <span className="text-flame-500">*</span>}</Label>
              <Input type="file" accept="image/*" onChange={handleFile} required={!editId} />
              {preview && (
                <img src={preview} alt="preview"
                  className="mt-3 h-40 w-full object-cover rounded-xl border dark:border-ink-700 border-ink-200" />
              )}
            </div>
            <div>
              <Label>Title</Label>
              <Input placeholder="e.g. IPL 2026 Auction" value={form.title}
                onChange={e => setForm({...form, title: e.target.value})} />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input placeholder="e.g. Register now before slots fill up"
                value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input placeholder="/player-registration or https://..."
                value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" min="0" value={form.order}
                onChange={e => setForm({...form, order: e.target.value})} />
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setForm({...form, isActive: !form.isActive})}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form.isActive ? "bg-jade-600" : "dark:bg-ink-700 bg-ink-300"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm dark:text-ink-300 text-ink-600">{form.isActive ? "Active (visible on site)" : "Inactive (hidden)"}</span>
              </label>
            </div>
            {error && <div className="sm:col-span-2"><Alert type="error">{error}</Alert></div>}
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</> : (editId ? "Update Banner" : "Add Banner")}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {/* Banner grid */}
      {banners.length === 0 ? (
        <div className="card p-10">
          <Empty icon="fa-solid fa-image" title="No banners yet" body="Add your first banner above to show it on the landing page." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b, idx) => (
            <div key={b._id} className={`card overflow-hidden group ${!b.isActive ? "opacity-60" : ""}`}>
              {/* Image */}
              <div className="relative h-44 dark:bg-ink-800 bg-ink-100 overflow-hidden">
                {b.image
                  ? <img src={b.image} alt={b.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="h-full flex items-center justify-center"><i className="fa-solid fa-image text-3xl dark:text-ink-600 text-ink-300" /></div>}
                {/* Order badge */}
                <span className="absolute top-2 left-2 bg-black/60 text-white text-2xs font-bold px-2 py-1 rounded">
                  #{idx + 1}
                </span>
                {/* Status badge */}
                <span className={`absolute top-2 right-2 text-2xs font-bold px-2 py-1 rounded ${b.isActive ? "bg-jade-600 text-white" : "dark:bg-ink-700 bg-ink-300 dark:text-ink-400 text-ink-600"}`}>
                  {b.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {/* Info */}
              <div className="p-4">
                <p className="font-bold text-sm dark:text-ink-100 text-ink-900 truncate">{b.title || "Untitled"}</p>
                {b.subtitle && <p className="text-xs dark:text-ink-500 text-ink-400 truncate mt-0.5">{b.subtitle}</p>}
                {b.link && <p className="text-2xs text-gold-500 truncate mt-1"><i className="fa-solid fa-link mr-1" />{b.link}</p>}
                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => openForm(b)}>
                    <i className="fa-solid fa-pen" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggle(b)}>
                    <i className={`fa-solid ${b.isActive ? "fa-eye-slash" : "fa-eye"}`} />
                    {b.isActive ? "Hide" : "Show"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => remove(b._id)}>
                    <i className="fa-solid fa-trash" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
