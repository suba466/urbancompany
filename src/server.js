import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "assets")));

// --- MongoDB Connection ---
mongoose.connect("mongodb://localhost:27017/suba")
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));

// --- SCHEMAS ---
const packageSchema = new mongoose.Schema({
  title: String,
  rating: String,
  bookings: String,
  price: String,
  originalPrice: String,
  duration: String,
  description: String,
  items: [{ text: String, description: String }],
  content:[{value: String, details: String}]
});
const Package = mongoose.model("Package", packageSchema);

const cartSchema = new mongoose.Schema({
  title: String,
  price: String,
  originalPrice: String,
  count: { type: Number, default: 1 },
  content:[{value: String, details: String}],
  createdAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model("Cart", cartSchema);

// --- STATIC JSON DATA ---
const apiData = {
  logo: "/assets/Uc.png",
  services: [
    { name: "Salon for women", key: "salon", img: "/assets/salon.webp" },
    { name: "AC & Appliance Repair", key: "ac", img: "/assets/ac.webp" },
    { name: "Cleaning", key: "clean", img: "/assets/clean.webp" },
    { name: "Electrician, Plumber & Carpenters", key: "electric", img: "/assets/electric.webp" },
    { name: "Native Water Purifier", key: "native", img: "/assets/native.webp" }
  ],
  banner: { key: "banner", img: "/assets/banner.webp" },
  carousel: [
    { name: "Shine your bathroom deserves", key: "shine", img: "/assets/shine.png" },
    { name: "Festive packages upto 25% off", descriptions: "Extra 25% off for new users*", key: "festive", img: "/assets/festive.png" },
    { name: "Relax & rejuvenate at home", descriptions: "Massage for men", key: "relax", img: "/assets/relax.png" },
    { name: "RO Water Purifier", descriptions: "Needs no service for 2 years", key: "water", img: "/assets/water.png" },
    { name: "Get experts in 2 hours at ₹149", descriptions: "Electricians, plumbers, carpenters", key: "expert", img: "/assets/expert.png" },
    { name: "Deep clean with foam-jet AC service", descriptions: "AC service & repair", key: "deepclean", img: "/assets/deepclean.png" }
  ],
  book: [
    { name: "Intense cleaning (2 bathrooms)", title: "4.79 (3.1M)", value:"₹1,016", option:"₹1,098", key: "intenseclean", img: "/assets/intenseclean.png" },
    { name: "Classic cleaning (2 bathrooms)", title: "4.82 (1.5M)", value:"₹868", option:"₹938", key: "classic", img: "/assets/classic.png" },
    { name: "Switch/socket replacement", title: "4.85 (72M)", value:"₹49", key: "socket", img: "/assets/socket.png" },
    { name: "Drill & hang (wall decor)", title: "4.86 (99K)", value:"₹49", key: "wall", img: "/assets/wall.png" },
    { name: "Switchboard/switchbox repair", title: "4.85 (69K)", value:"₹79", key: "switch", img: "/assets/switch.png" },
    { name: "Automatic top load machine checkup", title: "4.78 (328K)", value:"₹299", key: "automatic", img: "/assets/automatic.png" },
    { name: "Tap repair", title: "4.81 (122K)", value:"₹49", key: "tap", img: "/assets/tap.png" },
    { name: "Intense cleaning (3 bathrooms)", title: "4.79 (3.1M)", value:"₹1,483", option:"₹1,647", key: "intence", img: "/assets/intense.png" },
    { name: "Fan repair (ceiling/exhaust/wall)", title: "4.81 (95K)", value:"₹109", key: "fan", img: "/assets/fan.png" },
    { name: "Bulb/tubelight holder installation", title: "4.86 (3.3K)", value:"₹69", key: "bulb", img: "/assets/bulb.png" }
  ],
  salon: [
    { key:"waxing", img:"/assets/waxing.png" },
    { key:"cleanup", img:"/assets/cleanup.png" },
    { key:"haircare", img:"/assets/haircare.png" }
  ],
  salonforwomen: [
    { name:"Super saver packages", key:"super", img:"/assets/super.webp" },
    { name:"Waxing & threading", key:"thread", img:"/assets/thread.webp" },
    { name:"Signature facial", key:"signature", img:"/assets/signature.webp" },
    { name:"Cleanup", key:"cleanup", img:"/assets/cleanup.webp" },
    { name:"Pedicure & manicure", key:"cure", img:"/assets/cure.webp" },
    { name:"Hair, bleach & detan", key:"hairbleach", img:"/assets/hairbleach.webp" }
  ],
  advanced: [
    { price:"₹799", value:"₹1,098", title:"Roll-on waxing", tit:"Full arms, legs & underarms", text:"Extra 25% off for new users*", key:"facial", img:"/assets/facial.jpg" },
    { pri:"Just launched", title:"Advanced tools", tit:"& ingredients", text:"Facial & clean", key:"advanced", img:"/assets/advanced.jpg" }
  ],
  super: [
    { key:"super", img:"/assets/super.jpg", title:"Festive ready package", price:"25% off", text:"Pick from mani-pedi,", tex:"facials & more", content:"Extra 25% off for", con:"new users with NEW25*" }
  ],
  smartlock: { key:"smartlocks", img:"/assets/smartlocks.png" },
  images: { key:"images", img:"/assets/images.png" },
  cart: [{ key:"cart", img:"/assets/cart.jpg" }]
};

// --- STATIC JSON ROUTES ---
app.get("/api/logo", (req, res) => res.json({ logo: apiData.logo }));
app.get("/api/services", (req, res) => res.json({ services: apiData.services }));
app.get("/api/banner", (req, res) => res.json({ banner: apiData.banner }));
app.get("/api/carousel", (req, res) => res.json({ carousel: apiData.carousel }));
app.get("/api/book", (req, res) => res.json({ book: apiData.book }));
app.get("/api/salon", (req, res) => res.json({ salon: apiData.salon }));
app.get("/api/salonforwomen", (req, res) => res.json({ salonforwomen: apiData.salonforwomen }));
app.get("/api/advanced", (req, res) => res.json({ advanced: apiData.advanced }));
app.get("/api/super", (req, res) => res.json({ super: apiData.super }));
app.get("/api/smartlock", (req, res) => res.json({ smartlock: apiData.smartlock }));
app.get("/api/images", (req, res) => res.json({ images: apiData.images }));
app.get("/api/cart", (req, res) => res.json({ cart: apiData.cart }));

// --- DYNAMIC MONGO ROUTES ---
app.get("/api/packages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.json({ packages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

app.post("/api/addpackages", async (req, res) => {
  try {
    const newPackage = new Package(req.body);
    await newPackage.save();
    res.status(201).json({ message: "Package added", package: newPackage });
  } catch {
    res.status(500).json({ error: "Failed to add package" });
  }
});

// --- CART ROUTES ---
app.get("/api/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json({ carts });
  } catch {
    res.status(500).json({ error: "Failed to fetch carts" });
  }
});

app.post("/api/addcarts", async (req, res) => {
  try {
    const existing = await Cart.findOne({ title: req.body.title });
    if (existing) {
      existing.count += 1;

      // Update content only if it exists in request
      if (req.body.content && req.body.content.length > 0) {
        existing.content = req.body.content;
      }

      await existing.save();
      return res.json({ message: "Quantity increased", cart: existing });
    }

    const newItem = new Cart(req.body);
    await newItem.save();
    res.status(201).json({ message: "Item added", cart: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});


app.put("/api/carts/:id", async (req, res) => {
  try {
    const updated = await Cart.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Cart updated", cart: updated });
  } catch {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

app.delete("/api/carts/:id", async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Cart item removed" });
  } catch {
    res.status(500).json({ error: "Failed to delete cart item" });
  }
});

// --- START SERVER ---
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
