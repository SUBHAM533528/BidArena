import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to:"/admin",              icon:"fa-solid fa-grip",              label:"Dashboard"      },
  { to:"/admin/tournaments",  icon:"fa-solid fa-trophy",            label:"Tournaments"    },
  { to:"/admin/teams",        icon:"fa-solid fa-shield-halved",     label:"Teams"          },
  { to:"/admin/players",      icon:"fa-solid fa-baseball-bat-ball", label:"Players"        },
  { to:"/admin/auction",      icon:"fa-solid fa-gavel",             label:"Live Auctions"  },
  { to:"/admin/sold",         icon:"fa-solid fa-circle-check",      label:"Sold Players"   },
  { to:"/admin/unsold",       icon:"fa-solid fa-circle-xmark",      label:"Unsold Players" },
  { to:"/admin/reports",      icon:"fa-solid fa-file-lines",        label:"Reports"        },
  { to:"/admin/settings",     icon:"fa-solid fa-gear",              label:"Settings"       },
];

export default function Sidebar({ onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar w-64 h-screen flex flex-col border-r">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-ink-200 dark:border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gold-500 flex items-center justify-center shrink-0 shadow-glow-gold">
            <i className="fa-solid fa-gavel text-ink-950 text-sm" />
          </div>
          <div className="min-w-0">
            <span className="font-display text-lg font-bold text-gold-500 tracking-wide leading-none block truncate">BidArena</span>
            <p className="text-[9px] text-ink-500 uppercase tracking-widest mt-1">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 rounded dark:text-ink-500 text-ink-400 dark:hover:text-ink-300 hover:text-ink-700 transition shrink-0">
            <i className="fa-solid fa-xmark text-base" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto no-scrollbar space-y-1">
        {NAV.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === "/admin"} onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <span className="w-5 text-center shrink-0"><i className={`${l.icon} text-[15px]`} /></span>
            <span className="flex-1">{l.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-ink-200 dark:border-white/[0.06] shrink-0 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-lg dark:bg-white/[0.03] bg-ink-50">
          <div className="h-8 w-8 rounded-full bg-gold-500/15 border border-gold-500/25 flex items-center justify-center text-gold-500 text-xs font-bold shrink-0">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium dark:text-ink-200 text-ink-700 truncate">{user?.name}</p>
            <p className="text-2xs dark:text-ink-500 text-ink-400 truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink to="/admin/change-password" onClick={onClose}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
          <span className="w-5 text-center"><i className="fa-solid fa-lock text-[15px]" /></span>
          <span>Change Password</span>
        </NavLink>
        <button
          onClick={async () => { await logout(); navigate("/admin/login"); }}
          className="nav-link w-full text-left text-flame-500 hover:text-flame-400 hover:bg-flame-500/10">
          <span className="w-5 text-center"><i className="fa-solid fa-right-from-bracket text-[15px]" /></span>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
