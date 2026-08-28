import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function formatWhen(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return `${date} · ${time}`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = () => {
    api.get("/notifications").then(r => {
      setItems(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(() => {});
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 20000); // poll every 20s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setUnread(0);
      setItems(items.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const openItem = async (n) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setItems(items.map(x => x._id === n._id ? { ...x, read: true } : x));
        setUnread(u => Math.max(0, u - 1));
      } catch {}
    }
    setOpen(false);
    if (n.type === "contact_message") navigate("/admin/contact-messages");
    else if (n.tournament?._id) navigate(`/admin/players/tournament/${n.tournament._id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="relative h-9 w-9 rounded-lg flex items-center justify-center dark:text-ink-400 text-ink-500 dark:hover:bg-white/[0.05] hover:bg-ink-100 transition"
        title="Notifications"
        onClick={() => setOpen(o => !o)}
      >
        <i className="fa-regular fa-bell text-sm" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-[3px] rounded-full bg-flame-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] rounded-xl border dark:border-white/[0.08] border-ink-200 dark:bg-[#0d1310] bg-white shadow-card-hover overflow-hidden animate-slide-down z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/[0.06] border-ink-100">
            <p className="text-sm font-bold dark:text-white text-ink-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-2xs font-semibold text-jade-500 hover:text-jade-400 transition">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <i className="fa-regular fa-bell-slash text-2xl dark:text-ink-700 text-ink-300 mb-2" />
                <p className="text-xs dark:text-ink-500 text-ink-400">No notifications yet</p>
              </div>
            ) : (
              items.map(n => (
                <button
                  key={n._id}
                  onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b dark:border-white/[0.05] border-ink-50 dark:hover:bg-white/[0.04] hover:bg-ink-50 transition flex gap-3 ${!n.read ? "dark:bg-jade-500/[0.06] bg-jade-50" : ""}`}
                >
                  <div className="h-8 w-8 rounded-full bg-jade-500/15 border border-jade-500/25 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    {n.type === "player_registered" && n.player?.photo ? (
                      <img src={n.player.photo} alt={n.player.fullName || "Player"} className="h-full w-full object-cover" />
                    ) : n.type === "contact_message" ? (
                      <i className="fa-solid fa-envelope text-jade-500 text-xs" />
                    ) : (
                      <i className="fa-solid fa-user-plus text-jade-500 text-xs" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-snug ${!n.read ? "font-semibold dark:text-ink-100 text-ink-900" : "dark:text-ink-300 text-ink-600"}`}>
                      {n.message}
                    </p>
                    {n.tournament?.name && (
                      <p className="text-2xs dark:text-ink-500 text-ink-400 mt-0.5">{n.tournament.name}</p>
                    )}
                    {n.type === "contact_message" && n.contactMessage?.email && (
                      <p className="text-2xs dark:text-ink-500 text-ink-400 mt-0.5">{n.contactMessage.email}</p>
                    )}
                    <p className="text-2xs dark:text-ink-600 text-ink-400 mt-1 font-mono">{formatWhen(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-jade-500 shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
