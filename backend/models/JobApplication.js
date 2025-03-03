import mongoose from "mongoose";
 

const jobApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  resumeLink: { type: String },
  coverLetter: { type: String },
  resumeFile: { type: String }, // ✅ Stores resume filename
  appliedAt: { type: Date, default: Date.now }, // ✅ Auto timestamp
});

 
const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;