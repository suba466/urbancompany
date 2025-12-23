import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const PORT = 5000;
const JWT_SECRET = "your-jwt-secret-key-change-this-in-production";

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
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ==============================
// SCHEMAS
// ==============================

const packageSchema = new mongoose.Schema({
  title: String,
  rating: String,
  bookings: String,
  price: String,
  originalPrice: String,
  duration: String,
  description: String,
  category: String,
  subcategory: String,
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  items: [{ text: String, description: String }],
  content: [{ value: String, details: String }],
  ratingBreak: [{ stars: Number, value: Number, count: String }],
  createdAt: { type: Date, default: Date.now }
});

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);

const cartSchema = new mongoose.Schema({
  productId: { type: String },
  title: String,
  price: String,
  originalPrice: String,
  category: String,
  count: { type: Number, default: 1 },
  content: [{ value: String, details: String }],
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

const categorySchema = new mongoose.Schema({
  name: String,
  key: String,
  img: { type: String, default: "/assets/default-category.png" },
  description: String,
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  hasSubcategories: { type: Boolean, default: false },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  }],
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

const subcategorySchema = new mongoose.Schema({
  name: String,
  key: String,
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  categoryName: String,
  description: String,
  img: { type: String, default: "/assets/default-subcategory.png" },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Subcategory = mongoose.models.Subcategory || mongoose.model("Subcategory", subcategorySchema);

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "" },
  title: { type: String, default: "Ms" },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: "/assets/default-avatar.png" },
  isActive: { type: Boolean, default: true },
  permissions: {
    Dashboard: { type: Boolean, default: false },
    Users: { type: Boolean, default: false },
    Customer: { type: Boolean, default: false },
    Category: { type: Boolean, default: false },
    Product: { type: Boolean, default: false },
    Bookings: { type: Boolean, default: false },
    Reports: { type: Boolean, default: false },
    Settings: { type: Boolean, default: false }
  },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const bookingSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerEmail: String,
  customerName: String,
  customerPhone: String,
  customerCity: String,
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

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

// ==============================
// UTILITY FUNCTIONS
// ==============================

const initializeAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "admin@urbancompany.com" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = new Admin({
        username: "admin",
        email: "admin@urbancompany.com",
        password: hashedPassword,
        role: "superadmin",
        isActive: true
      });
      await admin.save();
      console.log("✅ Default admin created: admin@urbancompany.com / admin123");
    }
  } catch (error) {
    console.error("❌ Error initializing admin:", error);
  }
};

initializeAdmin();

// ==============================
// AUTHENTICATION MIDDLEWARE
// ==============================

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (typeof roles === 'string') {
      roles = [roles];
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ error: "You don't have permission to access this resource" });
  };
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin has all permissions
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return next();
    }

    // User needs specific permission
    if (req.user.role === 'user' && req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({ error: "You don't have permission to access this resource" });
  };
};

// ==============================
// STATIC DATA MANAGEMENT
// ==============================

const STATIC_DATA_FILE = path.join(__dirname, 'static-data.json');

