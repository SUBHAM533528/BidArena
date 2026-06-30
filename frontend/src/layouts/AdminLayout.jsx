import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { ThemeToggle } from "../components/UI";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen dark:bg-ink-900 bg-ink-50">
      {open && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setOpen(false)} />}
      <div className={`fixed md:sticky md:top-0 md:h-screen z-30 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden h-12 px-4 flex items-center justify-between dark:bg-ink-950 bg-white border-b dark:border-ink-800 border-ink-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg dark:hover:bg-ink-800 hover:bg-ink-100 transition">
              <div className="w-4 h-px dark:bg-ink-400 bg-ink-600 mb-1.5" />
              <div className="w-4 h-px dark:bg-ink-400 bg-ink-600 mb-1.5" />
              <div className="w-4 h-px dark:bg-ink-400 bg-ink-600" />
            </button>
            <span className="font-display text-sm font-semibold text-gold-500">StrikeZone</span>
          </div>
          <ThemeToggle />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
