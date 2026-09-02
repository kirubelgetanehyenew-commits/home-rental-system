const Report = require("../models/Report");

// Submit a report about a property or user
const createReport = async (req, res) => {
  try {
    const { property, reportedUser, reason, description } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ success: false, message: "A reason is required" });
    }
    if (!property && !reportedUser) {
      return res.status(400).json({
        success: false,
        message: "Report must reference a property or a user",
      });
    }

    const report = await Report.create({
      reporter: req.user._id,
      property,
      reportedUser,
      reason,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report submitted. Our team will review it.",
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports submitted by the logged-in user
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporter: req.user._id })
      .populate("property", "title location")
      .populate("reportedUser", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReport, getMyReports };
