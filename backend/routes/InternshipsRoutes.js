import express from "express";
import Internship from "../models/internshipModel.js";

const router = express.Router();

// ✅ Fix Search API
router.get("/", async (req, res) => {
  try {
    const searchQuery = req.query.search || "";

    let data;
    if (searchQuery) {
      data = await Internship.find({
        $or: [
          { company_name: { $regex: searchQuery, $options: "i" } },  // ✅ Fix field name
          { internship_title: { $regex: searchQuery, $options: "i" } },
          { location: { $regex: searchQuery, $options: "i" } }
        ],
      });
    } else {
      data = await Internship.find();  // ✅ Fetch all internships if no search
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