const initializeStaticData = () => {
  if (!fs.existsSync(STATIC_DATA_FILE)) {
    const initialData = {
      logo: "/assets/Uc.png",
      logo1: "/assets/urban.png",
      categories: [
        { name: "Salon for women", key: "salon", img: "/assets/salon.webp" },
        { name: "AC & Appliance Repair", key: "ac", img: "/assets/ac.webp" },
        { name: "Cleaning", key: "clean", img: "/assets/clean.webp" },
        { name: "Electrician, Plumber & Carpenters", key: "electric", img: "/assets/electric.webp" },
        { name: "Native Water Purifier", key: "native", img: "/assets/native.webp" }
      ],
      carousel: [
        { name: "Shine your bathroom deserves", key: "shine", img: "/assets/shine.png" },
        { name: "Festive packages upto 25% off", descriptions: "Extra 25% off for new users*", key: "festive", img: "/assets/festive.png" },
        { name: "Relax & rejuvenate at home", descriptions: "Massage for men", key: "relax", img: "/assets/relax.png" },
        { name: "RO Water Purifier", descriptions: "Needs no service for 2 years", key: "water", img: "/assets/water.png" },
        { name: "Get experts in 2 hours at ₹149", descriptions: "Electricians, plumbers, carpenters", key: "expert", img: "/assets/expert.png" },
        { name: "Deep clean with foam-jet AC service", descriptions: "AC service & repair", key: "deepclean", img: "/assets/deepclean.png" }
      ],
      book: [
        { name: "Intense cleaning (2 bathrooms)", title: "4.79 (3.1M)", value: "₹1,016", option: "₹1,098", key: "intenseclean", img: "/assets/intenseclean.png" },
        { name: "Classic cleaning (2 bathrooms)", title: "4.82 (1.5M)", value: "₹868", option: "₹938", key: "classic", img: "/assets/classic.png" },
        { name: "Switch/socket replacement", title: "4.85 (72M)", value: "₹49", key: "socket", img: "/assets/socket.png" },
        { name: "Drill & hang (wall decor)", title: "4.86 (99K)", value: "₹49", key: "wall", img: "/assets/wall.png" },
        { name: "Switchboard/switchbox repair", title: "4.85 (69K)", value: "₹79", key: "switch", img: "/assets/switch.png" },
        { name: "Automatic top load machine checkup", title: "4.78 (328K)", value: "₹299", key: "automatic", img: "/assets/automatic.png" },
        { name: "Tap repair", title: "4.81 (122K)", value: "₹49", key: "tap", img: "/assets/tap.png" },
        { name: "Intense cleaning (3 bathrooms)", title: "4.79 (3.1M)", value: "₹1,483", option: "₹1,647", key: "intence", img: "/assets/intense.png" },
        { name: "Fan repair (ceiling/exhaust/wall)", title: "4.81 (95K)", value: "₹109", key: "fan", img: "/assets/fan.png" },
        { name: "Bulb/tubelight holder installation", title: "4.86 (3.3K)", value: "₹69", key: "bulb", img: "/assets/bulb.png" }
      ],
      salon: [
        { key: "waxing", img: "/assets/waxing.png" },
        { key: "cleanup", img: "/assets/cleanup.png" },
        { key: "haircare", img: "/assets/haircare.png" }
      ],
      advanced: [
        { price: "₹799", value: "₹1,098", title: "Roll-on waxing", tit: "Full arms, legs & underarms", text: "Extra 25% off for new users*", key: "facial", img: "/assets/facial.jpg" },
        { pri: "Just launched", title: "Advanced tools", tit: "& ingredients", text: "Facial & clean", key: "advanced", img: "/assets/advanced.jpg" }
      ],
      super: [
        { key: "super", img: "/assets/super.jpg", title: "Festive ready package", price: "25% off", text: "Pick from mani-pedi,", tex: "facials & more", content: "Extra 25% off for", con: "new users with NEW25*" }
      ],
      smartlock: { key: "smartlocks", img: "/assets/smartlocks.png" },
      images: { key: "images", img: "/assets/images.png" },
      cart: [{ key: "cart", img: "/assets/cart.png" }],
      added: [
        { name: "Foot massage", key: "foot", img: "/assets/foot.webp", price: "199" },
        { name: "Sara fruit cleanup", key: "sara", img: "/assets/sara.webp", price: "699" },
        { name: "Hair color/mehandi (only application)", key: "hair", img: "/assets/hair.webp", price: "399" },
        { name: "O3+tan clear cleanup", key: "o3", img: "/assets/o3.webp", price: "849" },
        { name: "O3+shine & glow facial ", key: "o3 shine", img: "/assets/o3 shine.webp", price: "1,699" },
        { name: "Elysian British rose manicure", key: "british", img: "/assets/british.webp", price: "649" },
      ],
      upi: "/assets/upi.webp",
      card: "/assets/card.webp",
      net: "/assets/net.webp"
    };
    fs.writeFileSync(STATIC_DATA_FILE, JSON.stringify(initialData, null, 2));
    console.log("✅ Static data file created");
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
    console.error('❌ Error reading static data:', error);
    return null;
  }
};

