import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import SuperPackage from "./models/SuperPackage.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB (no deprecated options)
mongoose.connect("mongodb://localhost:27017/suba")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// -----------------------------
// Routes
// -----------------------------

// Get all super saver packages
app.get("/api/super", async (req, res) => {
  try {
    const superPackages = await SuperPackage.find();
    res.json({ super: superPackages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single package by ID
app.get("/api/super/:id", async (req, res) => {
  try {
    const pkg = await SuperPackage.findById(req.params.id);
    res.json(pkg);
  } catch (err) {
    res.status(404).json({ error: "Package not found" });
  }
});

// Add a new package
app.post("/api/super", async (req, res) => {
  try {
    const newPackage = new SuperPackage(req.body);
    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a package
app.put("/api/super/:id", async (req, res) => {
  try {
    const updatedPackage = await SuperPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPackage);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a package
app.delete("/api/super/:id", async (req, res) => {
  try {
    await SuperPackage.findByIdAndDelete(req.params.id);
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seed sample package (optional)
app.get("/api/seed", async (req, res) => {
  try {
    const samplePackage = new SuperPackage({
      title: "Festive ready package",
      price: "₹2,920",
      originalPrice: "₹3,894",
      rating: 4.85,
      bookings: 15,
      duration: "3 hrs 50 mins",
      waxing: "Full arms (including underarms) - Chocolate Roll on, Full legs - Chocolate Roll on",
      facial: "O3 + shine & glow facial",
      pedicure: "Elysin Candle Spa pedicure",
      facialHairRemoval: "Eyebrow, Upper lip - Threading",
      img: "/assets/super.jpg"
    });
    await samplePackage.save();
    res.json({ message: "Sample package added", package: samplePackage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`MongoDB server running on http://localhost:${PORT}`));
