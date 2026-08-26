import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Input, Label, Button } from "../components/UI";
import SelectField from "../components/SelectField";
import StadiumBg from "../components/StadiumBg";
import SEO from "../components/SEO";

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
};

export default function PlayerRegistration() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [idProof, setIdProof] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const photoInputRef = useRef(null);

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

  // Revoke the object URL when the photo changes/unmounts so it doesn't leak memory
  useEffect(() => {
    if (!photo) { setPhotoPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

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

  const ROLE_OPTIONS = ["Batsman", "Bowler", "All-Rounder", "Wicket Keeper"];

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (roleConf.hasBatting && !form.battingStyle) {
      setError("Please select your batting style.");
      return;
    }
    if (roleConf.hasBowling && !form.bowlingStyle) {
      setError("Please select your bowling style.");
      return;
    }

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
      <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center px-4 relative">
        <StadiumBg opacity={0.2} />
        <div className="card max-w-md text-center p-8 relative z-10">
          <p className="text-6xl mb-4">🏏🚫</p>
          <h1 className="font-display text-2xl text-jade-400 mb-2">
            {tournament.closedMessage || "Player Registration is Currently Closed"}
          </h1>
          <p className="text-ink-400 text-sm mb-4">Registrations will reopen as per the schedule.</p>
          <p className="text-ink-500 text-xs">{tournament.contactDetails}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center px-4 relative">
        <StadiumBg opacity={0.2} />
        <div className="card max-w-md text-center p-8 relative z-10">
          <p className="text-6xl mb-4">✅</p>
          <h1 className="font-display text-2xl text-jade-400 mb-2">Registration Submitted!</h1>
          <p className="text-ink-400 text-sm">Your profile is pending admin review. You'll be contacted once approved for the auction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0d0a] px-4 py-8 md:py-12 relative">
      <SEO title="Player Registration" description="Register as a player for the auction." />
      <StadiumBg opacity={0.15} />

      <div className="max-w-4xl mx-auto relative">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Close registration form"
          className="absolute -top-2 -right-2 sm:top-3 sm:right-3 z-20 h-9 w-9 rounded-full flex items-center justify-center  text-ink-400 hover:text-flame-400 hover:bg-flame-500/10 hover:border-flame-500/30 transition"
        > 
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        <div className="rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] grid md:grid-cols-[300px_1fr]">

          {/* ── LEFT: photo panel ── */}
          <div className="bg-gradient-to-b from-jade-900/25 via-[#070c09] to-[#050805] p-8 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-white/[0.08] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 30% 20%, #22c55e 0%, transparent 60%)" }} />

            

            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="relative z-10 h-40 w-40 rounded-full border-2 border-dashed border-jade-500/40 hover:border-jade-400/70 bg-white/[0.03] hover:bg-white/[0.05] flex items-center justify-center overflow-hidden transition group mb-4 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Your photo preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-jade-500/70 group-hover:text-jade-400 transition">
                  <i className="fa-solid fa-camera text-2xl" />
                  <span className="text-2xs font-semibold uppercase tracking-wide px-4">Upload Photo</span>
                </div>
              )}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files[0] || null)}
            />

            {photoPreview && (
              <button type="button" onClick={() => photoInputRef.current?.click()}
                className="relative z-10 text-2xs font-semibold text-jade-400 hover:text-jade-300 transition mb-2">
                Change photo
              </button>
            )}

            <p className="relative z-10 text-xl text-left text-ink-500 leading-relaxed max-w-[180px] mt-2">
              A clear, front-facing photo helps team owners recognize you during the live auction.
            </p>

            {form.fullName && (
              <div className="relative z-10 mt-6 pt-6 border-t border-white/[0.08] w-full">
                <p className="font-display font-bold text-white truncate">{form.fullName}</p>
                <p className="text-2xs text-jade-400 uppercase tracking-wide mt-1">{form.role}</p>
              </div>
            )}
          </div>

          {/* ── RIGHT: form panel ── */}
          <div className="bg-white/[0.02] p-6 sm:p-8">
            <div className="flex items-start justify-between mb-6 gap-3">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">Player Registration</h1>
                <p className="text-jade-400 text-sm mt-1">{tournament?.name}</p>
              </div>
              {tournaments.length > 1 && (
                <div className="w-44 mt-5 shrink-0">
                  <SelectField
                    options={tournaments.map((t) => ({ value: t._id, label: t.name }))}
                    value={tournamentId}
                    onChange={handleTournamentChange}
                    isSearchable={false}
                  />
                </div>
              )}
            </div>

            <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
              {/* ── Personal Details ── */}
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-widest text-jade-500 font-semibold mb-3 border-b border-white/[0.08] pb-1.5">Personal Details</p>
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

              {/* ── Cricket Profile ── */}
              <div className="sm:col-span-2 mt-2">
                <p className="text-xs uppercase tracking-widest text-jade-500 font-semibold mb-3 border-b border-white/[0.08] pb-1.5">Cricket Profile</p>
              </div>

              <div>
                <Label>Playing Role *</Label>
                <SelectField
                  options={ROLE_OPTIONS}
                  value={form.role}
                  onChange={handleRoleChange}
                  isSearchable={false}
                />
              </div>

              {/* Batting style — shown for Batsman, All-Rounder, WK */}
              {roleConf.hasBatting && (
                <div>
                  <Label>Batting Style *</Label>
                  <SelectField
                    options={BATTING_STYLES}
                    value={form.battingStyle}
                    onChange={(v) => setForm({ ...form, battingStyle: v })}
                    placeholder="Select batting style"
                    isSearchable={false}
                  />
                </div>
              )}

              {/* Bowling style — shown for Bowler and All-Rounder */}
              {roleConf.hasBowling && (
                <div>
                  <Label>Bowling Style *</Label>
                  <SelectField
                    options={BOWLING_STYLES}
                    value={form.bowlingStyle}
                    onChange={(v) => setForm({ ...form, bowlingStyle: v })}
                    placeholder="Select bowling style"
                  />
                </div>
              )}

              {/* Wicket Keeper gloves note */}
              {form.role === "Wicket Keeper" && (
                <div className="sm:col-span-2 bg-jade-500/10 border border-jade-500/20 rounded-lg px-3 py-2 text-xs text-jade-400">
                  Wicket Keeper — glove side follows batting hand automatically
                </div>
              )}

             

              {error && <p className="text-flame-400 text-sm sm:col-span-2">{error}</p>}

              <Button type="submit" variant="jade" className="sm:col-span-2" disabled={loading || !tournamentId}>
                {loading ? "Submitting..." : "Submit Registration"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
