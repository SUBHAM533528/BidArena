import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Input, Label, Button, Empty } from "../../components/UI";
import ConfirmDialog from "../../components/ConfirmDialog";
import useConfirm from "../../hooks/useConfirm";

const empty = { caption: "", location: "", order: 0 };

export default function GalleryManagement() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();

  const load = () => api.get("/gallery").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const opts = { headers: { "Content-Type": "multipart/form-data" } };
      if (editId) await api.put(`/gallery/${editId}`, fd, opts);
      else if (image) await api.post("/gallery", fd, opts);
      else { setSaving(false); setError("Please choose an image"); return; }
      setForm(empty); setImage(null); setEditId(null); setShowForm(false);
      setMsg("Saved!"); setTimeout(() => setMsg(""), 2000);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save this photo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (g) => {
    setForm({ caption: g.caption || "", location: g.location || "", order: g.order || 0 });
    setEditId(g._id); setShowForm(true);
  };

  const remove = (g) => {
    confirmDialog.ask({
      title: "Delete this photo?",
      message: `This gallery photo${g.location ? ` from "${g.location}"` : ""} will be permanently removed.`,
      confirmLabel: "Delete Photo",
      danger: true,
      onConfirm: async () => { await api.delete(`/gallery/${g._id}`); load(); },
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Gallery</h1></div>
        <Button variant="jade" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); setImage(null); setError(""); }}>
          {showForm ? "Cancel" : "+ Add Photo"}
        </Button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">{editId ? "Edit Photo" : "Add Photo"}</h2>
          <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Photo {editId ? "(leave blank to keep current)" : "*"}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <div><Label>Caption</Label><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Final round of bidding" /></div>
            <div><Label>Location where auction was held</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. City Sports Complex, Bhubaneswar" /></div>
            <div><Label>Display order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <Button type="submit" variant="jade" loading={saving}>{editId ? "Update Photo" : "Add Photo"}</Button>
              {msg && <span className="text-jade-500 text-sm font-medium">{msg}</span>}
              {error && <span className="text-flame-400 text-sm font-medium">{error}</span>}
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card p-10"><Empty icon="fa-solid fa-images" title="No gallery photos yet" body="Add photos from past auctions above." /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((g) => (
            <div key={g._id} className="card p-4">
              <div className="rounded-xl overflow-hidden aspect-video mb-3 dark:bg-white/[0.06] bg-ink-50">
                <img src={g.image} className="w-full h-full object-cover" alt={g.caption || g.location} />
              </div>
              {g.caption && <p className="font-semibold dark:text-ink-100 text-ink-900 truncate">{g.caption}</p>}
              {g.location && <p className="text-sm dark:text-ink-500 text-ink-400 truncate mb-3"><i className="fa-solid fa-location-dot mr-1" />{g.location}</p>}
              <div className="flex gap-2 mt-2">
                <Button variant="sky" size="sm" onClick={() => edit(g)}><i className="fa-solid fa-pen text-flame-400" /> Edit</Button>
                <Button variant="danger" size="sm" onClick={() => remove(g)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog {...confirmDialog.props} />
    </div>
  );
}
