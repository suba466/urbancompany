import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "assets")));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assetsDir = path.join(__dirname, "assets");
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    cb(null, assetsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// --- MongoDB Connection ---
mongoose.connect("mongodb://localhost:27017/suba")
  .then(() => console.log(" MongoDB connected"))
  .catch(err => console.error(" MongoDB connection error:", err));

// --- SCHEMAS ---
const bannerSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  description: String,
  img: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Banner = mongoose.model("Banner", bannerSchema);

const packageSchema = new mongoose.Schema({
  title: String,
  rating: String,
  bookings: String,
  price: String,
  originalPrice: String,
  duration: String,
  description: String,
  items: [{ text: String, description: String }],
  content:[{value: String, details: String}],
  ratingBreak:[{stars:Number,value:Number,count:String}]
});

const Package = mongoose.model("Package", packageSchema);

const cartSchema = new mongoose.Schema({
  productId:{type:String},
  title: String,
  price: String,
  originalPrice: String,
  count: { type: Number, default: 1 },
  content:[{value: String, details: String}],
  createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", cartSchema);

const serviceSchema = new mongoose.Schema({
  name: String,
  key: String,
  img: String,
  description: String,
  category: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model("Service", serviceSchema);

// --- MOCK OTP IMPLEMENTATION ---
const mockUsers = [
  {
    phoneNumber: "+919876543210",
    name: "Suba shree",
    email: "suba@example.com",
    countryCode: "+91"
  }
];

const mockOtpStore = new Map();

// Mock send OTP endpoint
app.post("/api/send-otp", async (req, res) => {
  try {
    const { phoneNumber, countryCode } = req.body;
    
    if (!phoneNumber || !countryCode) {
      return res.status(400).json({ error: "Phone number and country code are required" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit phone number" });
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    // Store OTP request with timestamp
    mockOtpStore.set(fullPhoneNumber, {
      timestamp: Date.now(),
      verified: false
    });

    // Simulate API delay
    setTimeout(() => {
      res.json({ 
        success: true, 
        message: "OTP sent successfully"
      });
    }, 1000);

  } catch (error) {
    console.error("Error in send OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Mock verify OTP endpoint - ACCEPTS ANY 6-DIGIT OTP
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { phoneNumber, countryCode, otp } = req.body;
    
    if (!phoneNumber || !countryCode || !otp) {
      return res.status(400).json({ error: "Phone number, country code and OTP are required" });
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // ACCEPT ANY 6-DIGIT OTP (not just 123456)
    const otpRegex = /^\d{6}$/;
    if (otpRegex.test(otp)) {
      // Mark as verified
      mockOtpStore.set(fullPhoneNumber, {
        timestamp: Date.now(),
        verified: true
      });

      // Find or create user
      let user = mockUsers.find(u => u.phoneNumber === fullPhoneNumber);
      
      if (!user) {
        // Create new user with phone number as name
        user = {
          phoneNumber: fullPhoneNumber,
          name: `User${phoneNumber}`, // Create name from phone number
          email: "",
          countryCode: countryCode
        };
        mockUsers.push(user);
      }

      res.json({
        success: true,
        message: "OTP verified successfully",
        user: {
          id: fullPhoneNumber,
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          countryCode: user.countryCode
        },
        token: "mock-jwt-token"
      });
    } else {
      res.status(400).json({ error: "Please enter a valid 6-digit OTP" });
    }

  } catch (error) {
    console.error("Error in verify OTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Mock resend OTP endpoint
app.post("/api/resend-otp", async (req, res) => {
  try {
    const { phoneNumber, countryCode, method = "SMS" } = req.body;
    
    if (!phoneNumber || !countryCode) {
      return res.status(400).json({ error: "Phone number and country code are required" });
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    // Update timestamp
    mockOtpStore.set(fullPhoneNumber, {
      timestamp: Date.now(),
      verified: false
    });

    let message = "OTP sent via SMS";
    if (method === "WhatsApp") {
      message = "OTP sent via WhatsApp";
    }

    res.json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error("Error in resend OTP:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

// --- STATIC JSON DATA FILE ---
const STATIC_DATA_FILE = path.join(__dirname, 'static-data.json');

const initializeStaticData = () => {
  if (!fs.existsSync(STATIC_DATA_FILE)) {
    const initialData = {
      logo: "/assets/Uc.png",
      logo1: "/assets/urban.png",
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
      cart: [{ key:"cart", img:"/assets/cart.png" }],
      added:[
        {name:"Foot massage",key:"foot",img:"/assets/foot.webp",price:"199"},
        {name:"Sara fruit cleanup",key:"sara",img:"/assets/sara.webp",price:"699"},
        {name:"Hair color/mehandi (only application)",key:"hair",img:"/assets/hair.webp",price:"399"},
        {name:"O3+tan clear cleanup",key:"o3",img:"/assets/o3.webp",price:"849"},
        {name:"O3+shine & glow facial ",key:"o3 shine",img:"/assets/o3 shine.webp",price:"1,699"},
        {name:"Elysian British rose manicure",key:"british",img:"/assets/british.webp",price:"649"},
      ]
    };
    fs.writeFileSync(STATIC_DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log("Static data file created");
  }
};

const readStaticData = () => {
  try {
    if (fs.existsSync(STATIC_DATA_FILE)) {
      const data = fs.readFileSync(STATIC_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading static data:', error);
    return null;
  }
};

const writeStaticData = (data) => {
  try {
    fs.writeFileSync(STATIC_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing static data:', error);
    return false;
  }
};

initializeStaticData();

// ---------- Existing API Routes (unchanged) ----------
app.get("/api/banner", async (req, res) => {
  try {
    const banner = await Banner.findOne({ isActive: true }).sort({ order: 1 });
    if (banner) {
      return res.json({ 
        banner: {
          img: banner.img,
          title: banner.title,
          subtitle: banner.subtitle,
          description: banner.description
        } 
      });
    }
    const staticData = readStaticData();
    if (staticData && staticData.banner) {
      return res.json({ banner: staticData.banner });
    }
    res.status(404).json({ error: "No banner found" });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ error: "Failed to fetch banner" });
  }
});

app.get("/api/banners", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json({ banners });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

app.post("/api/banners", upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description, order } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    const banner = new Banner({
      title,
      subtitle,
      description,
      img: `/assets/${req.file.filename}`,
      order: order || 0,
      isActive: true
    });
    await banner.save();
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ error: "Failed to create banner" });
  }
});

app.put("/api/banners/:id", upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description, order, isActive } = req.body;
    const updateData = {
      title,
      subtitle,
      description,
      order,
      isActive,
      updatedAt: new Date()
    };
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json({ message: "Banner updated successfully", banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ error: "Failed to update banner" });
  }
});

app.delete("/api/banners/:id", async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

app.get("/api/services", async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    if (services && services.length > 0) {
      return res.json({ services });
    }
    const staticData = readStaticData();
    if (staticData && staticData.services) {
      return res.json({ services: staticData.services });
    }
    res.status(404).json({ error: "No services found" });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

app.get("/api/all-services", async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

app.post("/api/services", upload.single('image'), async (req, res) => {
  try {
    const { name, key, description, category, order } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    const service = new Service({
      name,
      key: key || name.toLowerCase().replace(/ /g, '-'),
      description,
      category,
      img: `/assets/${req.file.filename}`,
      order: order || 0,
      isActive: true
    });
    await service.save();
    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

app.put("/api/services/:id", upload.single('image'), async (req, res) => {
  try {
    const { name, key, description, category, order, isActive } = req.body;
    const updateData = { name, key, description, category, order, isActive };
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
    }
    const service = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service updated successfully", service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

app.delete("/api/services/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

app.get("/api/static-data", (req, res) => {
  const data = readStaticData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load static data" });
  }
});

const staticRoutes = [
  'logo','logo1', 'services', 'banner', 'carousel', 'book', 'salon', 
  'salonforwomen', 'advanced', 'super', 'smartlock', 'images', 
  'cart', 'added'
];

staticRoutes.forEach(route => {
  app.get(`/api/${route}`, (req, res) => {
    const data = readStaticData();
    if (data && data[route]) {
      res.json({ [route]: data[route] });
    } else {
      res.status(500).json({ error: `Failed to load ${route} data` });
    }
  });
});

app.post("/api/upload-static-image", upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imagePath = `/assets/${req.file.filename}`;
    res.json({ 
      message: "Image uploaded successfully", 
      imageUrl: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.put("/api/update-section/:section/:key", upload.single('image'), (req, res) => {
  try {
    const { section, key } = req.params;
    const data = readStaticData();
    if (!data || !data[section]) {
      return res.status(404).json({ error: "Section not found" });
    }
    let imageUrl = req.body.existingImage;
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
    }
    if (Array.isArray(data[section])) {
      const itemIndex = data[section].findIndex(item => item.key === key);
      if (itemIndex !== -1) {
        data[section][itemIndex] = {
          ...data[section][itemIndex],
          ...req.body,
          img: imageUrl || data[section][itemIndex].img
        };
        if (writeStaticData(data)) {
          res.json({ 
            message: "Item updated successfully", 
            item: data[section][itemIndex] 
          });
        } else {
          res.status(500).json({ error: "Failed to update item" });
        }
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } else {
      data[section] = {
        ...data[section],
        ...req.body,
        img: imageUrl || data[section].img
      };
      if (writeStaticData(data)) {
        res.json({ 
          message: "Section updated successfully", 
          section: data[section] 
        });
      } else {
        res.status(500).json({ error: "Failed to update section" });
      }
    }
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ error: "Failed to update section" });
  }
});

app.post("/api/add-to-section/:section", upload.single('image'), (req, res) => {
  try {
    const { section } = req.params;
    const data = readStaticData();
    if (!data || !data[section] || !Array.isArray(data[section])) {
      return res.status(404).json({ error: "Section not found or not an array" });
    }
    let imageUrl = "/assets/default.png";
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
    }
    const newItem = { ...req.body, img: imageUrl };
    data[section].push(newItem);
    if (writeStaticData(data)) {
      res.status(201).json({ 
        message: "Item added successfully", 
        item: newItem 
      });
    } else {
      res.status(500).json({ error: "Failed to add item" });
    }
  } catch (error) {
    console.error('Error adding to section:', error);
    res.status(500).json({ error: "Failed to add item" });
  }
});
// Update logo
app.put("/api/update-logo", upload.single('logo'), (req, res) => {
  try {
    const data = readStaticData();
    if (req.file) {
      data.logo = `/assets/${req.file.filename}`;
    }
    if (writeStaticData(data)) {
      res.json({ 
        message: "Logo updated successfully", 
        logo: data.logo 
      });
    } else {
      res.status(500).json({ error: "Failed to update logo" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update logo" });
  }
});

app.put("/api/update-logo1", upload.single('logo'), (req, res) => {
  try {
    const data = readStaticData();
    if (req.file) {
      data.logo1 = `/assets/${req.file.filename}`;
    }
    if (writeStaticData(data)) {
      res.json({ 
        message: "Logo1 updated successfully", 
        logo1: data.logo1 
      });
    } else {
      res.status(500).json({ error: "Failed to update logo1" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update logo1" });
  }
});
app.delete("/api/delete-section/:section/:key", (req, res) => {
  try {
    const { section, key } = req.params;
    const data = readStaticData();
    if (!data || !data[section] || !Array.isArray(data[section])) {
      return res.status(404).json({ error: "Section not found or not an array" });
    }
    data[section] = data[section].filter(item => item.key !== key);
    if (writeStaticData(data)) {
      res.json({ message: "Item deleted successfully" });
    } else {
      res.status(500).json({ error: "Failed to delete item" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

app.get("/api/packages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.json({ packages });
  } catch {
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

app.put("/api/packages/:id", async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPackage) return res.status(404).json({ error: "Package not found" });
    res.json({ message: "Package updated successfully", package: updatedPackage });
  } catch {
    res.status(500).json({ error: "Failed to update package" });
  }
});

app.delete("/api/packages/:id", async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Package not found" });
    res.json({ message: "Package deleted" });
  } catch {
    res.status(500).json({ error: "Failed to delete package" });
  }
});

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
    const { productId, title, price, originalPrice, content } = req.body;
    let existing = null;
    if (productId) {
      existing = await Cart.findOne({ productId });
    }
    if (existing) {
      existing.content = content;
      existing.price = price;
      existing.originalPrice = originalPrice;
      existing.count = existing.count || 1;
      await existing.save();
      return res.json({ message: "Cart updated", cart: existing });
    }
    const newCart = new Cart({
      productId: productId || new mongoose.Types.ObjectId().toString(),
      title,
      price,
      originalPrice,
      content,
      count: 1,
    });
    await newCart.save();
    res.status(201).json({ message: "Cart added", cart: newCart });
  } catch (err) {
    console.error("Error in /api/addcarts:", err);
    res.status(500).json({ error: "Failed to add/update cart" });
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

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));