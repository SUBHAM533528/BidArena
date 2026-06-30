import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Input, Label, Button, Alert } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current:"", next:"", confirm:"" });
  const [msg, setMsg]   = useState({ text:"", ok:false });
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState({ current:false, next:false });

  const rules = [
    { label:"At least 6 characters",    ok: form.next.length >= 6 },
    { label:"Contains a number",         ok: /\d/.test(form.next) },
    { label:"Passwords match",           ok: form.next === form.confirm && form.confirm.length > 0 },
    { label:"Different from current",    ok: form.next !== form.current && form.next.length > 0 },
  ];

  const submit = async (e) => {
    e.preventDefault(); setMsg({ text:"", ok:false });
    if (!rules.every(r=>r.ok)) { setMsg({ text:"Please meet all requirements", ok:false }); return; }
    setLoading(true);
    try {
      await api.put("/auth/change-password", { currentPassword:form.current, newPassword:form.next });
      setMsg({ text:"Password updated successfully ✓", ok:true });
      setForm({ current:"", next:"", confirm:"" });
      setTimeout(() => navigate("/admin/settings"), 2000);
    } catch(err) {
      setMsg({ text: err.response?.data?.message || "Failed — check your current password", ok:false });
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-8">
        <p className="eyebrow mb-1.5">Security</p>
        <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Change Password</h1>
        <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Logged in as {user?.email}</p>
      </div>

      <div className="max-w-lg">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b dark:border-ink-800 border-ink-100">
            <div className="h-12 w-12 rounded-xl dark:bg-ink-800 bg-ink-100 border dark:border-ink-700 border-ink-200 flex items-center justify-center text-xl">🔐</div>
            <div>
              <p className="font-semibold dark:text-ink-200 text-ink-800">Admin Password</p>
              <p className="text-xs dark:text-ink-500 text-ink-400 mt-0.5">Choose a strong password. There is no "forgot password" option.</p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Current */}
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={show.current?"text":"password"} required placeholder="Your current password"
                  value={form.current} onChange={e=>setForm({...form,current:e.target.value})} className="pr-14"/>
                <button type="button" onClick={()=>setShow({...show,current:!show.current})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-500 transition uppercase tracking-wide">
                  {show.current?"Hide":"Show"}
                </button>
              </div>
            </div>
            {/* New */}
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <Input type={show.next?"text":"password"} required placeholder="New password"
                  value={form.next} onChange={e=>setForm({...form,next:e.target.value})} className="pr-14"/>
                <button type="button" onClick={()=>setShow({...show,next:!show.next})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-500 transition uppercase tracking-wide">
                  {show.next?"Hide":"Show"}
                </button>
              </div>
            </div>
            {/* Confirm */}
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" required placeholder="Re-enter new password"
                value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/>
            </div>

            {/* Password rules */}
            {form.next.length > 0 && (
              <div className="card-inset rounded-xl p-4 space-y-2">
                {rules.map(r => (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <div className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${r.ok ? "bg-jade-500 text-white" : "dark:bg-ink-700 bg-ink-200 dark:text-ink-600 text-ink-400"}`}>
                      {r.ok ? "✓" : ""}
                    </div>
                    <span className={`text-xs transition-colors ${r.ok ? "dark:text-jade-400 text-jade-600" : "dark:text-ink-500 text-ink-400"}`}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}

            {msg.text && <Alert type={msg.ok?"success":"error"}>{msg.text}</Alert>}

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={loading || !rules.every(r=>r.ok) || !form.current}>
                {loading ? "Updating…" : "Update Password"}
              </Button>
              <Button type="button" variant="ghost" onClick={()=>navigate("/admin/settings")}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
