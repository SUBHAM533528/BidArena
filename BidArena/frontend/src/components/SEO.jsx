import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_NAME    = "BidArena";
const SITE_URL     = "https://yourdomain.com";   // ← change to your actual domain
const DEFAULT_IMG  = `${SITE_URL}/og-default.png`;
const TWITTER_HANDLE = "@StrikeZoneAuctions";


export default function SEO({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
  jsonLd,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const metaDesc  = description || "IPL-style cricket auction platform — live bidding, team management, player registration and real-time auction broadcasts.";
  const metaImg   = image || DEFAULT_IMG;
  const canonical = url   || SITE_URL;

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta name="keywords"    content="cricket auction, IPL auction, player auction, cricket tournament, live bidding, cricket team management" />
      <link rel="canonical"    href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* ── Open Graph (Facebook, WhatsApp, LinkedIn) ── */}
      <meta property="og:type"        content={type} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image"       content={metaImg} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height"content="630" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_IN" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content={TWITTER_HANDLE} />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={metaImg} />

      {/* ── Structured Data (JSON-LD) ── */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/* ── Pre-built JSON-LD builders for common use cases ── */

export function buildSportsEventSchema(tournament) {
  if (!tournament) return null;
  return {
    "@context":  "https://schema.org",
    "@type":     "SportsEvent",
    name:        tournament.name,
    description: tournament.description || "Cricket Tournament Auction",
    startDate:   tournament.startDate,
    endDate:     tournament.endDate,
    location: {
      "@type": "Place",
      name:    tournament.venue || "Venue TBA",
    },
    organizer: {
      "@type": "Organization",
      name:    SITE_NAME,
      url:     SITE_URL,
    },
    url: SITE_URL,
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type":    "Organization",
    name:       SITE_NAME,
    url:        SITE_URL,
    logo:       DEFAULT_IMG,
    sameAs:     [],
  };
}

export function buildBreadcrumbSchema(crumbs) {
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      c.name,
      item:      `${SITE_URL}${c.path}`,
    })),
  };
}
