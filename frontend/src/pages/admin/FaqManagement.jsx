import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Input, Label, Button, Empty } from "../../components/UI";
import ConfirmDialog from "../../components/ConfirmDialog";
import useConfirm from "../../hooks/useConfirm";

const empty = { question: "", answer: "", order: 0 };

export default function FaqManagement() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const confirmDialog = useConfirm();

  const load = () => api.get("/faqs").then((r) => setFaqs(r.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/faqs/${editId}`, form);
      else await api.post("/faqs", form);
      setForm(empty); setEditId(null); setShowForm(false);
      setMsg("Saved!"); setTimeout(() => setMsg(""), 2000);
      load();
    } finally {
      setSaving(false);
    }
  };

  const edit = (f) => {
    setForm({ question: f.question, answer: f.answer, order: f.order || 0 });
    setEditId(f._id); setShowForm(true);
  };

  const remove = (f) => {
    confirmDialog.ask({
      title: "Delete this FAQ?",
      message: `"${f.question}" will be permanently removed.`,
      confirmLabel: "Delete FAQ",
      danger: true,
      onConfirm: async () => { await api.delete(`/faqs/${f._id}`); load(); },
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">FAQs</h1></div>
        <Button variant="jade" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(empty); }}>
          {showForm ? "Cancel" : "+ New FAQ"}
        </Button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-display text-lg font-semibold dark:text-ink-100 text-ink-900 mb-5">{editId ? "Edit FAQ" : "New FAQ"}</h2>
          <form onSubmit={submit} className="grid gap-4">
            <div><Label>Question *</Label><Input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
            <div>
              <Label>Answer *</Label>
              <textarea required rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="form-input resize-none" />
            </div>
            <div className="w-32"><Label>Display order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="jade" loading={saving}>{editId ? "Update FAQ" : "Create FAQ"}</Button>
              {msg && <span className="text-jade-500 text-sm font-medium">{msg}</span>}
            </div>
          </form>
        </div>
      )}

      {faqs.length === 0 ? (
        <div className="card p-10"><Empty icon="fa-solid fa-circle-question" title="No FAQs yet" body="Add your first question and answer above." /></div>
      ) : (
        <div className="space-y-4">
          {faqs.map((f) => (
            <div key={f._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold dark:text-ink-100 text-ink-900">{f.question}</p>
                  <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">{f.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="sky" size="sm" onClick={() => edit(f)}><i className="fa-solid fa-pen text-flame-400" /></Button>
                  <Button variant="danger" size="sm" onClick={() => remove(f)}><i className="fa-solid fa-trash-can" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog {...confirmDialog.props} />
    </div>
  );
}
