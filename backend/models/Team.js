const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: "Tournament", required: true },
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: "" },
    ownerName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    initialPurse: { type: Number, required: true, default: 10000000 },
    remainingPurse: { type: Number, required: true, default: 10000000 },
    maxPlayers: { type: Number, required: true, default: 18 },
    squad: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        soldPrice: Number,
        soldAt: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamSchema.virtual("playersCount").get(function () {
  return this.squad ? this.squad.length : 0;
});

teamSchema.set("toJSON", { virtuals: true });
teamSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Team", teamSchema);
