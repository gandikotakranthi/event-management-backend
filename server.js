import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  category: String,
});

const Event = mongoose.model("Event", EventSchema);
const OpenAI_API_KEY = process.env.HF_API_KEY;

async function categorizeEvent(title, description) {
  const prompt = `Classify this event into one of these categories: 
  ["Conference", "Workshop", "Social", "Webinar", "Birthday", "Meeting", "Festival", "Casual Gathering"]. 
  If none match, return "Uncategorized".
  Event: "${title}" - ${description}
  Category:`;
  try {
      const response = await axios.post(
          "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
          {
              inputs: prompt,
              parameters: { candidate_labels: ["Conference", "Workshop", "Social", "Webinar", "Birthday", "Meeting", "Festival", "Casual Gathering"] }
          },
          {
              headers: { Authorization: `Bearer ${OpenAI_API_KEY}` }
          }
      );

      const category = response.data?.labels?.[0] || "Uncategorized";
      return category;
  } catch (error) {
      console.error("Hugging Face AI categorization failed:", error);
      return "Uncategorized";
  }
}

app.post("/events", async (req, res) => {
  const { title, description, date } = req.body;
  const category = await categorizeEvent(title, description);
  const newEvent = new Event({ title, description, date, category });
  await newEvent.save();
  res.json(newEvent);
});

app.get("/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.put("/events/:id", async (req, res) => {
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedEvent);
});

app.delete("/events/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ message: "Event deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
