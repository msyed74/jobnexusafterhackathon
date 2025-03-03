import mongoose from "mongoose";

const InternshipSchema = new mongoose.Schema({
  internship_title: String,  // ✅ Matches MongoDB field
  company_name: String,  // ✅ Matches MongoDB field
  location: String,
  start_date: String,  // ✅ Matches MongoDB field
  duration: String,
  stipend: String,
});

const Internship = mongoose.model("Internship", InternshipSchema);
export default Internship;
