import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcryptjs";
import adminRoutes from "./adminRoutes.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
  description: String,category:String,
  items: [{ text: String, description: String }],
  content: [{ value: String, details: String }],
  ratingBreak: [{ stars: Number, value: Number, count: String }]
});

const Package = mongoose.model("Package", packageSchema);

const cartSchema = new mongoose.Schema({
  productId: { type: String },
  title: String,
  price: String,
  originalPrice: String,category:String,
  count: { type: Number, default: 1 },
  content: [{ value: String, details: String }],
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

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  title: { type: String, default: "Ms" },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now } // Add this line
});

const User = mongoose.model("User", userSchema);

// --- Bookings Schema ---
const bookingSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  userName: String,
  userPhone: String,
  userCity: String,
  serviceName: String,
  servicePrice: String,
  originalPrice: String,
  address: Object,
  bookingDate: { type: Date, default: Date.now },
  scheduledDate: Date,
  scheduledTime: String,
  status: { type: String, default: 'Confirmed' },
  paymentStatus: { type: String, default: 'Paid' },
  technician: String,
  rating: Number,
  review: String,
  items: [{
    name: String,
    quantity: Number,
    price: String
  }],
  slotExtraCharge: { type: Number, default: 0 },
  tipAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  paymentMethod: String,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);


app.use("/api/admin", adminRoutes);


// User Registration with Image Upload
app.post("/api/register", upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;
    
    console.log(" Registration attempt:", { email, name, phone, city });
    console.log(" Uploaded file:", req.file);
    
    // Validation
    if (!name || !email || !phone || !city || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit phone number" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile image
    let profileImageUrl = "";
    if (req.file) {
      profileImageUrl = `/assets/${req.file.filename}`;
      console.log(" Profile image uploaded:", profileImageUrl);
    } else {
      console.log(" No profile image uploaded");
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      city,
      password: hashedPassword,
      profileImage: profileImageUrl
    });

    await user.save();

    console.log(` New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,  // Change this line - was: data.user.id
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        profileImage: user.profileImage,
        title: user.title
      }
    });

  } catch (error) {
    console.error(" Error in registration:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    res.status(500).json({ error: "Failed to register user" });
  }
});
// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(" Login attempt:", { email });
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log(` User logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,  // Change this line - was: data.user.id
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,
        profileImage: user.profileImage,
        title: user.title
      }
    });

  } catch (error) {
    console.error(" Error in login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});
app.post("/api/update-profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { userId, name, email, phone, city, title } = req.body;

    console.log("Profile update request received:", {
      userId,
      name,
      email,
      phone,
      city,
      title,
      hasFile: !!req.file,
      file: req.file
    });

    // Check if userId is valid
    if (!userId || userId === "undefined") {
      console.error("Invalid userId:", userId);
      return res.status(400).json({ 
        error: "Invalid user ID. Please log out and log in again." 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(" Invalid MongoDB ObjectId:", userId);
      return res.status(400).json({ 
        error: "Invalid user ID format. Please log out and log in again." 
      });
    }

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image
    let newProfileImage = existingUser.profileImage;
    if (req.file) {
      newProfileImage = `/assets/${req.file.filename}`;
      console.log(" New profile image:", newProfileImage);

      // Delete previous image if it exists and is not the default
      if (existingUser.profileImage && existingUser.profileImage.startsWith('/assets/')) {
        try {
          const oldImagePath = path.join(__dirname, existingUser.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log(" Deleted old image:", oldImagePath);
          }
        } catch (err) {
          console.error(" Error deleting old image:", err);
          // Continue even if deletion fails
        }
      }
    }

    // Prepare update data
    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      phone: phone || existingUser.phone,
      city: city || existingUser.city,
      title: title || existingUser.title || "Ms",
      profileImage: newProfileImage,
      updatedAt: new Date()
    };

    console.log(" Updating user with data:", updateData);

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password' // Don't return password
      }
    );

    console.log(" User updated successfully:", {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error(" Update error:", err);
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    return res.status(500).json({ error: "Failed to update profile. Please try again." });
  }
});

// Create new booking with email
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userPhone,
      userCity,
      serviceName,
      servicePrice,
      originalPrice,
      address,
      scheduledDate,
      scheduledTime,
      items,
      slotExtraCharge,
      tipAmount,
      taxAmount,
      paymentMethod
    } = req.body;

    console.log(" Received booking data:", {
      userEmail,
      serviceName,
      servicePrice,
      itemsCount: items ? items.length : 0
    });

    if (!userEmail || !serviceName) {
      return res.status(400).json({ error: "User email and service name are required" });
    }

    const booking = new Booking({
      userId: userId || `user_${userEmail}`,
      userEmail,
      userName: userName || "Customer",
      userPhone: userPhone || "",
      userCity: userCity || "",
      serviceName,
      servicePrice: servicePrice ? servicePrice.toString() : "0",
      originalPrice: originalPrice ? originalPrice.toString() : "0",
      address: address || {},
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      scheduledTime: scheduledTime || "10:00 AM",
      items: items || [],
      slotExtraCharge: slotExtraCharge || 0,
      tipAmount: tipAmount || 0,
      taxAmount: taxAmount || 0,
      paymentMethod: paymentMethod || "UPI",
      status: 'Confirmed',
      paymentStatus: 'Paid',
      bookingDate: new Date()
    });

    const savedBooking = await booking.save();

    console.log(` Booking created successfully:`, {
      id: savedBooking._id,
      email: savedBooking.userEmail,
      service: savedBooking.serviceName,
      price: savedBooking.servicePrice
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking
    });

  } catch (error) {
    console.error(" Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking: " + error.message });
  }
});