const writeStaticData = (data) => {
  try {
    fs.writeFileSync(STATIC_DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing static data:', error);
    return false;
  }
};

initializeStaticData();

// ==============================
// SHARED SERVICE FUNCTIONS
// ==============================

const handleProfileImageUpload = async (req, existingImage, defaultImage) => {
  let newImage = existingImage;
  
  if (req.file) {
    newImage = `/assets/${req.file.filename}`;
    console.log("New profile image uploaded:", newImage);

    // Delete old image if it exists and is not default
    if (existingImage && existingImage !== defaultImage && existingImage.startsWith('/assets/')) {
      try {
        const oldImagePath = path.join(__dirname, existingImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old image:", oldImagePath);
        }
      } catch (err) {
        console.error("Error deleting old image:", err);
      }
    }
  }
  
  return newImage;
};

const validateEmailExists = async (model, email, excludeId = null) => {
  const query = { email };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const existing = await model.findOne(query);
  return existing ? true : false;
};

// ==============================
// ROUTER SETUP
// ==============================

// Create routers
const authRouter = express.Router();
const publicRouter = express.Router();
const customerRouter = express.Router();
const userRouter = express.Router();
const adminRouter = express.Router();

// ==============================
// 1. AUTH ROUTES (No authentication needed)
// ==============================

// Customer registration
authRouter.post("/register", upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;

    console.log("Customer registration attempt:", { email, name, phone, city });

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

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: "Customer already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile image
    let profileImageUrl = "";
    if (req.file) {
      profileImageUrl = `/assets/${req.file.filename}`;
      console.log("Customer profile image uploaded:", profileImageUrl);
    }

    // Create new customer
    const customer = new Customer({
      name,
      email,
      phone,
      city,
      password: hashedPassword,
      profileImage: profileImageUrl
    });

    await customer.save();

    console.log(`✅ New customer registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        profileImage: customer.profileImage,
        title: customer.title
      }
    });

  } catch (error) {
    console.error("❌ Error in customer registration:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Customer already exists with this email" });
    }
    res.status(500).json({ error: "Failed to register customer" });
  }
});

// Customer login
authRouter.post("/customer/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Customer login attempt:", { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: customer._id,
        email: customer.email,
        role: 'customer'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Customer logged in: ${email}`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        profileImage: customer.profileImage,
        title: customer.title,
        role: 'customer'
      }
    });

  } catch (error) {
    console.error("❌ Error in customer login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// User login
authRouter.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("User login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(400).json({ error: "Account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate JWT token for user
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: 'user',
        profileImage: user.profileImage,
        permissions: user.permissions
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      message: "User login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        profileImage: user.profileImage,
        permissions: user.permissions,
        role: 'user'
      }
    });

  } catch (error) {
    console.error("❌ Error in user login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Admin login
authRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Admin login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    if (!admin.isActive) {
      return res.status(400).json({ error: "Account is deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: 'admin',
        permissions: {
          Dashboard: true,
          Users: true,
          Customer: true,
          Category: true,
          Product: true,
          Bookings: true,
          Reports: true,
          Settings: true
        }
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(`✅ Admin logged in: ${email}`);

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: {
          Dashboard: true,
          Users: true,
          Customer: true,
          Category: true,
          Product: true,
          Bookings: true,
          Reports: true,
          Settings: true
        }
      }
    });

  } catch (error) {
    console.error("❌ Error in admin login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// ==============================
// 2. PUBLIC ROUTES (No authentication needed)
// ==============================

// Get all active categories
publicRouter.get("/categories", async (req, res) => {
  try {
    console.log("Fetching categories...");

    // Try to get from MongoDB
    let categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    // If MongoDB has no categories, use static JSON file
    if (categories.length === 0) {
      console.log("No categories in MongoDB, using static data");
      const staticData = readStaticData();

      if (staticData && staticData.categories) {
        categories = staticData.categories.map((cat, index) => ({
          _id: `static_${cat.key || index}`,
          name: cat.name,
          key: cat.key,
          img: cat.img,
          description: cat.description || cat.name,
          isActive: true
        }));
      }
    }

    res.json({
      success: true,
      categories: categories || [],
      count: categories ? categories.length : 0,
      source: categories.length > 0 ? "database" : "static"
    });

  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.json({
      success: false,
      categories: [],
      count: 0,
      error: "Failed to fetch categories"
    });
  }
});

// Get all active subcategories
publicRouter.get("/subcategories", async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ isActive: true })
      .sort({ name: 1 })
      .populate('categoryId', 'name key');

    res.json({
      success: true,
      subcategories: subcategories || [],
      count: subcategories ? subcategories.length : 0
    });
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Get subcategories by category key
publicRouter.get("/subcategories/:categoryKey", async (req, res) => {
  try {
    const { categoryKey } = req.params;

    // Find category by key
    const category = await Category.findOne({ key: categoryKey });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const subcategories = await Subcategory.find({
      categoryId: category._id,
      isActive: true
    }).sort({ name: 1 });

    res.json({
      success: true,
      subcategories: subcategories || [],
      categoryName: category.name,
      count: subcategories ? subcategories.length : 0
    });
  } catch (error) {
    console.error("❌ Error fetching subcategories by category:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Get packages by subcategory
publicRouter.get("/packages/subcategory/:subcategoryKey", async (req, res) => {
  try {
    const { subcategoryKey } = req.params;

    const subcategory = await Subcategory.findOne({ key: subcategoryKey });
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    const packages = await Package.find({
      subcategoryId: subcategory._id,
      category: subcategory.categoryName
    });

    res.json({
      success: true,
      packages: packages || [],
      subcategoryName: subcategory.name,
      count: packages ? packages.length : 0
    });
  } catch (error) {
    console.error("❌ Error fetching packages by subcategory:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Get packages for specific category
publicRouter.get("/packages/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const packages = await Package.find({ category: category });
    if (packages.length > 0) {
      return res.json({ packages });
    }
    // Fallback to static data
    const staticData = readStaticData();
    const categoryPackages = staticData?.book?.filter(b =>
      b.name.toLowerCase().includes(category.toLowerCase())
    ) || [];
    res.json({ packages: categoryPackages });
  } catch (error) {
    console.error(`❌ Error fetching ${category} packages:`, error);
    res.status(500).json({ error: `Failed to fetch ${category} packages` });
  }
});

// Get salon for women data
publicRouter.get("/salonforwomen", async (req, res) => {
  try {
    const salonforwomen = await Package.find({ category: 'Salon for women' });
    if (salonforwomen.length > 0) {
      return res.json({ salonforwomen });
    }
    // Fallback to static data
    const staticData = readStaticData();
    if (staticData && staticData.categories) {
      return res.json({ salonforwomen: staticData.categories });
    }
    res.status(404).json({ error: "No salon for women data found" });
  } catch (error) {
    console.error("❌ Error fetching salon for women:", error);
    res.status(500).json({ error: "Failed to fetch salon for women data" });
  }
});

// All packages
publicRouter.get("/packages", async (req, res) => {
  try {
    const packages = await Package.find();
    res.json({ packages });
  } catch {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Static data
publicRouter.get("/static-data", (req, res) => {
  const data = readStaticData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load static data" });
  }
});

// Health check
publicRouter.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ==============================
// 3. CUSTOMER ROUTES (Customer authentication needed)
// ==============================

customerRouter.use(verifyToken, checkRole('customer'));

// Get customer profile
customerRouter.get("/profile", async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('-password');
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      success: true,
      customer
    });
  } catch (error) {
    console.error("❌ Error fetching customer profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update customer profile
customerRouter.put("/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, phone, city, title } = req.body;

    console.log("Customer profile update request received:", {
      customerId: req.user.id,
      name,
      email,
      phone,
      city,
      title,
      hasFile: !!req.file
    });

    // Find existing customer
    const existingCustomer = await Customer.findById(req.user.id);
    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingCustomer.email) {
      const emailExists = await validateEmailExists(Customer, email, req.user.id);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image
    let newProfileImage = existingCustomer.profileImage;
    if (req.file) {
      newProfileImage = `/assets/${req.file.filename}`;
      console.log("New profile image:", newProfileImage);

      // Delete previous image if it exists and is not the default
      if (existingCustomer.profileImage && existingCustomer.profileImage.startsWith('/assets/')) {
        try {
          const oldImagePath = path.join(__dirname, existingCustomer.profileImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log("Deleted old image:", oldImagePath);
          }
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
      }
    }

    // Prepare update data
    const updateData = {
      name: name || existingCustomer.name,
      email: email || existingCustomer.email,
      phone: phone || existingCustomer.phone,
      city: city || existingCustomer.city,
      title: title || existingCustomer.title || "Ms",
      profileImage: newProfileImage,
      updatedAt: new Date()
    };

    // Update customer in database
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    console.log("✅ Customer updated successfully:", {
      id: updatedCustomer._id,
      name: updatedCustomer.name,
      email: updatedCustomer.email
    });

    return res.json({
      success: true,
      message: "Profile updated successfully",
      customer: updatedCustomer
    });

  } catch (err) {
    console.error("❌ Update error:", err);

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

// Create new booking
customerRouter.post("/bookings", async (req, res) => {
  try {
    const {
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

    // Get customer info from token
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log("Creating booking for customer:", customer.email);

    const booking = new Booking({
      customerId: customer._id,
      customerEmail: customer.email,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerCity: customer.city,
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

    console.log(`✅ Booking created successfully:`, {
      id: savedBooking._id,
      email: savedBooking.customerEmail,
      service: savedBooking.serviceName,
      price: savedBooking.servicePrice
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: savedBooking
    });

  } catch (error) {
    console.error("❌ Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking: " + error.message });
  }
});

// Get customer's bookings
customerRouter.get("/bookings", async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log(`Fetching bookings for customer: ${customer.email}`);

    const bookings = await Booking.find({ customerEmail: customer.email })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${bookings.length} bookings for email: ${customer.email}`);

    res.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings: " + error.message });
  }
});

// Cancel booking
customerRouter.delete("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify booking belongs to customer
    const booking = await Booking.findOne({ _id: id, customerEmail: req.user.email });
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found or unauthorized"
      });
    }
    
    console.log(`Cancelling booking with ID: ${id}`);
    await Booking.findByIdAndDelete(id);
    
    console.log(`✅ Booking ${id} deleted successfully`);
    res.json({
      success: true,
      message: "Booking cancelled successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel booking: " + error.message
    });
  }
});

// Add to cart
customerRouter.post("/cart", async (req, res) => {
  try {
    const { productId, title, price, originalPrice, content, category } = req.body;
    
    let existing = null;
    if (productId) {
      existing = await Cart.findOne({ productId, customerId: req.user.id });
    }
    
    if (existing) {
      existing.content = content;
      existing.price = price;
      existing.originalPrice = originalPrice;
      existing.category = category || 'Salon for women';
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
      category: category || 'Salon for women',
      count: 1,
      customerId: req.user.id
    });
    
    await newCart.save();
    res.status(201).json({ message: "Item added to cart", cart: newCart });
    
  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
});

// Get customer's cart
customerRouter.get("/cart", async (req, res) => {
  try {
    const cartItems = await Cart.find({ customerId: req.user.id });
    res.json({ cart: cartItems });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// Update cart item
customerRouter.put("/cart/:id", async (req, res) => {
  try {
    const { count } = req.body;
    const updated = await Cart.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      { count },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    
    res.json({ message: "Cart updated", cart: updated });
  } catch {
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove from cart
customerRouter.delete("/cart/:id", async (req, res) => {
  try {
    const deleted = await Cart.findOneAndDelete({ 
      _id: req.params.id, 
      customerId: req.user.id 
    });
    
    if (!deleted) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    
    res.json({ message: "Item removed from cart" });
  } catch {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear entire cart
customerRouter.delete("/cart", async (req, res) => {
  try {
    await Cart.deleteMany({ customerId: req.user.id });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ==============================
// 4. USER ROUTES (Staff authentication needed)
// ==============================

userRouter.use(verifyToken, checkRole('user'));

// Get user profile
userRouter.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        profileImage: user.profileImage,
        position: user.designation,
        isActive: user.isActive,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
userRouter.put("/profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { name, email, phone, designation } = req.body;

    const existingUser = await User.findById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow email update to existing email
    if (email && email !== existingUser.email) {
      const emailExists = await validateEmailExists(User, email, req.user.id);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image
    let newProfileImage = existingUser.profileImage;
    if (req.file) {
      newProfileImage = await handleProfileImageUpload(
        req, 
        existingUser.profileImage, 
        "/assets/default-avatar.png"
      );
    }

    const updateData = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      phone: phone || existingUser.phone,
      designation: designation || existingUser.designation,
      profileImage: newProfileImage,
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ==============================
// 5. ADMIN ROUTES (Admin authentication needed)
// ==============================

adminRouter.use(verifyToken, checkRole(['admin', 'superadmin']));

// Admin Dashboard Statistics
adminRouter.get("/dashboard", checkPermission('Dashboard'), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalPackages = await Package.countDocuments();

    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$servicePrice" } }
        }
      }
    ]);

    // Get recent bookings with customer details
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customerId', 'name email profileImage')
      .lean();

    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email phone city profileImage createdAt');

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: { $toDouble: "$servicePrice" } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const topServices = await Booking.aggregate([
      {
        $group: {
          _id: "$serviceName",
          count: { $sum: 1 },
          revenue: { $sum: { $toDouble: "$servicePrice" } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalBookings,
        totalCategories,
        totalPackages,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings,
      recentCustomers,
      monthlyRevenue,
      topServices
    });

  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Admin Profile
adminRouter.get("/profile", checkPermission('Dashboard'), async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({
      success: true,
      profile: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        position: "Administrator",
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Error fetching admin profile:", error);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
});

// --- User Management ---

// Get all users with pagination
adminRouter.get("/users", checkPermission('Users'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user
adminRouter.get("/users/:id", checkPermission('Users'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -__v');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user
adminRouter.post("/users", checkPermission('Users'), upload.single('profileImage'), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      designation,
      password,
      permissions,
      isActive
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !designation || !password) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle profile image upload
    let profileImageUrl = "/assets/default-avatar.png";
    if (req.file) {
      profileImageUrl = `/assets/${req.file.filename}`;
      console.log("Profile image uploaded:", profileImageUrl);
    }

    // Parse permissions
    let parsedPermissions = {};
    if (permissions) {
      if (typeof permissions === 'string') {
        parsedPermissions = JSON.parse(permissions);
      } else {
        parsedPermissions = permissions;
      }
    } else {
      parsedPermissions = {
        Dashboard: false,
        Users: false,
        Customer: false,
        Category: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      };
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      designation,
      password: hashedPassword,
      profileImage: profileImageUrl,
      isActive: isActive !== undefined ? isActive : true,
      permissions: parsedPermissions
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        profileImage: user.profileImage,
        permissions: user.permissions,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("❌ Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
adminRouter.put("/users/:id", checkPermission('Users'), upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing user
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't allow email update to existing email
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await validateEmailExists(User, updateData.email, id);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = await handleProfileImageUpload(
        req, 
        existingUser.profileImage, 
        "/assets/default-avatar.png"
      );
    }

    // Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Parse permissions if it's a string
    if (updateData.permissions && typeof updateData.permissions === 'string') {
      updateData.permissions = JSON.parse(updateData.permissions);
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: "User updated successfully",
      user
    });

  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
adminRouter.delete("/users/:id", checkPermission('Users'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete profile image if not default
    if (user.profileImage && user.profileImage !== "/assets/default-avatar.png") {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted profile image:", imagePath);
      }
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// --- Customer Management ---

// Get all customers with pagination
adminRouter.get("/customers", checkPermission('Customer'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } }
        ]
      };
    }

    const customers = await Customer.find(query)
      .select('name email phone city profileImage createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get single customer
adminRouter.get("/customers/:id", checkPermission('Customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).select('-password -__v');

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error("❌ Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Update customer
adminRouter.put("/customers/:id", checkPermission('Customer'), upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Don't allow email update to existing email
    if (updateData.email && updateData.email !== customer.email) {
      const emailExists = await validateEmailExists(Customer, updateData.email, id);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = await handleProfileImageUpload(req, customer.profileImage, "");
    }

    // Handle password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.json({
      success: true,
      message: "Customer updated successfully",
      customer: updatedCustomer
    });

  } catch (error) {
    console.error("❌ Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete customer
adminRouter.delete("/customers/:id", checkPermission('Customer'), async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Delete profile image if exists
    if (customer.profileImage && customer.profileImage.startsWith('/assets/')) {
      const imagePath = path.join(__dirname, '..', customer.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted profile image:", imagePath);
      }
    }

    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// Get customers by emails
adminRouter.post("/customers-by-emails", checkPermission('Customer'), async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Emails array is required" });
    }

    const customers = await Customer.find({ email: { $in: emails } })
      .select('name email profileImage');

    res.json({
      success: true,
      customers
    });

  } catch (error) {
    console.error("❌ Error fetching customers by emails:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// --- Category Management ---

// Get all categories (admin view - includes inactive)
adminRouter.get("/categories", checkPermission('Category'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", sort = "-createdAt" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const categories = await Category.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create new category
adminRouter.post("/categories", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, isActive = true, key, order } = req.body;

    // Handle image upload
    let imageUrl = "/assets/default-category.png";
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
      console.log("Uploaded new category image:", imageUrl);
    }

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = new Category({
      name,
      key: key || name.toLowerCase().replace(/ /g, '-'),
      description: description || "",
      img: imageUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await category.save();

    console.log("✅ Category created successfully");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });

  } catch (error) {
    console.error("❌ Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Update category
adminRouter.put("/categories/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Handle image upload
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
      console.log("Updated category image:", updateData.img);

      // Optional: Delete old image if not default
      if (category.img && category.img !== "/assets/default-category.png") {
        const oldImagePath = path.join(__dirname, '..', category.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old image:", oldImagePath);
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("✅ Category updated successfully");

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error) {
    console.error("❌ Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Toggle category status
adminRouter.put("/categories/:id/toggle-status", checkPermission('Category'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.isActive = isActive !== undefined ? isActive : !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'enabled' : 'disabled'} successfully`,
      category
    });

  } catch (error) {
    console.error("❌ Error toggling category status:", error);
    res.status(500).json({ error: "Failed to update category status" });
  }
});

// Delete category
adminRouter.delete("/categories/:id", checkPermission('Category'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete image file if exists and is not default
    if (category.img && category.img !== "/assets/default-category.png") {
      const imagePath = path.join(__dirname, '..', category.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted category image:", imagePath);
      }
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// Get subcategories by category
adminRouter.get("/categories/:categoryId/subcategories", checkPermission('Category'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ categoryId })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Get all subcategories
adminRouter.get("/subcategories", checkPermission('Category'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      categoryId = "",
      sort = "-createdAt"
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { categoryName: { $regex: search, $options: "i" } }
      ];
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const subcategories = await Subcategory.find(query)
      .populate('categoryId', 'name key')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subcategory.countDocuments(query);

    res.json({
      success: true,
      subcategories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Create subcategory
adminRouter.post("/subcategories", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { name, categoryId, description, order, isActive } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: "Name and category are required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    // Handle image upload
    let img = "/assets/default-subcategory.png";
    if (req.file) {
      img = `/assets/${req.file.filename}`;
    }

    const key = req.body.key || name.toLowerCase().replace(/ /g, '-');

    const subcategory = new Subcategory({
      name,
      key,
      categoryId,
      categoryName: category.name,
      description: description || `Subcategory for ${name}`,
      img,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await subcategory.save();

    // Update category to mark it has subcategories
    await Category.findByIdAndUpdate(categoryId, {
      hasSubcategories: true,
      $push: { subcategories: subcategory._id }
    });

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      subcategory
    });

  } catch (error) {
    console.error("❌ Error creating subcategory:", error);
    res.status(500).json({ error: "Failed to create subcategory" });
  }
});

// Update subcategory
adminRouter.put("/subcategories/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
    }

    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    res.json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory
    });

  } catch (error) {
    console.error("❌ Error updating subcategory:", error);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
});

// Delete subcategory
adminRouter.delete("/subcategories/:id", checkPermission('Category'), async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    // Remove from parent category
    await Category.findByIdAndUpdate(subcategory.categoryId, {
      $pull: { subcategories: subcategory._id }
    });

    res.json({
      success: true,
      message: "Subcategory deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting subcategory:", error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

// --- Package Management ---

// Get all packages (admin view)
adminRouter.get("/packages", checkPermission('Product'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", category = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Package.countDocuments(query);

    res.json({
      success: true,
      packages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("❌ Error fetching packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Add new package
adminRouter.post("/packages", checkPermission('Product'), async (req, res) => {
  try {
    const newPackage = new Package({
      ...req.body,
      category: req.body.category || 'Salon for women'
    });
    await newPackage.save();
    res.status(201).json({ 
      success: true,
      message: "Package added successfully", 
      package: newPackage 
    });
  } catch (error) {
    console.error("❌ Error adding package:", error);
    res.status(500).json({ error: "Failed to add package" });
  }
});

// Update package
adminRouter.put("/packages/:id", checkPermission('Product'), async (req, res) => {
  try {
    const updatedPackage = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPackage) return res.status(404).json({ error: "Package not found" });
    res.json({ 
      success: true,
      message: "Package updated successfully", 
      package: updatedPackage 
    });
  } catch (error) {
    console.error("❌ Error updating package:", error);
    res.status(500).json({ error: "Failed to update package" });
  }
});

// Delete package
adminRouter.delete("/packages/:id", checkPermission('Product'), async (req, res) => {
  try {
    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Package not found" });
    res.json({ 
      success: true,
      message: "Package deleted successfully" 
    });
  } catch (error) {
    console.error("❌ Error deleting package:", error);
    res.status(500).json({ error: "Failed to delete package" });
  }
});

// --- Booking Management ---

// Get all bookings with filters
adminRouter.get("/bookings", checkPermission('Bookings'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      startDate = "",
      endDate = "",
      sort = "-createdAt"
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { serviceName: { $regex: search, $options: "i" } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    const totalRevenue = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$servicePrice" } }
        }
      }
    ]);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      totalRevenue: totalRevenue[0]?.total || 0
    });

  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status
adminRouter.put("/bookings/:id/status", checkPermission('Bookings'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Booking status updated",
      booking
    });

  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Delete single booking
adminRouter.delete("/bookings/:id", checkPermission('Bookings'), async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// --- Static Data Management ---

// Update static data section
adminRouter.put("/static-data/:section/:key", checkPermission('Settings'), upload.single('image'), (req, res) => {
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
            success: true,
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
          success: true,
          message: "Section updated successfully",
          section: data[section]
        });
      } else {
        res.status(500).json({ error: "Failed to update section" });
      }
    }
  } catch (error) {
    console.error('❌ Error updating section:', error);
    res.status(500).json({ error: "Failed to update section" });
  }
});

// Add to static data section
adminRouter.post("/static-data/:section", checkPermission('Settings'), upload.single('image'), (req, res) => {
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
        success: true,
        message: "Item added successfully",
        item: newItem
      });
    } else {
      res.status(500).json({ error: "Failed to add item" });
    }
  } catch (error) {
    console.error('❌ Error adding to section:', error);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Delete from static data section
adminRouter.delete("/static-data/:section/:key", checkPermission('Settings'), (req, res) => {
  try {
    const { section, key } = req.params;
    const data = readStaticData();
    if (!data || !data[section] || !Array.isArray(data[section])) {
      return res.status(404).json({ error: "Section not found or not an array" });
    }
    
    data[section] = data[section].filter(item => item.key !== key);
    
    if (writeStaticData(data)) {
      res.json({ 
        success: true,
        message: "Item deleted successfully" 
      });
    } else {
      res.status(500).json({ error: "Failed to delete item" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Update logo
adminRouter.put("/static-data/logo", checkPermission('Settings'), upload.single('logo'), (req, res) => {
  try {
    const data = readStaticData();
    if (req.file) {
      data.logo = `/assets/${req.file.filename}`;
    }
    
    if (writeStaticData(data)) {
      res.json({
        success: true,
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

// Update logo1
adminRouter.put("/static-data/logo1", checkPermission('Settings'), upload.single('logo'), (req, res) => {
  try {
    const data = readStaticData();
    if (req.file) {
      data.logo1 = `/assets/${req.file.filename}`;
    }
    
    if (writeStaticData(data)) {
      res.json({
        success: true,
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

// Upload image for static data
adminRouter.post("/static-data/upload", checkPermission('Settings'), upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imagePath = `/assets/${req.file.filename}`;
    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imagePath,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// --- Bulk Operations ---

// Bulk delete
adminRouter.post("/bulk-delete", checkPermission('Settings'), async (req, res) => {
  try {
    const { entity, ids } = req.body;

    if (!entity || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Entity type and IDs array are required"
      });
    }

    const permissionMap = {
      'users': 'Users',
      'customers': 'Customer',
      'categories': 'Category',
      'subcategories': 'Category',
      'packages': 'Product',
      'bookings': 'Bookings'
    };

    const requiredPermission = permissionMap[entity];
    if (!requiredPermission) {
      return res.status(400).json({ error: "Invalid entity type" });
    }

    let model;
    let deletedCount = 0;
    let message = "";

    switch (entity) {
      case 'users':
        model = User;
        message = "user(s)";
        break;
      case 'customers':
        model = Customer;
        message = "customer(s)";
        break;
      case 'categories':
        model = Category;
        message = "category(ies)";
        break;
      case 'subcategories':
        model = Subcategory;
        message = "subcategory(ies)";
        break;
      case 'packages':
        model = Package;
        message = "package(s)";
        break;
      case 'bookings':
        model = Booking;
        message = "booking(s)";
        break;
      default:
        return res.status(400).json({ error: "Invalid entity type" });
    }

    // Get records to handle file deletion if needed
    if (entity === 'categories') {
      const categories = await model.find({ _id: { $in: ids } });

      // Delete image files and related subcategories
      for (const category of categories) {
        if (category.img && category.img !== "/assets/default-category.png") {
          const imagePath = path.join(__dirname, '..', category.img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

        // Delete all subcategories under this category
        if (category.subcategories && category.subcategories.length > 0) {
          await Subcategory.deleteMany({ categoryId: category._id });
        }
      }
    } else if (entity === 'subcategories') {
      const subcategories = await model.find({ _id: { $in: ids } });

      // Delete image files
      subcategories.forEach(subcategory => {
        if (subcategory.img && subcategory.img !== "/assets/default-subcategory.png") {
          const imagePath = path.join(__dirname, '..', subcategory.img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }

        // Remove from parent categories
        Category.findByIdAndUpdate(subcategory.categoryId, {
          $pull: { subcategories: subcategory._id }
        }).exec();
      });
    } else if (entity === 'customers') {
      const customers = await model.find({ _id: { $in: ids } });

      // Delete profile images
      customers.forEach(customer => {
        if (customer.profileImage && customer.profileImage.startsWith('/assets/')) {
          const imagePath = path.join(__dirname, '..', customer.profileImage);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    } else if (entity === 'users') {
      const users = await model.find({ _id: { $in: ids } });

      // Delete profile images
      users.forEach(user => {
        if (user.profileImage && user.profileImage !== "/assets/default-avatar.png") {
          const imagePath = path.join(__dirname, '..', user.profileImage);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    }

    const result = await model.deleteMany({ _id: { $in: ids } });
    deletedCount = result.deletedCount;

    if (deletedCount === 0) {
      return res.status(404).json({
        error: `No ${entity} found to delete`
      });
    }

    res.json({
      success: true,
      message: `${deletedCount} ${message} deleted successfully`,
      deletedCount
    });

  } catch (error) {
    console.error(`❌ Error bulk deleting ${entity}:`, error);
    res.status(500).json({
      error: `Failed to delete ${entity}`
    });
  }
});

// ==============================
// MOUNT ROUTERS
// ==============================

app.use("/api/auth", authRouter);           // Authentication routes
app.use("/api/public", publicRouter);       // Public routes (no auth)
app.use("/api/customer", customerRouter);   // Customer routes (customer auth)
app.use("/api/user", userRouter);           // User routes (staff auth)
app.use("/api/admin", adminRouter);         // Admin routes (admin auth)

// ==============================
// DEBUG & HEALTH ROUTES
// ==============================

// Debug endpoint
app.get("/api/debug-categories", async (req, res) => {
  try {
    console.log("=== DEBUG: Checking MongoDB categories ===");

    const allCategories = await Category.find({});
    console.log(`Found ${allCategories.length} total categories in DB:`);

    if (allCategories.length === 0) {
      console.log("Database has NO categories at all!");
    } else {
      allCategories.forEach(cat => {
        console.log(`- ID: ${cat._id}`);
        console.log(`  Name: ${cat.name}`);
        console.log(`  Key: ${cat.key}`);
        console.log(`  Active: ${cat.isActive}`);
        console.log(`  Image: ${cat.img}`);
        console.log(`  Created: ${cat.createdAt}`);
        console.log(`---`);
      });
    }

    const activeCategories = await Category.find({ isActive: true });
    console.log(`Found ${activeCategories.length} active categories`);

    res.json({
      success: true,
      allCategories,
      activeCategories,
      total: allCategories.length,
      active: activeCategories.length,
      message: allCategories.length === 0 ? "Database is empty." : "OK"
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug routes for development
app.get('/api/debug/all-bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log(`Total bookings in database: ${bookings.length}`);
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/all-customers', async (req, res) => {
  try {
    const customers = await Customer.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Total customers in database: ${customers.length}`);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/debug/all-users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Total users in database: ${users.length}`);
    res.json(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==============================
// ERROR HANDLING
// ==============================

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  console.error('❌ Server error:', error);
  res.status(500).json({ error: error.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});