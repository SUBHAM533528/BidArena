import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Label, Button, Alert } from "../components/UI";
import SEO from "../components/SEO";
import StadiumBg from "../components/StadiumBg";
export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [f, setF] = useState({ email:"", password:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("expired")) {
      setErr("Your session expired — please sign in again.");
    }
  }, [params]);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { const u = await login(f.email, f.password); if (u.role !== "super_admin") { setErr("Admin access only."); return; } navigate("/admin"); }
    catch (e) { setErr(e.response?.data?.message || "Invalid credentials"); }
    finally { setLoading(false); }
  };



  
  return (
    <div className="dark min-h-screen dark:bg-[#0a0d0a] bg-ink-50 flex items-center justify-center px-4 transition-colors">
      <SEO title="Admin Login" description="BidArena Auctions admin panel." noIndex={true} />
      <StadiumBg opacity={0.85} dark/>
      <div className="w-full max-w-[380px] animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-500/20 mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="font-editorial text-3xl font-bold dark:text-white text-ink-900">Admin Login</h1>
          <p className="text-sm dark:text-ink-500 text-ink-400 mt-1">BidArena Control Center</p>
        </div>
        <div className="dark:bg-white/[0.03] bg-white rounded-2xl border dark:border-white/[0.08] border-ink-200 shadow-card-light dark:shadow-card-dark p-6">
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Email Address</Label><Input type="email" required autoFocus placeholder="Enter Your Mail" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></div>
            <div><Label>Password</Label>
              <div className="relative">
                <Input type={show?"text":"password"} required placeholder="Enter Your Password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="pr-16"/>
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-semibold dark:text-ink-500 text-ink-400 hover:text-gold-500 transition uppercase tracking-wide">{show?"Hide":"Show"}</button>
              </div>
            </div>
            {err && <Alert type="error">{err}</Alert>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading?"Signing in…":"Sign in to Admin"}</Button>
          </form>
          <div className="mt-5 pt-5 border-t dark:border-white/[0.06] border-ink-100 text-sm text-center space-y-2">
            <p className="dark:text-ink-500 text-ink-400">Not an admin? </p>
            <Link to="/" className="text-2xs dark:text-ink-600 text-ink-400 hover:text-gold-500 transition block">Back to Home</Link>
          </div>
        </div>
        
      </div>
    </div>
  );
}
