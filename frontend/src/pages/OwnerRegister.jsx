import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Label, Button, Alert, ThemeToggle } from "../components/UI";
import StadiumBg from "../components/StadiumBg";
export default function OwnerRegister() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ name:"", email:"", mobile:"", password:"", confirm:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (f.password !== f.confirm) { setErr("Passwords do not match"); return; }
    if (f.password.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setLoading(true);
    try { await register({ name:f.name, email:f.email, mobile:f.mobile, password:f.password, role:"team_owner" }); navigate("/owner/login"); }
    catch (e) { setErr(e.response?.data?.message || "Registration failed"); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 flex items-center justify-center px-4 py-10 transition-colors">
      <StadiumBg opacity={0.2}/>
      <div className="absolute top-4 right-4"><ThemeToggle/></div>
      <div className="w-full max-w-[420px] animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4"><span className="text-2xl">🛡️</span></div>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Create Account</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Register as a Team Owner</p>
        </div>
        <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 shadow-card-dark p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Full Name</Label><Input required placeholder="Your full name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></div>
              <div><Label>Email</Label><Input type="email" required placeholder="you@email.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
              <div><Label>Mobile</Label><Input required placeholder="+91 98765…" value={f.mobile} onChange={e=>setF({...f,mobile:e.target.value})}/></div>
              <div><Label>Password</Label><Input type="password" required placeholder="Min 6 chars" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></div>
              <div><Label>Confirm</Label><Input type="password" required placeholder="Re-enter" value={f.confirm} onChange={e=>setF({...f,confirm:e.target.value})}/></div>
            </div>
            {err && <Alert type="error">{err}</Alert>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading?"Creating…":"Create Account"}</Button>
          </form>
          <div className="mt-5 pt-5 border-t dark:border-ink-800 border-ink-100 text-sm text-center space-y-2">
            <p className="dark:text-ink-500 text-ink-400">Have an account? <Link to="/owner/login" className="text-gold-500 hover:text-gold-400 font-semibold">Sign in</Link></p>
            <Link to="/player-registration" className="text-2xs dark:text-ink-600 text-ink-400 hover:text-gold-500 transition block">Register as a Player instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
