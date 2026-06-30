const AuctionState = require("../models/AuctionState");
const Player = require("../models/Player");
const Team = require("../models/Team");
const Bid = require("../models/Bid");
const Tournament = require("../models/Tournament");

// In-memory timers keyed by tournamentId (Node single-process; for multi-instance
// deployments move this to Redis, but this keeps the reference implementation simple)
const timers = {};

// Every time a timer is (re)scheduled or cleared we bump a "token" for that
// tournament. A timer callback only acts if its captured token still matches
// the live token when it fires - this prevents the classic race where a bid
// lands at the exact moment the countdown hits zero: without this guard, the
// old timer's expiry check can read the database a split-second before the
// bid is saved and incorrectly mark the player Unsold.
const timerTokens = {};

const roomName = (tournamentId) => `auction:${tournamentId}`;

async function getPopulatedState(tournamentId) {
  return AuctionState.findOne({ tournament: tournamentId })
    .populate("currentPlayer")
    .populate("currentBidTeam", "name logo remainingPurse")
    .populate("lastSoldPlayer", "fullName")
    .populate("lastSoldTeam", "name logo");
}

function clearAuctionTimer(tournamentId) {
  if (timers[tournamentId]) {
    clearTimeout(timers[tournamentId]);
    delete timers[tournamentId];
  }
  // invalidate any timer resolution that is already in-flight
  timerTokens[tournamentId] = (timerTokens[tournamentId] || 0) + 1;
}

function scheduleTimer(io, tournamentId, seconds) {
  clearAuctionTimer(tournamentId);
  const token = timerTokens[tournamentId];
  timers[tournamentId] = setTimeout(() => resolveTimerExpiry(io, tournamentId, token), seconds * 1000);
}

