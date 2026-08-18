import React, { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="hidden md:flex h-16 px-6 items-center justify-between gap-4 dark:bg-white/[0.02] bg-white border-b dark:border-white/[0.06] border-ink-200 sticky top-0 z-10 backdrop-blur-xl">
      <div className="min-w-0">
        <h1 className="font-display text-base font-semibold dark:text-white text-ink-900 leading-tight">Auction Admin Panel</h1>
      </div>

      <div className="flex-1 max-w-sm">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-xs dark:text-ink-600 text-ink-400" />
          <input
            type="text"
            placeholder="Search teams, players…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-all dark:bg-white/[0.03] bg-ink-50 dark:border-white/[0.08] border-ink-200 dark:text-ink-200 text-ink-700 dark:placeholder:text-ink-600 placeholder:text-ink-400 focus:border-gold-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center dark:text-ink-400 text-ink-500 dark:hover:bg-white/[0.05] hover:bg-ink-100 transition" title="Messages">
          <i className="fa-regular fa-comment-dots text-sm" />
        </button>
        <button className="relative h-9 w-9 rounded-lg flex items-center justify-center dark:text-ink-400 text-ink-500 dark:hover:bg-white/[0.05] hover:bg-ink-100 transition" title="Notifications">
          <i className="fa-regular fa-bell text-sm" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-flame-500" />
        </button>

        <div className="relative ml-2" ref={ref}>
          <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg dark:hover:bg-white/[0.05] hover:bg-ink-100 transition">
            <div className="h-8 w-8 rounded-full bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-gold-500 text-xs font-bold shrink-0">
              {(user?.name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold dark:text-ink-200 text-ink-700 leading-tight">{user?.name || "Admin"}</p>
              <p className="text-[10px] dark:text-ink-500 text-ink-400 leading-tight">Admin</p>
            </div>
            <i className={`fa-solid fa-chevron-down text-[10px] dark:text-ink-500 text-ink-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border dark:border-white/[0.08] border-ink-200 dark:bg-[#12160f] bg-white shadow-card-hover overflow-hidden animate-slide-down">
              <Link to="/admin/change-password" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm dark:text-ink-300 text-ink-600 dark:hover:bg-white/[0.05] hover:bg-ink-50 transition">
                <i className="fa-solid fa-lock text-xs w-4" /> Change Password
              </Link>
              <Link to="/admin/settings" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm dark:text-ink-300 text-ink-600 dark:hover:bg-white/[0.05] hover:bg-ink-50 transition">
                <i className="fa-solid fa-gear text-xs w-4" /> Settings
              </Link>
              <button
                onClick={async () => { await logout(); navigate("/admin/login"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-flame-500 hover:bg-flame-500/10 transition border-t dark:border-white/[0.06] border-ink-100">
                <i className="fa-solid fa-right-from-bracket text-xs w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    // Admin panel renders on a white page background — only the Sidebar
    // is deliberately dark (its own hardcoded navy styling).
    <div className="flex min-h-screen bg-ink-50">
      {open && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
      <div className={`fixed md:sticky md:top-0 md:h-screen z-30 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-12 px-4 flex items-center justify-between bg-white border-b border-ink-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-ink-100 transition">
              <div className="w-4 h-px bg-ink-600 mb-1.5" />
              <div className="w-4 h-px bg-ink-600 mb-1.5" />
              <div className="w-4 h-px bg-ink-600" />
            </button>
            <span className="font-display text-sm font-semibold text-gold-600">BidArena</span>
          </div>
        </div>
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
