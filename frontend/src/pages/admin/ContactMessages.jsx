import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Button, Empty, Badge } from "../../components/UI";
import ConfirmDialog from "../../components/ConfirmDialog";
import useConfirm from "../../hooks/useConfirm";

const STATUS_COLOR = { new: "gold", read: "slate", resolved: "green" };

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState("");
  const confirmDialog = useConfirm();

  const load = () => api.get("/contact", { params: filter ? { status: filter } : {} }).then((r) => setMessages(r.data));
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (m, status) => {
    await api.patch(`/contact/${m._id}`, { status });
    load();
  };

  const remove = (m) => {
    confirmDialog.ask({
      title: "Delete this message?",
      message: `The message from "${m.name}" will be permanently removed.`,
      confirmLabel: "Delete Message",
      danger: true,
      onConfirm: async () => { await api.delete(`/contact/${m._id}`); load(); },
    });
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div><p className="eyebrow mb-1.5">Manage</p><h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Contact Messages</h1></div>
        <div className="flex gap-2">
          {["", "new", "read", "resolved"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${filter === s
                ? "bg-jade-600 border-jade-600 text-white"
                : "dark:border-white/[0.1] border-ink-200 dark:text-ink-400 text-ink-500 hover:border-jade-500"}`}>
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="card p-10"><Empty icon="fa-solid fa-envelope" title="No messages" body="Submissions from the Contact Us section will show up here." /></div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold dark:text-ink-100 text-ink-900">{m.name}</p>
                    <Badge color={STATUS_COLOR[m.status]}>{m.status}</Badge>
                  </div>
                  <p className="text-sm dark:text-ink-500 text-ink-400">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                  {m.subject && <p className="text-sm font-medium dark:text-ink-300 text-ink-600 mt-1">{m.subject}</p>}
                </div>
                <p className="text-2xs dark:text-ink-500 text-ink-400 shrink-0">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <p className="text-sm dark:text-ink-400 text-ink-500 mb-4 whitespace-pre-line">{m.message}</p>
              <div className="flex flex-wrap gap-2">
                {m.status !== "read" && <Button variant="sky" size="sm" onClick={() => setStatus(m, "read")}>Mark Read</Button>}
                {m.status !== "resolved" && <Button variant="soft-jade" size="sm" onClick={() => setStatus(m, "resolved")}>Mark Resolved</Button>}
                <Button variant="danger" size="sm" onClick={() => remove(m)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog {...confirmDialog.props} />
    </div>
  );
}