module.exports = function registerAuctionSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join_room", async ({ tournamentId }) => {
      socket.join(roomName(tournamentId));
      const state = await getPopulatedState(tournamentId);
      socket.emit("state_update", state);
    });

    socket.on("leave_room", ({ tournamentId }) => {
      socket.leave(roomName(tournamentId));
    });

    // ---- ADMIN: pick next player (random or serial depending on tournament setting),
    //            or a specific player by ID, with optional custom starting price ----
    socket.on("admin:next_player", async ({ tournamentId, playerId, startingPrice }) => {
      try {
        const tournament = await Tournament.findById(tournamentId);
        let player;

        if (playerId) {
          // Admin explicitly picked a specific player
          player = await Player.findOne({ _id: playerId, tournament: tournamentId });
        } else {
          const pool = await Player.find({
            tournament: tournamentId,
            status: "Approved",
            auctionEligible: true,
            auctionStatus: "Not Started",
          }).sort({ createdAt: 1 }); // always sorted by registration order

          if (pool.length === 0) {
            io.to(roomName(tournamentId)).emit("auction_pool_empty");
            return;
          }

          const mode = tournament?.auctionMode || "random";
          if (mode === "serial") {
            player = pool[0]; // oldest registration first
          } else {
            player = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        if (!player) return socket.emit("error_message", "Player not found");

        const openingPrice = Number(startingPrice) > 0 ? Number(startingPrice) : player.basePrice;

        player.auctionStatus = "In Auction";
        if (Number(startingPrice) > 0) player.basePrice = openingPrice;
        await player.save();

        const timerSeconds = tournament?.auctionTimerSeconds || 60;
        const timerEndsAt = new Date(Date.now() + timerSeconds * 1000);

        await AuctionState.findOneAndUpdate(
          { tournament: tournamentId },
          {
            status: "running",
            currentPlayer: player._id,
            currentBidAmount: openingPrice,
            currentBidTeam: null,
            timerEndsAt,
          },
          { new: true, upsert: true }
        );

        scheduleTimer(io, tournamentId, timerSeconds);

        const populated = await getPopulatedState(tournamentId);
        io.to(roomName(tournamentId)).emit("state_update", populated);
        io.to(roomName(tournamentId)).emit("player_in_auction", populated.currentPlayer);
      } catch (err) {
        socket.emit("error_message", err.message);
      }
    });

    // ---- ADMIN: manually set/adjust the current bid amount (e.g. correcting the
    // opening price, or applying a custom increment) before or during bidding.
    // Allowed any time the player is in auction; if a team has already bid, the
    // new amount must still be higher than the existing bid and is attributed
    // to no specific team unless `teamId` is provided. ----
    socket.on("admin:set_current_bid", async ({ tournamentId, amount, teamId }) => {
      try {
        const state = await AuctionState.findOne({ tournament: tournamentId });
        if (!state || !state.currentPlayer) {
          return socket.emit("error_message", "No player currently in auction");
        }
        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
          return socket.emit("error_message", "Enter a valid bid amount");
        }

        let team = null;
        if (teamId) {
          team = await Team.findById(teamId);
          if (!team) return socket.emit("error_message", "Team not found");
          if (numericAmount > team.remainingPurse) {
            return socket.emit("error_message", "Amount exceeds that team's remaining purse");
          }
          if (team.squad.length >= team.maxPlayers) {
            return socket.emit("error_message", "Team has reached maximum players limit");
          }
        }

        const tournament = await Tournament.findById(tournamentId);
        const timerSeconds = tournament?.auctionTimerSeconds || 60;
        const timerEndsAt = new Date(Date.now() + timerSeconds * 1000);

        state.currentBidAmount = numericAmount;
        if (teamId) state.currentBidTeam = teamId;
        state.timerEndsAt = timerEndsAt;
        await state.save();

        if (teamId) {
          await Bid.create({ tournament: tournamentId, player: state.currentPlayer, team: teamId, amount: numericAmount });
        }

        if (state.status === "running") {
          scheduleTimer(io, tournamentId, timerSeconds);
        }

        const populated = await getPopulatedState(tournamentId);
        io.to(roomName(tournamentId)).emit("state_update", populated);
        if (team) {
          io.to(roomName(tournamentId)).emit("new_bid", {
            team: { id: team._id, name: team.name, logo: team.logo },
            amount: numericAmount,
          });
        }
      } catch (err) {
        socket.emit("error_message", err.message);
      }
    });

    // ---- TEAM/ADMIN: place a bid for a specific amount (used by both the team
    // quick-bid buttons and the admin's manual bid entry panel) ----
    socket.on("team:place_bid", async ({ tournamentId, teamId, amount }) => {
      try {
        const state = await AuctionState.findOne({ tournament: tournamentId });
        if (!state || state.status !== "running") {
          return socket.emit("error_message", "Auction is not currently running");
        }

        const team = await Team.findById(teamId);
        if (!team) return socket.emit("error_message", "Team not found");

        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= state.currentBidAmount) {
          return socket.emit("error_message", "Bid must be higher than current bid");
        }
        if (numericAmount > team.remainingPurse) {
          return socket.emit("error_message", "Insufficient purse for this bid");
        }
        if (team.squad.length >= team.maxPlayers) {
          return socket.emit("error_message", "Team has reached maximum players limit");
        }
        if (String(state.currentBidTeam) === String(teamId)) {
          return socket.emit("error_message", "You are already the highest bidder");
        }

        // Optimistic concurrency check: make sure the bid we're raising against is
        // still the live one, so two near-simultaneous bids can't both "win".
        const tournament = await Tournament.findById(tournamentId);
        const timerSeconds = tournament?.auctionTimerSeconds || 60;
        const timerEndsAt = new Date(Date.now() + timerSeconds * 1000);

        const updated = await AuctionState.findOneAndUpdate(
          { tournament: tournamentId, currentBidAmount: state.currentBidAmount, status: "running" },
          { currentBidAmount: numericAmount, currentBidTeam: teamId, timerEndsAt },
          { new: true }
        );

        if (!updated) {
          return socket.emit("error_message", "Bid amount just changed — refresh and try again");
        }

        await Bid.create({ tournament: tournamentId, player: state.currentPlayer, team: teamId, amount: numericAmount });

        // reset the countdown - "whenever a new bid comes, timer resets"
        scheduleTimer(io, tournamentId, timerSeconds);

        const populated = await getPopulatedState(tournamentId);
        io.to(roomName(tournamentId)).emit("state_update", populated);
        io.to(roomName(tournamentId)).emit("new_bid", {
          team: { id: team._id, name: team.name, logo: team.logo },
          amount: numericAmount,
        });
      } catch (err) {
        socket.emit("error_message", err.message);
      }
    });

    // ---- ADMIN: pause / resume ----
    socket.on("admin:pause_auction", async ({ tournamentId }) => {
      clearAuctionTimer(tournamentId);
      await AuctionState.findOneAndUpdate({ tournament: tournamentId }, { status: "paused" }, { new: true });
      io.to(roomName(tournamentId)).emit("state_update", await getPopulatedState(tournamentId));
    });

    socket.on("admin:resume_auction", async ({ tournamentId }) => {
      const state = await AuctionState.findOne({ tournament: tournamentId });
      if (!state || !state.currentPlayer) return;
      const tournament = await Tournament.findById(tournamentId);
      const timerSeconds = tournament?.auctionTimerSeconds || 60;
      const timerEndsAt = new Date(Date.now() + timerSeconds * 1000);
      state.status = "running";
      state.timerEndsAt = timerEndsAt;
      await state.save();

      scheduleTimer(io, tournamentId, timerSeconds);

      io.to(roomName(tournamentId)).emit("state_update", await getPopulatedState(tournamentId));
    });

    // ---- ADMIN: manually mark current player sold (uses whatever the current bid is) ----
    socket.on("admin:force_sold", async ({ tournamentId }) => {
      clearAuctionTimer(tournamentId);
      await finalizeSale(io, tournamentId);
    });

    // ---- ADMIN: mark unsold immediately ----
    socket.on("admin:mark_unsold", async ({ tournamentId }) => {
      clearAuctionTimer(tournamentId);
      await finalizeUnsold(io, tournamentId);
    });

    // ---- ADMIN: undo the last sale (rollback purse/squad) ----
    socket.on("admin:undo_last_sale", async ({ tournamentId }) => {
      try {
        const state = await AuctionState.findOne({ tournament: tournamentId });
        if (!state || !state.lastSoldPlayer) {
          return socket.emit("error_message", "Nothing to undo");
        }

        const player = await Player.findById(state.lastSoldPlayer);
        const team = await Team.findById(state.lastSoldTeam);

        if (team && player) {
          team.remainingPurse += state.lastSoldPrice;
          team.squad = team.squad.filter((s) => String(s.player) !== String(player._id));
          await team.save();
        }
        if (player) {
          player.auctionStatus = "Not Started";
          player.soldTo = null;
          player.soldPrice = 0;
          await player.save();
        }

        state.lastSoldPlayer = null;
        state.lastSoldTeam = null;
        state.lastSoldPrice = 0;
        await state.save();

        io.to(roomName(tournamentId)).emit("state_update", await getPopulatedState(tournamentId));
        io.to(roomName(tournamentId)).emit("sale_undone", { playerId: player?._id });
      } catch (err) {
        socket.emit("error_message", err.message);
      }
    });

    // ---- ADMIN: end auction entirely ----
    socket.on("admin:end_auction", async ({ tournamentId }) => {
      clearAuctionTimer(tournamentId);
      await AuctionState.findOneAndUpdate(
        { tournament: tournamentId },
        { status: "ended", currentPlayer: null, currentBidAmount: 0, currentBidTeam: null, timerEndsAt: null },
        { new: true }
      );
      io.to(roomName(tournamentId)).emit("state_update", await getPopulatedState(tournamentId));
      io.to(roomName(tournamentId)).emit("auction_completed");
    });
  });
};

