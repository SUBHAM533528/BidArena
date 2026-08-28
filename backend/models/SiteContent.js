const mongoose = require("mongoose");

// Generic single-document-per-key content store, so any long-form editable
// text block (Terms & Conditions today, others later) can be admin-managed
// without a dedicated model + migration each time.
const siteContentSchema = new mongoose.Schema({
  key:     { type: String, required: true, unique: true }, // e.g. "terms"
  title:   { type: String, default: "" },
  content: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("SiteContent", siteContentSchema);
