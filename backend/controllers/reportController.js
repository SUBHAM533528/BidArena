const Player = require("../models/Player");
const Team = require("../models/Team");
const Bid = require("../models/Bid");
const Tournament = require("../models/Tournament");
const PDFDocument = require("pdfkit");

/* ─── helpers ─────────────────────────────────────────────── */

// Dark theme colours
const C = {
  bg:      "#0c1322",
  card:    "#121b2e",
  border:  "#243454",
  gold:    "#f2b705",
  green:   "#2fb350",
  red:     "#e8313f",
  white:   "#f1f5f9",
  muted:   "#94a3b8",
  header:  "#1a2740",
};

function drawPageBg(doc) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);
}

function drawHeader(doc, title, subtitle) {
  // gold accent bar
  doc.rect(0, 0, doc.page.width, 80).fill(C.header);
  doc.rect(0, 78, doc.page.width, 4).fill(C.gold);

  doc.fillColor(C.gold).font("Helvetica-Bold").fontSize(22)
     .text("StrikeZone Auctions", 40, 22);
  doc.fillColor(C.muted).font("Helvetica").fontSize(9)
     .text(subtitle || new Date().toLocaleString(), 40, 50);

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(16)
     .text(title, 0, 22, { align: "right", width: doc.page.width - 40 });
}

function drawTableHeader(doc, y, cols) {
  doc.rect(40, y, doc.page.width - 80, 22).fill(C.gold);
  let x = 50;
  cols.forEach(({ label, width }) => {
    doc.fillColor(C.bg).font("Helvetica-Bold").fontSize(9)
       .text(label, x, y + 6, { width, ellipsis: true });
    x += width;
  });
  return y + 22;
}

function drawRow(doc, y, cols, values, odd) {
  doc.rect(40, y, doc.page.width - 80, 20).fill(odd ? C.card : C.header);
  doc.rect(40, y + 19, doc.page.width - 80, 1).fill(C.border);
  let x = 50;
  cols.forEach(({ width }, i) => {
    doc.fillColor(C.white).font("Helvetica").fontSize(8)
       .text(String(values[i] ?? "—"), x, y + 5, { width: width - 4, ellipsis: true });
    x += width;
  });
  return y + 20;
}

function newPage(doc) {
  doc.addPage();
  drawPageBg(doc);
}

function checkPage(doc, y, needed = 25) {
  if (y + needed > doc.page.height - 50) { newPage(doc); return 100; }
  return y;
}

/* ─── stat cards row ──────────────────────────────────────── */
function drawStatCards(doc, y, stats) {
  const cardW = (doc.page.width - 80 - (stats.length - 1) * 10) / stats.length;
  stats.forEach(({ label, value, color }, i) => {
    const cx = 40 + i * (cardW + 10);
    doc.rect(cx, y, cardW, 46).fill(C.card);
    doc.rect(cx, y, cardW, 3).fill(color || C.gold);
    doc.fillColor(color || C.gold).font("Helvetica-Bold").fontSize(16)
       .text(String(value), cx + 8, y + 8, { width: cardW - 16 });
    doc.fillColor(C.muted).font("Helvetica").fontSize(7)
       .text(label, cx + 8, y + 30, { width: cardW - 16 });
  });
  return y + 58;
}

/* ══════════════════════════════════════════════════════════════
   CONTROLLERS
══════════════════════════════════════════════════════════════ */

