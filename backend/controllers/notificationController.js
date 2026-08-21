const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find()
    .populate("tournament", "name")
    .populate("player", "fullName")
    .sort({ createdAt: -1 })
    .limit(50);
  const unreadCount = await Notification.countDocuments({ read: false });
  res.json({ notifications, unreadCount });
};

exports.markRead = async (req, res) => {
  const n = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!n) return res.status(404).json({ message: "Notification not found" });
  res.json(n);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ message: "All notifications marked read" });
};
