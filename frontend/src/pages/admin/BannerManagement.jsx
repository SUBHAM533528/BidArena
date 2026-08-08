import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Input, Label, Button, Empty } from "../../components/UI";

const empty = { title: "", subtitle: "", link: "", order: 0 };

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => api.get("/banners?all=true").then(r => setBanners(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!editId && !image) { setMsg("Please choose a banner image"); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (image) fd.append("image", image);
    const opts = { headers: { "Content-Type": "multipart/form-data" } };
    if (editId) await api.put(`/banners/${editId}`, fd, opts);
    else await api.post("/banners", fd, opts);
    setForm(empty); setImage(null); setPreview(null); setEditId(null); setShowForm(false);
    setMsg("Saved!"); setTimeout(() => setMsg(""), 2000);
    load();
  };

  const edit = b => {
    setForm({ title: b.title || "", subtitle: b.subtitle || "", link: b.link || "", order: b.order ?? 0 });
    setPreview(b.image);
    setImage(null);
    setEditId(b._id);
    setShowForm(true);
  };

  const remove = async id => { if (!confirm("Delete this banner slide?")) return; await api.delete(`/banners/${id}`); load(); };
  const toggleActive = async id => { await api.patch(`/banners/${id}/toggle-active`); load(); };

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= banners.length) return;
    const list = [...banners];
    [list[idx], list[target]] = [list[target], list[idx]];
    const order = list.map((b, i) => ({ id: b._id, order: i }));
    setBanners(list); // optimistic
    await api.patch("/banners/reorder", { order });
    load();
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="eyebrow mb-1.5">Landing Page</p>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Banner Slides</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Manage the hero carousel shown at the top of the landing page.</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); setImage(null); setPreview(null); }}>
          {showForm ? "Cancel" : "+ New Banner"}
        </Button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">{editId ? "Edit Banner" : "New Banner"}</h2>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label required>Banner Image {`(recommended 1920×800)`}</Label>
              <Input type="file" accept="image/*" onChange={e => {
                const f = e.target.files[0];
                setImage(f);
                if (f) setPreview(URL.createObjectURL(f));
              }} />
              {preview && (
                <img src={preview} alt="preview" className="mt-3 w-full max-h-48 object-cover rounded-lg border dark:border-ink-700 border-ink-200" />
              )}
            </div>
            <div><Label>Title (optional)</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><Label>Subtitle (optional)</Label><Input value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div><Label>Link URL (optional)</Label><Input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Display Order</Label><Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit">{editId ? "Update Banner" : "Create Banner"}</Button>
              {msg && <span className="text-jade-500 text-sm font-medium">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="card p-10"><Empty icon="fa-solid fa-images" title="No banner slides yet" body="Add your first banner slide above — it will appear in the landing page carousel." /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((b, idx) => (
            <div key={b._id} className="card p-4">
              <div className="relative rounded-lg overflow-hidden mb-3 border dark:border-ink-700 border-ink-200">
                <img src={b.image} alt={b.title || "banner"} className="w-full h-36 object-cover" />
                <span className={`absolute top-2 right-2 ${b.isActive ? "badge-green" : "badge-slate"}`}>{b.isActive ? "Active" : "Hidden"}</span>
              </div>
              {(b.title || b.subtitle) && (
                <div className="mb-2">
                  {b.title && <p className="font-bold dark:text-ink-100 text-ink-900">{b.title}</p>}
                  {b.subtitle && <p className="text-xs dark:text-ink-500 text-ink-400">{b.subtitle}</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => edit(b)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => toggleActive(b._id)}>{b.isActive ? "Hide" : "Show"}</Button>
                <Button variant="ghost" size="sm" onClick={() => move(idx, -1)} disabled={idx === 0}><i className="fa-solid fa-arrow-up" /></Button>
                <Button variant="ghost" size="sm" onClick={() => move(idx, 1)} disabled={idx === banners.length - 1}><i className="fa-solid fa-arrow-down" /></Button>
                <Button variant="danger" size="sm" onClick={() => remove(b._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
