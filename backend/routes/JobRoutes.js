 
import express from "express";
import multer from "multer";
const JobApplication = require("../models/JobApplication");

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // ✅ Stores files in 'uploads/'

// ✅ Save job applications to MongoDB
router.post("/apply", upload.single("resumeFile"), async (req, res) => {
  try {
    const { name, email, resumeLink, coverLetter } = req.body;
    const resumeFile = req.file ? req.file.filename : null;

    const application = new JobApplication({ name, email, resumeLink, coverLetter, resumeFile });
    await application.save();

    res.json({ message: "Application submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