// Get user's bookings by email
app.get("/api/bookings/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(` Fetching bookings for email: ${email}`);
    
    const bookings = await Booking.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(` Found ${bookings.length} bookings for email: ${email}`);
    
    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error(" Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings: " + error.message });
  }
});

app.delete("/api/bookings/:id",async(req,res)=>{
  try{
    const {id}=req.params;
    console.log(`Cancelling booking with ID: ${id}`);
    const booking=await Booking.findByIdAndDelete(id);
    if(!booking){
      return res.status(404).json({
        success:false,error:"Booking not found"
      });
    }
    console.log(`Booking ${id} deleted successfully`);
   res.json({
      success: true,
      message: "Booking deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete booking: " + error.message 
    });
  }
});

// Get all bookings (for debugging)
app.get('/api/all-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log(`Total bookings in database: ${bookings.length}`);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users (for debugging)
app.get('/api/all-users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Total users in database: ${users.length}`);
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Plans API Routes ---
app.get("/api/plans/:userEmail", async (req, res) => {
  try {
    const { userEmail } = req.params;
    
    // For now, return empty array or mock data
    res.json({
      success: true,
      plans: []
    });

  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: "Failed to fetch plans" });
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
      ],
      upi: "/assets/upi.webp",
      card: "/assets/card.webp",
      net: "/assets/net.webp"
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
    console.error(' Error reading static data:', error);
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

// ---------- Existing API Routes ----------
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

// In your server.js file, update the /api/services endpoint
app.get("/api/services", async (req, res) => {
  try {
    // Always fetch from MongoDB first
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    
    if (services && services.length > 0) {
      return res.json({ services });
    }
    
    // Fallback to static data only if no services in MongoDB
    console.log("No services found in MongoDB, using static data as fallback");
    const staticData = readStaticData();
    if (staticData && staticData.services) {
      return res.json({ services: staticData.services });
    }
    
    res.status(404).json({ error: "No services found" });
  } catch (error) {
    console.error("Error fetching services:", error);
    // On error, use static data as fallback
    const staticData = readStaticData();
    if (staticData && staticData.services) {
      return res.json({ services: staticData.services });
    }
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
  'cart', 'added', 'upi', 'card', 'net'
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
    const newPackage = new Package({
      ...req.body,
      category: req.body.category || 'Salon for women' // Ensure category is set
    });
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
    const { productId, title, price, originalPrice, content, category } = req.body; // ADD category here
    let existing = null;
    if (productId) {
      existing = await Cart.findOne({ productId });
    }
    if (existing) {
      existing.content = content;
      existing.price = price;
      existing.originalPrice = originalPrice;
      existing.category = category || 'Salon for women'; // ADD this line
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
      category: category || 'Salon for women', // ADD this line
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

// Get salon for women data
app.get("/api/salonforwomen", async (req, res) => {
  try {
    const salonforwomen = await Package.find({ category: 'Salon for women' });
    if (salonforwomen.length > 0) {
      return res.json({ salonforwomen });
    }
    // Fallback to static data
    const staticData = readStaticData();
    if (staticData && staticData.services) {
      return res.json({ salonforwomen: staticData.services });
    }
    res.status(404).json({ error: "No salon for women data found" });
  } catch (error) {
    console.error("Error fetching salon for women:", error);
    res.status(500).json({ error: "Failed to fetch salon for women data" });
  }
});

// Get services for other categories (similar pattern)
app.get("/api/services/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Package.find({ category: category });
    if (services.length > 0) {
      return res.json({ services });
    }
    // Fallback to static data
    const staticData = readStaticData();
    const categoryServices = staticData?.services?.filter(s => 
      s.name.toLowerCase().includes(category.toLowerCase())
    ) || [];
    res.json({ services: categoryServices });
  } catch (error) {
    console.error(`Error fetching ${category} services:`, error);
    res.status(500).json({ error: `Failed to fetch ${category} services` });
  }
});
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  console.error('Server error:', error);
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));