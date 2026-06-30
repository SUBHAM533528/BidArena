import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, Input, Label, Button } from "../components/UI";

// Dedicated Team Owner registration route.
// Player signup lives at /player-registration (full cricket profile form).
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", mobile: "", role: "team_owner" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium-950 bg-stadium-glow flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <p className="font-display text-2xl text-floodlight-400 mb-1">Team Owner Registration</p>
        <p className="text-slate-400 text-sm mb-6">
          Create a Team Owner account to manage your squad and watch the live auction.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Mobile Number</Label>
            <Input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="text-crimson-400 text-sm">{error}</p>}

        </form>
        <p className="text-sm text-slate-500 mt-5 text-center">
          Already have an account? <Link to="/login" className="text-floodlight-400">Login</Link>
        </p>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Want to play in the tournament instead? <Link to="/player-registration" className="text-floodlight-400">Register as a Player</Link>
        </p>
      </Card>
    </div>
  );
}
