import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button } from "../../components/UI";

export default function TermsManagement() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/content/terms").then((r) => setContent(r.data?.content || "")).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/content/terms", { title: "Terms & Conditions", content });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1.5">Manage</p>
        <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Terms &amp; Conditions</h1>
      </div>

      <div className="card p-6">
        {loading ? (
          <p className="dark:text-ink-500 text-ink-400 text-sm">Loading…</p>
        ) : (
          <form onSubmit={save} className="grid gap-4">
            <p className="text-sm dark:text-ink-500 text-ink-400">
              This text is shown on the public <span className="font-semibold">/terms</span> page and linked from the site footer. Leave blank to show the default placeholder text.
            </p>
            <textarea rows={16} value={content} onChange={(e) => setContent(e.target.value)}
              className="form-input resize-y font-mono text-xs leading-relaxed" />
            <div className="flex items-center gap-3">
              <Button type="submit" variant="jade" loading={saving}>Save Terms</Button>
              {saved && <span className="text-jade-500 text-sm font-medium">Saved</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
