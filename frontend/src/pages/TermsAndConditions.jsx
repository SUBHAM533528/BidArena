import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import StadiumBg from "../components/StadiumBg";
import PaintBg from "../components/PaintBg";
import SEO from "../components/SEO";

const FALLBACK = `These Terms & Conditions govern participation in the auction and tournament(s) run on this platform.

1. Registration — Player and team information submitted during registration must be accurate. The organizers reserve the right to reject or remove any registration that violates tournament rules.

2. Auction Conduct — All bids placed during the live auction are final once accepted. Team owners are responsible for staying within their allotted purse.

3. Player Eligibility — Players must meet any age, location, or eligibility criteria set by the organizers for a given tournament.

4. Media & Photography — Photos and videos captured during registration, auction, or match days may be used for promotional purposes on this platform.

5. Changes — The organizers may update tournament rules, schedules, or these terms at any time; the latest version on this page always applies.

For any questions about these terms, please use the Contact Us section on the home page.`;

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/content/terms")
      .then((r) => setContent(r.data?.content || ""))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d0a] px-4 py-8 md:py-12 relative text-ink-100">
      <SEO title="Terms & Conditions" description="Terms and conditions for registration and participation." />
      <StadiumBg opacity={0.15} />

      <div className="max-w-3xl mx-auto relative">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Close"
          className="absolute top-3 right-3 sm:-top-3 sm:-right-3 z-20 h-9 w-9 rounded-full flex items-center justify-center text-flame-600 bg-green-500 border-flame-600/10"
        >
          <i className="fa-solid fa-xmark text-sm" />
        </button>

        <section className="relative rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-white/[0.02] p-6 sm:p-10">
          <PaintBg />
          <div className="relative z-10">
            <p className="text-2xs font-semibold uppercase tracking-widest text-gold-400 mb-2">Legal</p>
            <h1 className="font-display text-3xl font-bold text-white mb-6">Terms &amp; Conditions</h1>
            {loading ? (
              <p className="text-ink-500 text-sm">Loading…</p>
            ) : (
              <div className="text-sm text-ink-300 leading-relaxed whitespace-pre-line">
                {content || FALLBACK}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
