import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Card, Input, Label, Select, Button } from "../components/UI";
import StadiumBg from "../components/StadiumBg";

// Role-aware options so players don't type styles manually
const BATTING_STYLES = ["Right-hand Bat", "Left-hand Bat"];
const BOWLING_STYLES = [
  "Right-arm Fast", "Right-arm Fast-medium", "Right-arm Medium",
  "Right-arm Off-break", "Right-arm Leg-break",
  "Left-arm Fast", "Left-arm Fast-medium", "Left-arm Medium",
  "Left-arm Orthodox", "Left-arm Wrist-spin",
];

// Which fields are relevant per role
const ROLE_CONFIG = {
  Batsman:       { hasBatting: true,  hasBowling: false },
  Bowler:        { hasBatting: false, hasBowling: true  },
  "All-Rounder": { hasBatting: true,  hasBowling: true  },
  "Wicket Keeper":{ hasBatting: true, hasBowling: false },
};

const initialForm = {
  fullName: "", mobile: "", email: "", dob: "",
  role: "Batsman", battingStyle: "", bowlingStyle: "",
  district: "", state: "", experience: "",
  previousTeams: "", matchesPlayed: "", runs: "", wickets: "",
  basePrice: "",
};

export default function PlayerRegistration() {
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/tournaments").then((res) => {
      setTournaments(res.data);
      const active = res.data.find((t) => t.isActive) || res.data[0];
      if (active) {
        setTournamentId(active._id);
        setForm((f) => ({ ...f, basePrice: active.defaultBasePrice?.toString() || "100000" }));
      }
    });
  }, []);

  const tournament = tournaments.find((t) => t._id === tournamentId);
  const roleConf = ROLE_CONFIG[form.role] || { hasBatting: true, hasBowling: true };

  // When role changes, reset irrelevant style fields
  const handleRoleChange = (role) => {
    const conf = ROLE_CONFIG[role] || {};
    setForm((f) => ({
      ...f,
      role,
      battingStyle: conf.hasBatting ? f.battingStyle : "",
      bowlingStyle: conf.hasBowling ? f.bowlingStyle : "",
    }));
  };

  // When tournament changes, update default base price
  const handleTournamentChange = (id) => {
    setTournamentId(id);
    const t = tournaments.find((t) => t._id === id);
    if (t?.defaultBasePrice) setForm((f) => ({ ...f, basePrice: t.defaultBasePrice.toString() }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("tournament", tournamentId);
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photo) fd.append("photo", photo);
      if (idProof) fd.append("idProof", idProof);
      await api.post("/players/register", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!tournament && tournaments.length > 0) return null;

  if (tournament && !tournament.registrationOpen) {
    return (
      <div className="min-h-screen bg-stadium-950 flex items-center justify-center px-4 relative">
      <StadiumBg />
        <Card className="max-w-md text-center">
          <p className="text-6xl mb-4">🏏🚫</p>
          <h1 className="font-display text-2xl text-floodlight-400 mb-2">
            {tournament.closedMessage || "Player Registration is Currently Closed"}
          </h1>
          <p className="text-slate-400 text-sm mb-4">Registrations will reopen as per the schedule.</p>
          <p className="text-slate-500 text-xs">{tournament.contactDetails}</p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stadium-950 flex items-center justify-center px-4 relative">
      <StadiumBg />
        <Card className="max-w-md text-center">
          <p className="text-6xl mb-4">✅</p>
          <h1 className="font-display text-2xl text-pitch-400 mb-2">Registration Submitted!</h1>
          <p className="text-slate-400 text-sm">Your profile is pending admin review. You'll be contacted once approved for the auction.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-950 px-4 py-8 md:py-12 relative">
      <StadiumBg />
      <Card className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-floodlight-400">Player Registration</h1>
            <p className="text-slate-400 text-sm mt-1">{tournament?.name}</p>
          </div>
          {tournaments.length > 1 && (
            <Select value={tournamentId} onChange={(e) => handleTournamentChange(e.target.value)} className="w-48">
              {tournaments.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </Select>
          )}
        </div>

        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          {/* ── Personal Details ── */}
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-stadium-700 pb-1">Personal Details</p>
          </div>
          <div className="sm:col-span-2">
            <Label>Full Name *</Label>
            <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <Label>Mobile Number *</Label>
            <Input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div>
            <Label>Email *</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Date of Birth *</Label>
            <Input type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          </div>
          <div>
            <Label>District *</Label>
            <Input required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </div>
          <div>
            <Label>State *</Label>
            <Input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>

          {/* ── Cricket Profile ── */}
          <div className="sm:col-span-2 mt-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-stadium-700 pb-1">Cricket Profile</p>
          </div>

          <div>
            <Label>Playing Role *</Label>
            <Select value={form.role} onChange={(e) => handleRoleChange(e.target.value)}>
              <option>Batsman</option>
              <option>Bowler</option>
              <option>All-Rounder</option>
              <option>Wicket Keeper</option>
            </Select>
          </div>

          {/* Batting style — shown for Batsman, All-Rounder, WK */}
          {roleConf.hasBatting && (
            <div>
              <Label>Batting Style *</Label>
              <Select
                value={form.battingStyle}
                onChange={(e) => setForm({ ...form, battingStyle: e.target.value })}
                required
              >
                <option value="">Select batting style</option>
                {BATTING_STYLES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
          )}

          {/* Bowling style — shown for Bowler and All-Rounder */}
          {roleConf.hasBowling && (
            <div>
              <Label>Bowling Style *</Label>
              <Select
                value={form.bowlingStyle}
                onChange={(e) => setForm({ ...form, bowlingStyle: e.target.value })}
                required
              >
                <option value="">Select bowling style</option>
                {BOWLING_STYLES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
          )}

          {/* Wicket Keeper gloves note */}
          {form.role === "Wicket Keeper" && (
            <div className="glass rounded-lg px-3 py-2 text-xs text-floodlight-400">
              🧤 Wicket Keeper — glove side follows batting hand automatically
            </div>
          )}

          <div>
            <Label>Experience (years)</Label>
            <Input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          </div>
          <div>
            <Label>Previous Teams</Label>
            <Input placeholder="e.g. City XI, College A" value={form.previousTeams} onChange={(e) => setForm({ ...form, previousTeams: e.target.value })} />
          </div>

          {/* ── Statistics ── */}
          <div className="sm:col-span-2 mt-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-stadium-700 pb-1">Career Statistics</p>
          </div>

          <div>
            <Label>Matches Played</Label>
            <Input type="number" min="0" value={form.matchesPlayed} onChange={(e) => setForm({ ...form, matchesPlayed: e.target.value })} />
          </div>
          {roleConf.hasBatting && (
            <div>
              <Label>Runs Scored</Label>
              <Input type="number" min="0" value={form.runs} onChange={(e) => setForm({ ...form, runs: e.target.value })} />
            </div>
          )}
          {roleConf.hasBowling && (
            <div>
              <Label>Wickets Taken</Label>
              <Input type="number" min="0" value={form.wickets} onChange={(e) => setForm({ ...form, wickets: e.target.value })} />
            </div>
          )}

          <div>
            <Label>
              Base Price (₹)
              {tournament?.defaultBasePrice && <span className="text-slate-500 ml-1 text-xs">— default: ₹{tournament.defaultBasePrice.toLocaleString()}</span>}
            </Label>
            <Input
              type="number"
              min="0"
              required
              value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
            />
          </div>

          {/* ── Uploads ── */}
          <div className="sm:col-span-2 mt-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 border-b border-stadium-700 pb-1">Documents</p>
          </div>
          <div>
            <Label>Profile Photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
          </div>
          <div>
            <Label>ID Proof (image or PDF)</Label>
            <Input type="file" accept="image/*,application/pdf" onChange={(e) => setIdProof(e.target.files[0])} />
          </div>

          {error && <p className="text-crimson-400 text-sm sm:col-span-2">{error}</p>}

          <Button type="submit" className="sm:col-span-2" disabled={loading || !tournamentId}>
            {loading ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
