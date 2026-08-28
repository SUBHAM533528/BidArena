const ContactMessage = require("../models/ContactMessage");

// Public — submit a new contact message
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const doc = await ContactMessage.create({ name, email, phone, subject, message });
    res.status(201).json({ message: "Thanks — we'll get back to you soon.", id: doc._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — list all messages, newest first
exports.getMessages = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — update status (new / read / resolved)
exports.updateStatus = async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: "Message not found" });
    res.json(msg);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — delete a message
exports.deleteMessage = async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