exports.getDashboardStats = async (req, res) => {
  const tournament = req.query.tournament;
  const filter = tournament ? { tournament } : {};

  const [totalTeams, totalPlayers, auctionPlayers, soldPlayers, unsoldPlayers] = await Promise.all([
    Team.countDocuments(filter),
    Player.countDocuments(filter),
    Player.countDocuments({ ...filter, auctionEligible: true }),
    Player.countDocuments({ ...filter, auctionStatus: "Sold" }),
    Player.countDocuments({ ...filter, auctionStatus: "Unsold" }),
  ]);

  const remainingPlayers = Math.max(0, auctionPlayers - soldPlayers - unsoldPlayers);

  const soldAgg = await Player.aggregate([
    { $match: { ...filter, auctionStatus: "Sold" } },
    { $group: { _id: null, total: { $sum: "$soldPrice" } } },
  ]);
  const totalAuctionValue = soldAgg[0]?.total || 0;

  const byRole = await Player.aggregate([
    { $match: { ...filter, auctionStatus: "Sold" } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  const teamSpending = await Team.find(filter)
    .select("name initialPurse remainingPurse logo squad");

  res.json({ totalTeams, totalPlayers, auctionPlayers, soldPlayers, unsoldPlayers,
             remainingPlayers, totalAuctionValue, soldByRole: byRole, teamSpending });
};

exports.getBidLogs = async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const bids = await Bid.find(filter)
    .populate("team", "name logo")
    .populate("player", "fullName")
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(bids);
};

/* ── CSV (quick export) ─────────────────────────────────── */
exports.exportSoldPlayersCSV = async (req, res) => {
  const filter = { auctionStatus: "Sold" };
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const players = await Player.find(filter).populate("soldTo", "name");
  let csv = "Player Name,Role,Base Price,Sold Price,Team\n";
  players.forEach((p) => {
    csv += `${p.fullName},${p.role},${p.basePrice},${p.soldPrice},${p.soldTo?.name || ""}\n`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=sold_players.csv");
  res.send(csv);
};

/* ══════════════════════════════════════════════════════════════
   PDF: ALL REGISTERED PLAYERS
══════════════════════════════════════════════════════════════ */
exports.pdfAllPlayers = async (req, res) => {
  const filter = {};
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const tournament = req.query.tournament
    ? await Tournament.findById(req.query.tournament)
    : null;

  const players = await Player.find(filter).sort({ createdAt: 1 });
  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=all_registered_players.pdf");
  doc.pipe(res);

  drawPageBg(doc);
  drawHeader(doc, "All Registered Players", tournament?.name);

  let y = drawStatCards(doc, 96, [
    { label: "Total Players", value: players.length, color: C.gold },
    { label: "Approved", value: players.filter(p => p.status === "Approved").length, color: C.green },
    { label: "Pending",  value: players.filter(p => p.status === "Pending").length,  color: "#f59e0b" },
    { label: "Rejected", value: players.filter(p => p.status === "Rejected").length, color: C.red },
  ]);

  const cols = [
    { label: "#",         width: 28  },
    { label: "Name",      width: 120 },
    { label: "Role",      width: 80  },
    { label: "District",  width: 80  },
    { label: "State",     width: 70  },
    { label: "Base Price",width: 70  },
    { label: "Status",    width: 65  },
  ];

  y = drawTableHeader(doc, y, cols);

  players.forEach((p, i) => {
    y = checkPage(doc, y);
    y = drawRow(doc, y, cols, [
      i + 1, p.fullName, p.role, p.district, p.state,
      `Rs.${p.basePrice?.toLocaleString()}`, p.status,
    ], i % 2 === 0);
  });

  doc.end();
};

/* ══════════════════════════════════════════════════════════════
   PDF: SOLD PLAYERS
══════════════════════════════════════════════════════════════ */
exports.pdfSoldPlayers = async (req, res) => {
  const filter = { auctionStatus: "Sold" };
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const tournament = req.query.tournament
    ? await Tournament.findById(req.query.tournament)
    : null;

  const players = await Player.find(filter).populate("soldTo", "name").sort({ soldPrice: -1 });
  const total = players.reduce((s, p) => s + (p.soldPrice || 0), 0);

  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=sold_players.pdf");
  doc.pipe(res);

  drawPageBg(doc);
  drawHeader(doc, "Sold Players Report", tournament?.name);

  let y = drawStatCards(doc, 96, [
    { label: "Total Sold",       value: players.length,                color: C.green },
    { label: "Total Value",      value: `Rs.${total.toLocaleString()}`,color: C.gold  },
    { label: "Highest Bid",      value: `Rs.${(players[0]?.soldPrice || 0).toLocaleString()}`, color: "#a78bfa" },
    { label: "Avg Sold Price",   value: players.length ? `Rs.${Math.round(total/players.length).toLocaleString()}` : "—", color: C.muted },
  ]);

  const cols = [
    { label: "#",           width: 28  },
    { label: "Player",      width: 120 },
    { label: "Role",        width: 72  },
    { label: "Base Price",  width: 72  },
    { label: "Sold Price",  width: 80  },
    { label: "Team",        width: 100 },
    { label: "Profit",      width: 65  },
  ];

  y = drawTableHeader(doc, y, cols);

  players.forEach((p, i) => {
    y = checkPage(doc, y);
    const profit = (p.soldPrice || 0) - (p.basePrice || 0);
    y = drawRow(doc, y, cols, [
      i + 1, p.fullName, p.role,
      `Rs.${p.basePrice?.toLocaleString()}`,
      `Rs.${p.soldPrice?.toLocaleString()}`,
      p.soldTo?.name || "—",
      `Rs.${profit.toLocaleString()}`,
    ], i % 2 === 0);
  });

  doc.end();
};

/* ══════════════════════════════════════════════════════════════
   PDF: UNSOLD PLAYERS
══════════════════════════════════════════════════════════════ */
exports.pdfUnsoldPlayers = async (req, res) => {
  const filter = { auctionStatus: "Unsold" };
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const tournament = req.query.tournament
    ? await Tournament.findById(req.query.tournament)
    : null;

  const players = await Player.find(filter).sort({ basePrice: -1 });

  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=unsold_players.pdf");
  doc.pipe(res);

  drawPageBg(doc);
  drawHeader(doc, "Unsold Players Report", tournament?.name);

  let y = drawStatCards(doc, 96, [
    { label: "Total Unsold",       value: players.length, color: C.red },
    { label: "Batsmen",            value: players.filter(p => p.role === "Batsman").length, color: C.gold },
    { label: "Bowlers",            value: players.filter(p => p.role === "Bowler").length, color: "#60a5fa" },
    { label: "All-Rounders / WK",  value: players.filter(p => ["All-Rounder","Wicket Keeper"].includes(p.role)).length, color: C.green },
  ]);

  const cols = [
    { label: "#",          width: 28  },
    { label: "Player",     width: 130 },
    { label: "Role",       width: 85  },
    { label: "Base Price", width: 85  },
    { label: "District",   width: 85  },
    { label: "State",      width: 120 },
  ];

  y = drawTableHeader(doc, y, cols);

  players.forEach((p, i) => {
    y = checkPage(doc, y);
    y = drawRow(doc, y, cols, [
      i + 1, p.fullName, p.role,
      `Rs.${p.basePrice?.toLocaleString()}`,
      p.district, p.state,
    ], i % 2 === 0);
  });

  doc.end();
};

/* ══════════════════════════════════════════════════════════════
   PDF: SINGLE TEAM SQUAD
══════════════════════════════════════════════════════════════ */
exports.pdfTeamSquad = async (req, res) => {
  const team = await Team.findById(req.params.teamId)
    .populate("squad.player");
  if (!team) return res.status(404).json({ message: "Team not found" });

  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition",
    `attachment; filename=${team.name.replace(/\s+/g, "_")}_squad.pdf`);
  doc.pipe(res);

  drawPageBg(doc);
  drawHeader(doc, `${team.name} — Squad`, "Team Player List");

  const spent = team.initialPurse - team.remainingPurse;

  let y = drawStatCards(doc, 96, [
    { label: "Players",         value: team.squad.length,                          color: C.gold },
    { label: "Max Players",     value: team.maxPlayers,                            color: C.muted },
    { label: "Amount Spent",    value: `Rs.${spent.toLocaleString()}`,             color: C.red },
    { label: "Remaining Purse", value: `Rs.${team.remainingPurse.toLocaleString()}`,color: C.green },
  ]);

  // Team info box
  doc.rect(40, y, doc.page.width - 80, 38).fill(C.header);
  doc.fillColor(C.gold).font("Helvetica-Bold").fontSize(11).text("Owner", 50, y + 6);
  doc.fillColor(C.white).font("Helvetica").fontSize(10).text(team.ownerName, 50, y + 20);
  doc.fillColor(C.gold).font("Helvetica-Bold").fontSize(11).text("Contact", 200, y + 6);
  doc.fillColor(C.white).font("Helvetica").fontSize(10).text(team.email, 200, y + 20);
  y += 50;

  const cols = [
    { label: "#",           width: 28  },
    { label: "Player Name", width: 140 },
    { label: "Role",        width: 90  },
    { label: "Batting",     width: 90  },
    { label: "Bowling",     width: 90  },
    { label: "Sold Price",  width: 95  },
  ];

  y = drawTableHeader(doc, y, cols);

  team.squad.forEach(({ player: p, soldPrice }, i) => {
    if (!p) return;
    y = checkPage(doc, y);
    y = drawRow(doc, y, cols, [
      i + 1, p.fullName, p.role,
      p.battingStyle || "—", p.bowlingStyle || "—",
      `Rs.${(soldPrice || 0).toLocaleString()}`,
    ], i % 2 === 0);
  });

  // total row
  if (team.squad.length) {
    y = checkPage(doc, y, 28);
    doc.rect(40, y, doc.page.width - 80, 24).fill(C.gold);
    doc.fillColor(C.bg).font("Helvetica-Bold").fontSize(9)
       .text(`TOTAL SPENT: Rs.${spent.toLocaleString()}`, 50, y + 7,
             { width: doc.page.width - 100, align: "right" });
    y += 28;
  }

  doc.end();
};

/* ══════════════════════════════════════════════════════════════
   PDF: ALL TEAMS (combined shareable doc, up to N teams)
══════════════════════════════════════════════════════════════ */
exports.pdfAllTeams = async (req, res) => {
  const filter = {};
  if (req.query.tournament) filter.tournament = req.query.tournament;
  const tournament = req.query.tournament
    ? await Tournament.findById(req.query.tournament)
    : null;

  const teams = await Team.find(filter).populate("squad.player").sort({ name: 1 });

  const doc = new PDFDocument({ margin: 0, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=all_teams_squads.pdf");
  doc.pipe(res);

  /* ── Cover Page ── */
  drawPageBg(doc);
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg);
  doc.rect(0, 0, doc.page.width, 6).fill(C.gold);
  doc.rect(0, doc.page.height - 6, doc.page.width, 6).fill(C.gold);

  doc.fillColor(C.gold).font("Helvetica-Bold").fontSize(32)
     .text("StrikeZone Auctions", 0, 180, { align: "center" });
  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(20)
     .text("All Team Squads", 0, 230, { align: "center" });
  if (tournament) {
    doc.fillColor(C.muted).font("Helvetica").fontSize(12)
       .text(tournament.name, 0, 265, { align: "center" });
  }
  doc.fillColor(C.muted).font("Helvetica").fontSize(10)
     .text(`Generated: ${new Date().toLocaleString()}`, 0, 295, { align: "center" });

  // summary table on cover
  const totalSpent = teams.reduce((s, t) => s + (t.initialPurse - t.remainingPurse), 0);
  const totalPlayers = teams.reduce((s, t) => s + t.squad.length, 0);

  doc.rect(80, 340, doc.page.width - 160, 180).fill(C.header);
  doc.rect(80, 340, doc.page.width - 160, 4).fill(C.gold);

  doc.fillColor(C.white).font("Helvetica-Bold").fontSize(12).text("Tournament Summary", 0, 356, { align: "center" });

  const summaryY = 380;
  teams.forEach((t, i) => {
    const ry = summaryY + i * 18;
    if (ry > 490) return; // cap at 6 teams on cover (rest on squad pages)
    const spent = t.initialPurse - t.remainingPurse;
    doc.fillColor(C.muted).font("Helvetica").fontSize(9)
       .text(`${i+1}. ${t.name}`, 100, ry, { width: 180 });
    doc.fillColor(C.white).fontSize(9)
       .text(`${t.squad.length} players`, 280, ry, { width: 80 });
    doc.fillColor(C.gold).fontSize(9)
       .text(`Rs.${spent.toLocaleString()}`, 360, ry, { width: 120, align: "right" });
  });

  doc.fillColor(C.gold).font("Helvetica-Bold").fontSize(10)
     .text(`Total Players Sold: ${totalPlayers}    Total Auction Value: Rs.${totalSpent.toLocaleString()}`,
           0, 510, { align: "center" });

  /* ── One page per team ── */
  const cols = [
    { label: "#",           width: 28  },
    { label: "Player Name", width: 140 },
    { label: "Role",        width: 88  },
    { label: "Batting",     width: 88  },
    { label: "Bowling",     width: 88  },
    { label: "Sold Price",  width: 95  },
  ];

  teams.forEach((team) => {
    newPage(doc);
    drawHeader(doc, `${team.name}`, tournament?.name || "Squad List");

    const spent = team.initialPurse - team.remainingPurse;
    let y = drawStatCards(doc, 96, [
      { label: "Players",          value: team.squad.length,                           color: C.gold  },
      { label: "Max Players",      value: team.maxPlayers,                             color: C.muted },
      { label: "Amount Spent",     value: `Rs.${spent.toLocaleString()}`,              color: C.red   },
      { label: "Remaining Purse",  value: `Rs.${team.remainingPurse.toLocaleString()}`,color: C.green },
    ]);

    // owner info
    doc.rect(40, y, doc.page.width - 80, 30).fill(C.header);
    doc.fillColor(C.muted).font("Helvetica").fontSize(8).text("Owner:", 50, y + 5);
    doc.fillColor(C.white).font("Helvetica-Bold").fontSize(9).text(team.ownerName, 50, y + 16);
    doc.fillColor(C.muted).font("Helvetica").fontSize(8).text("Contact:", 220, y + 5);
    doc.fillColor(C.white).font("Helvetica").fontSize(9).text(team.email, 220, y + 16);
    y += 42;

    y = drawTableHeader(doc, y, cols);

    if (team.squad.length === 0) {
      doc.fillColor(C.muted).font("Helvetica").fontSize(10)
         .text("No players purchased yet.", 40, y + 10);
    } else {
      team.squad.forEach(({ player: p, soldPrice }, i) => {
        if (!p) return;
        y = checkPage(doc, y);
        y = drawRow(doc, y, cols, [
          i + 1, p.fullName, p.role,
          p.battingStyle || "—", p.bowlingStyle || "—",
          `Rs.${(soldPrice || 0).toLocaleString()}`,
        ], i % 2 === 0);
      });

      // total
      y = checkPage(doc, y, 28);
      doc.rect(40, y, doc.page.width - 80, 24).fill(C.gold);
      doc.fillColor(C.bg).font("Helvetica-Bold").fontSize(9)
         .text(`TOTAL SPENT: Rs.${spent.toLocaleString()}`, 50, y + 7,
               { width: doc.page.width - 100, align: "right" });
    }
  });

  doc.end();
};
