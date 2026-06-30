import React from "react";

/* ── Card ──────────────────────────────────────────── */
export function Card({ children, className = "", hover = true }) {
  return (
    <div className={`card ${hover ? "" : "hover:shadow-card-dark"} p-5 ${className}`}>
      {children}
    </div>
  );
}

/* ── Button ────────────────────────────────────────── */
export function Button({ children, variant="primary", size="md", className="", ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const sizes = { xs:"px-2.5 py-1.5 text-2xs", sm:"px-3 py-2 text-xs", md:"px-4 py-2.5 text-sm", lg:"px-6 py-3 text-sm" };
  const variants = {
    primary: "bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-ink-950 shadow-sm hover:shadow-md",
    ghost:   "bg-transparent hover:bg-ink-800 dark:hover:bg-ink-800 text-ink-300 dark:text-ink-300 border border-ink-700 dark:border-ink-700 hover:border-ink-600",
    outline: "bg-transparent border border-ink-300 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-gold-500 hover:text-gold-500",
    danger:  "bg-flame-600 hover:bg-flame-500 active:bg-flame-700 text-white shadow-sm",
    jade:    "bg-jade-600 hover:bg-jade-500 active:bg-jade-700 text-white shadow-sm",
    soft:    "bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 border border-gold-500/20",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/* ── Input ─────────────────────────────────────────── */
export function Input({ className = "", ...props }) {
  return <input {...props} className={`form-input ${className}`} />;
}

/* ── Select ────────────────────────────────────────── */
export function Select({ className = "", children, ...props }) {
  return (
    <select {...props} className={`form-input ${className}`}>
      {children}
    </select>
  );
}

/* ── Label ─────────────────────────────────────────── */
export function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-ink-500 dark:text-ink-500 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-flame-500 ml-0.5">*</span>}
    </label>
  );
}

/* ── Badge ─────────────────────────────────────────── */
export function Badge({ children, color = "slate" }) {
  const cls = { slate:"badge-slate", gold:"badge-gold", green:"badge-green", red:"badge-red" };
  return <span className={cls[color]}>{children}</span>;
}

/* ── StatCard ──────────────────────────────────────── */
export function StatCard({ label, value, sub, accent = "gold", icon }) {
  const accents = {
    gold:  "border-l-gold-500",
    green: "border-l-jade-500",
    red:   "border-l-flame-500",
    slate: "border-l-ink-500",
  };
  return (
    <div className={`stat-card border-l-4 ${accents[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="eyebrow">{label}</span>
        {icon && <span className="text-xl opacity-50">{icon}</span>}
      </div>
      <p className="font-display text-2xl font-semibold dark:text-ink-50 text-ink-900">{value}</p>
      {sub && <p className="text-xs dark:text-ink-500 text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── SectionTitle ──────────────────────────────────── */
export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl font-semibold dark:text-ink-50 text-ink-900">{children}</h1>
      {sub && <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── ThemeToggle — uses ThemeContext so it stays in sync everywhere ── */
export function ThemeToggle() {
  const ctx = React.useContext(React.createContext(null));
  // Read directly from DOM so it works even outside ThemeContext
  const [dark, setDark] = React.useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );

  // Keep in sync when another toggle changes the DOM class
  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 shrink-0"
      style={{ background: dark ? "#1e293b" : "#cbd5e1" }}
    >
      <span
        className="absolute top-1 h-5 w-5 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center text-[10px]"
        style={{
          left: "4px",
          transform: dark ? "translateX(28px)" : "translateX(0)",
          background: dark ? "#f59e0b" : "#ffffff",
        }}
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}

/* ── Empty State ───────────────────────────────────── */
export function Empty({ icon = "📭", title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3 opacity-40">{icon}</span>
      <p className="font-semibold dark:text-ink-300 text-ink-600">{title}</p>
      {body && <p className="text-sm dark:text-ink-500 text-ink-400 mt-1 max-w-xs">{body}</p>}
    </div>
  );
}

/* ── Alert ─────────────────────────────────────────── */
export function Alert({ children, type = "error" }) {
  const styles = {
    error:   "bg-flame-500/10 border-flame-500/30 text-flame-400",
    success: "bg-jade-500/10  border-jade-500/30  text-jade-400",
    info:    "bg-gold-500/10  border-gold-500/30  text-gold-500",
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
