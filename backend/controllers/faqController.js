const Faq = require("../models/Faq");

// Public — active FAQs only
exports.getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin — all FAQs
exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFaq = async (req, res) => {
  try {
    const faq = await Faq.create({
      question: req.body.question,
      answer:   req.body.answer,
      order:    Number(req.body.order) || 0,
      isActive: req.body.isActive !== false && req.body.isActive !== "false",
    });
    res.status(201).json(faq);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFaq = async (req, res) => {
  try {
    const data = {
      question: req.body.question ?? undefined,
      answer:   req.body.answer   ?? undefined,
      order:    req.body.order !== undefined ? Number(req.body.order) : undefined,
      isActive: req.body.isActive !== undefined ? (req.body.isActive !== false && req.body.isActive !== "false") : undefined,
    };
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);
    const faq = await Faq.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!faq) return res.status(404).json({ message: "FAQ not found" });
    res.json(faq);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteFaq = async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
