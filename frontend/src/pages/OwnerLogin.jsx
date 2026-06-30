import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Label, Button, Alert, ThemeToggle } from "../components/UI";
import StadiumBg from "../components/StadiumBg";
export default function OwnerLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const u = await login(f.email, f.password); if (u.role==="super_admin") navigate("/admin"); else if (u.role==="team_owner") navigate("/"); else setErr("Team Owners only."); }
    catch (e) { setErr(e.response?.data?.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen dark:bg-ink-900 bg-ink-50 flex items-center justify-center px-4 transition-colors">
      <StadiumBg opacity={0.2}/>
      <div className="absolute top-4 right-4"><ThemeToggle/></div>
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4"><span className="text-2xl">🛡️</span></div>
          <h1 className="font-display text-3xl font-bold dark:text-white text-ink-900">Team Owner Login</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">Manage your team and watch the live auction</p>
        </div>
        <div className="dark:bg-ink-850 bg-white rounded-2xl border dark:border-ink-700 border-ink-200 shadow-card-dark p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Email Address</Label><Input type="email" required autoFocus placeholder="owner@team.com" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
            <div><Label>Password</Label>
              <div className="relative">
                <Input type={show?"text":"password"} required placeholder="••••••••" value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="pr-16"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-500 transition uppercase tracking-wide">{show?"Hide":"Show"}</button>
              </div>
            </div>
            {err && <Alert type="error">{err}</Alert>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading?"Signing in…":"Sign in"}</Button>
          </form>
          <div className="mt-5 pt-5 border-t dark:border-ink-800 border-ink-100 text-sm text-center space-y-2">
            <p className="dark:text-ink-500 text-ink-400">No account? <Link to="/owner/register" className="text-gold-500 hover:text-gold-400 font-semibold">Register as Owner</Link></p>
            <Link to="/" className="text-2xs dark:text-ink-600 text-ink-400 hover:text-gold-500 transition block">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
