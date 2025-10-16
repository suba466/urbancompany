// server-db/models/SuperPackage.js
import mongoose from "mongoose";

const SuperPackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  originalPrice: { type: String },
  rating: { type: Number },
  bookings: { type: Number },
  duration: { type: String },
  waxing: { type: String },
  facial: { type: String },
  pedicure: { type: String },
  facialHairRemoval: { type: String },
  img: { type: String }
});

export default mongoose.model("SuperPackage", SuperPackageSchema);
