import mongoose from "mongoose";
import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";  

import JobApplication from "./models/JobApplication.js";  
import Internship from "./models/internshipModel.js";  // ✅ Added missing import
import internshipsRoutes from "./routes/InternshipsRoutes.js"; 

import { createServer } from "http";
import { Server } from "socket.io";
import axios from "axios";

dotenv.config();
connectDB(); // ✅ Connect MongoDB

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sample API Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Internships API
app.use("/internships", internshipsRoutes);

// ✅ Setup file storage for resumes & attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Job Application Route
app.post("/apply", upload.single("resumeFile"), async (req, res) => {
  try {
    const { name, email, resumeLink, coverLetter } = req.body;
    const resumeFile = req.file ? req.file.filename : null;

    if (!name || !email || (!resumeLink && !resumeFile)) {
      return res.status(400).json({ message: "Missing required fields!" });
    }

    const application = new JobApplication({
      name, email, resumeLink, coverLetter, resumeFile,
    });

    await application.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Attachment Upload API
app.post("/uploadAttachment", upload.single("attachment"), async (req, res) => {
  const { userId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const response = await axios.post("http://localhost:8000/api/uploadAttachment", {
      userId,
      attachment: `uploads/${file.filename}`, // ✅ Corrected file path
    });

    return res.json({ url: response.data.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
});

// ✅ Real-Time Chat (Socket.io)
let chatRooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ userId, mentorId }) => {
    const room = `chat_${userId}_${mentorId}`;
    socket.join(room);
    chatRooms[socket.id] = room;
    console.log(`${userId} joined room ${room}`);
  });

  socket.on("sendMessage", async ({ userId, mentorId, text }) => {
    const room = `chat_${userId}_${mentorId}`;

    io.to(room).emit("message", { sender: userId, text, timestamp: Date.now() });

    try {
      await axios.post("http://localhost:8000/api/storeMessage", { userId, mentorId, text });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete chatRooms[socket.id];
  });
});

// ✅ Internship Fetch API
app.get("/internships", async (req, res) => {
  try {
    const internships = await Internship.find();
    const formattedData = internships.map((intern) => ({
      _id: intern._id,
      company: intern.company_name,
      role: intern.internship_title,
      location: intern.location,
      startDate: intern.start_date,
      duration: intern.duration,
      stipend: intern.stipend,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
