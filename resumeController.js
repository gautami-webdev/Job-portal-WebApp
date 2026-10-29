const fs = require("fs");
const path = require("path");
const Resume = require("../models/Resume");

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please select a resume" });

    const existing = await Resume.findOne({ userId: req.user.id });
    if (existing) {
      const oldPath = path.join(__dirname, "..", existing.filePath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      existing.fileName = req.file.originalname;
      existing.filePath = path.relative(path.join(__dirname, ".."), req.file.path).replaceAll("\\", "/");
      existing.fileType = req.file.mimetype;
      existing.fileSize = req.file.size;
      await existing.save();
      return res.json({ success: true, message: "Resume replaced", resume: existing });
    }

    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: path.relative(path.join(__dirname, ".."), req.file.path).replaceAll("\\", "/"),
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
    res.status(201).json({ success: true, message: "Resume uploaded", resume });
  } catch (error) {
    next(error);
  }
};

exports.getMyResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    if (!resume) return res.status(404).json({ success: false, message: "Resume not found" });
    const file = path.join(__dirname, "..", resume.filePath);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    await resume.deleteOne();
    res.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    next(error);
  }
};