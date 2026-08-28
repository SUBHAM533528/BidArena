import React from "react";
import SelectField from "./SelectField";

export function Card({ children, className = "" }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function Button({ children, variant="primary", size="md", className="", loading=false, disabled=false, ...props }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed select-none";
  const sizes = { xs:"px-2.5 py-1.5 text-2xs", sm:"px-3 py-2 text-xs", md:"px-4 py-2.5 text-sm", lg:"px-6 py-3 text-sm" };
  const variants = {
    primary:"bg-gold-500 hover:bg-gold-400 active:bg-gold-600 text-ink-950 shadow-sm hover:shadow-md",
    ghost:"bg-transparent border dark:border-white/[0.08] border-ink-300 dark:text-ink-300 text-ink-600 dark:hover:bg-white/[0.05] hover:bg-ink-100",
    outline:"bg-transparent border dark:border-white/[0.08] border-ink-300 dark:text-ink-400 text-ink-500 hover:border-gold-500 hover:text-gold-500",
    danger:"bg-flame-600 hover:bg-flame-500 text-white shadow-sm",
    jade:"bg-jade-600 hover:bg-jade-500 text-white shadow-sm",
    soft:"bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 border border-gold-500/20",
    "soft-jade":"bg-jade-500/10 hover:bg-jade-500/20 text-jade-600 border border-jade-500/25",
    sky:"bg-sky-600 hover:bg-sky-500 text-white shadow-sm",
  };
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <i className="fa-solid fa-circle-notch animate-spin" />}
      {children}
    </button>
  );
}

export function Input({ className="", ...props }) {
  return <input {...props} className={`form-input ${className}`} />;
}

// Every call site in the app already uses this the way a native <select>
// works — <option> children, value, onChange={e => ...e.target.value}.
// Rather than touching every one of those call sites individually, this
// wrapper parses those <option> children into react-select's option
// shape and re-synthesizes a fake event on change, so react-select (with
// its search box, keyboard nav, and themed dark+green menu) now renders
// everywhere a <Select> is used, with zero other files changed.
export function Select({ className="", children, value, onChange, ...props }) {
  const options = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child) => ({
      value: child.props.value !== undefined ? child.props.value : child.props.children,
      label: child.props.children,
    }));
  return (
    <SelectField
      options={options}
      value={value}
      onChange={(v) => onChange && onChange({ target: { value: v } })}
      className={className}
      {...props}
    />
  );
}

export function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold dark:text-ink-500 text-ink-400 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-flame-500 ml-0.5">*</span>}
    </label>
  );
}

export function Badge({ children, color="slate" }) {
  const cls = { slate:"badge-slate", gold:"badge-gold", green:"badge-green", red:"badge-red" };
  return <span className={cls[color]}>{children}</span>;
}

export function StatCard({ label, value, sub, accent="gold", icon }) {
  const borders = { gold:"border-l-gold-500", green:"border-l-jade-500", red:"border-l-flame-500", slate:"border-l-ink-500" };
  const colors  = { gold:"text-gold-500", green:"text-jade-500", red:"text-flame-500", slate:"dark:text-ink-500 text-ink-400" };
  return (
    <div className={`stat-card border-l-4 ${borders[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="eyebrow">{label}</span>
        {icon && <i className={`${icon} text-base opacity-60 ${colors[accent]}`} />}
      </div>
      <p className="font-display text-2xl font-semibold dark:text-ink-50 text-ink-900">{value}</p>
      {sub && <p className="text-xs dark:text-ink-500 text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = React.useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  React.useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes:true, attributeFilter:["class"] });
    return () => obs.disconnect();
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  };
  return (
    <button onClick={toggle} title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative h-7 w-14 rounded-full transition-colors duration-300 focus:outline-none shrink-0"
      style={{ background: dark ? "#161c17" : "#cbd5e1" }}>
      <span className="absolute top-1 h-5 w-5 rounded-full shadow-md transition-transform duration-300 flex items-center justify-center"
        style={{ left:"4px", transform: dark ? "translateX(28px)" : "translateX(0)", background: dark ? "#f59e0b" : "#ffffff" }}>
        <i className={`fa-solid ${dark ? "fa-moon" : "fa-sun"} text-[10px] ${dark ? "text-ink-900" : "text-gold-500"}`} />
      </span>
    </button>
  );
}

export function Empty({ icon="fa-solid fa-inbox", title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-14 w-14 rounded-2xl dark:bg-white/[0.05] bg-ink-100 flex items-center justify-center mb-4">
        <i className={`${icon} text-xl dark:text-ink-600 text-ink-400`} />
      </div>
      <p className="font-semibold dark:text-ink-300 text-ink-600">{title}</p>
      {body && <p className="text-sm dark:text-ink-500 text-ink-400 mt-1 max-w-xs">{body}</p>}
    </div>
  );
}

export function Alert({ children, type="error" }) {
  const styles = {
    error:"bg-flame-500/10 border-flame-500/30 text-flame-400",
    success:"bg-jade-500/10 border-jade-500/30 text-jade-400",
    info:"bg-gold-500/10 border-gold-500/30 text-gold-500",
  };
  const icons = { error:"fa-solid fa-circle-exclamation", success:"fa-solid fa-circle-check", info:"fa-solid fa-circle-info" };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2.5 ${styles[type]}`}>
      <i className={`${icons[type]} mt-0.5 shrink-0`} /><span>{children}</span>
    </div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-6">
      <h1 className="font-editorial text-3xl font-bold dark:text-white text-ink-900">{children}</h1>
      {sub && <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}
