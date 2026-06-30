import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Label, Button } from "../components/UI";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === "super_admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium-950 bg-stadium-glow flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <p className="font-display text-2xl text-floodlight-400 mb-1">StrikeZone</p>
        <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="text-crimson-400 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
        <p className="text-sm text-slate-500 mt-5 text-center">
          New here? <Link to="/register" className="text-floodlight-400">Create an account</Link>
        </p>
        <p className="text-xs text-slate-600 mt-2 text-center">
          <Link to="/" className="hover:text-slate-400">← Back to home</Link>
        </p>
      </Card>
    </div>
  );
}