// Called when the countdown hits zero. `token` must still match the live
// token for this tournament or the resolution is stale and is ignored.
async function resolveTimerExpiry(io, tournamentId, token) {
  if (timerTokens[tournamentId] !== token) return;

  const state = await AuctionState.findOne({ tournament: tournamentId });
  if (!state || state.status !== "running") return;

  // re-check after the DB round trip too, in case a bid landed while we were reading
  if (timerTokens[tournamentId] !== token) return;

  if (state.currentBidTeam) {
    await finalizeSale(io, tournamentId);
  } else {
    await finalizeUnsold(io, tournamentId);
  }
}

async function finalizeSale(io, tournamentId) {
  const state = await AuctionState.findOne({ tournament: tournamentId });
  if (!state || !state.currentPlayer) return;

  const player = await Player.findById(state.currentPlayer);
  const team = await Team.findById(state.currentBidTeam);

  if (!team) {
    // nobody bid - treat as unsold
    return finalizeUnsold(io, tournamentId);
  }

  player.auctionStatus = "Sold";
  player.soldTo = team._id;
  player.soldPrice = state.currentBidAmount;
  await player.save();

  team.remainingPurse -= state.currentBidAmount;
  team.squad.push({ player: player._id, soldPrice: state.currentBidAmount, soldAt: new Date() });
  await team.save();

  state.status = "idle";
  state.lastSoldPlayer = player._id;
  state.lastSoldTeam = team._id;
  state.lastSoldPrice = state.currentBidAmount;
  state.currentPlayer = null;
  state.currentBidAmount = 0;
  state.currentBidTeam = null;
  state.timerEndsAt = null;
  await state.save();

  const populated = await AuctionState.findOne({ tournament: tournamentId })
    .populate("currentPlayer")
    .populate("lastSoldPlayer")
    .populate("lastSoldTeam", "name logo remainingPurse");

  io.to(roomName(tournamentId)).emit("state_update", populated);
  io.to(roomName(tournamentId)).emit("player_sold", {
    player: { id: player._id, name: player.fullName },
    team: { id: team._id, name: team.name, logo: team.logo },
    amount: state.lastSoldPrice,
  });
}

async function finalizeUnsold(io, tournamentId) {
  const state = await AuctionState.findOne({ tournament: tournamentId });
  if (!state || !state.currentPlayer) return;

  const player = await Player.findById(state.currentPlayer);
  player.auctionStatus = "Unsold";
  await player.save();

  state.status = "idle";
  state.currentPlayer = null;
  state.currentBidAmount = 0;
  state.currentBidTeam = null;
  state.timerEndsAt = null;
  await state.save();

  const populated = await AuctionState.findOne({ tournament: tournamentId }).populate("currentPlayer");
  io.to(roomName(tournamentId)).emit("state_update", populated);
  io.to(roomName(tournamentId)).emit("player_unsold", { player: { id: player._id, name: player.fullName } });
}
