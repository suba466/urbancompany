import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const router = express.Router();
const JWT_SECRET = "your-jwt-secret-key-change-this";

// __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// User Schema with profileImage field (Changed from Staff to User)
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
    Users: { type: Boolean, default: false }, // Changed from Staff to Users
    Customer: { type: Boolean, default: false },
    Category: { type: Boolean, default: false },
    Product: { type: Boolean, default: false },
    Bookings: { type: Boolean, default: false },
    Reports: { type: Boolean, default: false },
    Settings: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema); // Changed from Staff to User

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model("Admin", adminSchema);

// Customer Schema
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

const Customer = mongoose.model("Customer", customerSchema);


// In adminRoutes.js, fix the SubCategory schema
const subCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  img: { type: String, default: "/assets/default-category.png" },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const SubCategory = mongoose.model("SubCategory", subCategorySchema);
// Initialize default admin
export const initializeAdmin = async () => {
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
      console.log("Default admin created: admin@urbancompany.com / admin123");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

// ==================== AUTHENTICATION MIDDLEWARE ====================

// JWT Authentication Middleware
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

// Permission checking middleware
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }

    // User needs specific permission
    if (req.user.role === 'user' && req.user.permissions && req.user.permissions[permission]) {
      return next();
    }

    return res.status(403).json({ error: "You don't have permission to access this resource" });
  };
};

// ==================== PUBLIC ROUTES (NO AUTH NEEDED) ====================

// Admin Login with JWT
router.post("/login", async (req, res) => {
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
          Users: true, // Changed from Staff to Users
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

    console.log(`Admin logged in: ${email}`);

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
          Users: true, // Changed from Staff to Users
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
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// User Login with JWT (Changed from staff-login to user-login)
router.post("/user-login", async (req, res) => {
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

    console.log(`User logged in: ${email}`);

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
    console.error("Error in user login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Apply JWT authentication middleware to all routes below
router.use(verifyToken);

// Get Admin Profile
router.get("/profile", checkPermission('Dashboard'), async (req, res) => {
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
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ error: "Failed to fetch admin profile" });
  }
});

// Get User Profile (Changed from staff-profile to user-profile)
router.get("/user-profile", checkPermission('Dashboard'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
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
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Admin Dashboard Statistics
router.get("/dashboard", checkPermission('Dashboard'), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalBookings = await mongoose.model("Booking").countDocuments();
    const totalCategories = await mongoose.model("Service").countDocuments();
    const totalPackages = await mongoose.model("Package").countDocuments();
    
    const totalRevenue = await mongoose.model("Booking").aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$servicePrice" } }
        }
      }
    ]);

    // Get recent bookings with customer details
    const recentBookings = await mongoose.model("Booking").find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Get customer emails from bookings
    const customerEmails = recentBookings.map(b => b.customerEmail);
    
    // Get customers with profile images
    const customers = await Customer.find({ email: { $in: customerEmails } })
      .select('email name profileImage')
      .lean();
    
    // Create a customer map for quick lookup
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.email] = {
        name: customer.name,
        profileImage: customer.profileImage
      };
    });
    
    // Add customer details to bookings
    const recentBookingsWithCustomerDetails = recentBookings.map(booking => {
      const customerDetails = customerMap[booking.customerEmail] || {};
      return {
        ...booking,
        customerName: customerDetails.name || booking.customerName,
        customerProfileImage: customerDetails.profileImage || ''
      };
    });
    
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email phone city profileImage createdAt');

    const monthlyRevenue = await mongoose.model("Booking").aggregate([
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

    const topServices = await mongoose.model("Booking").aggregate([
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
      recentBookings: recentBookingsWithCustomerDetails,
      recentCustomers,
      monthlyRevenue,
      topServices
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get all users with pagination (Changed from staff to users)
router.get("/users", checkPermission('Users'), async (req, res) => {
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
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get single user (Changed from staff to user)
router.get("/users/:id", checkPermission('Users'), async (req, res) => {
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
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user WITH PROFILE IMAGE UPLOAD (Changed from staff to user)
router.post("/users", checkPermission('Users'), upload.single('profileImage'), async (req, res) => {
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
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user WITH PROFILE IMAGE UPLOAD (Changed from staff to user)
router.put("/users/:id", checkPermission('Users'), upload.single('profileImage'), async (req, res) => {
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
      const emailExists = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/assets/${req.file.filename}`;
      console.log("Profile image updated:", updateData.profileImage);
      
      // Delete old image if not default
      if (existingUser.profileImage && existingUser.profileImage !== "/assets/default-avatar.png") {
        const oldImagePath = path.join(__dirname, '..', existingUser.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old profile image:", oldImagePath);
        }
      }
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
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (Changed from staff to user)
router.delete("/users/:id", checkPermission('Users'), async (req, res) => {
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
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get customers by emails
router.post("/customers-by-emails", checkPermission('Customer'), async (req, res) => {
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
    console.error("Error fetching customers by emails:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get all customers with pagination
router.get("/customers", checkPermission('Customer'), async (req, res) => {
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
      .select('name email phone city profileImage createdAt password')
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
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get single customer
router.get("/customers/:id", checkPermission('Customer'), async (req, res) => {
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
    console.error("Error fetching customer:", error);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Update customer
router.put("/customers/:id", checkPermission('Customer'), upload.single('profileImage'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Don't allow email update to existing email
    if (updateData.email && updateData.email !== customer.email) {
      const emailExists = await Customer.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/assets/${req.file.filename}`;
      console.log("Profile image updated:", updateData.profileImage);
      
      // Delete old image if exists
      if (customer.profileImage && customer.profileImage.startsWith('/assets/')) {
        const oldImagePath = path.join(__dirname, '..', customer.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old profile image:", oldImagePath);
        }
      }
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
    console.error("Error updating customer:", error);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete customer
router.delete("/customers/:id", checkPermission('Customer'), async (req, res) => {
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
    console.error("Error deleting customer:", error);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

// Services (Categories) routes
router.get("/services", checkPermission('Category'), async (req, res) => {
  try {
    const Service = mongoose.model("Service");
    const { page = 1, limit = 20, search = "", sort="-createdAt"} = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    const services = await Service.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Create new service WITH image upload
router.post("/services", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, isActive = true, key } = req.body;

    // Handle image upload
    let imageUrl = "/assets/default-category.png";
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
      console.log("Uploaded new category image:", imageUrl);
    }

    if (!name) {
      return res.status(400).json({ error: "Service name is required" });
    }

    const Service = mongoose.model("Service");
    const service = new Service({
      name,
      key: key || name.toLowerCase().replace(/ /g, '-'),
      description: description || "",
      img: imageUrl,
      isActive: isActive !== undefined ? isActive : true
    });

    await service.save();

    console.log("Service created successfully");

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service
    });

  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service" });
  }
});

router.put("/services/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const Service = mongoose.model("Service");
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Handle image upload
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
      console.log("Updated category image:", updateData.img);
      
      // Optional: Delete old image if not default
      if (service.img && service.img !== "/assets/default-category.png") {
        const oldImagePath = path.join(__dirname, '..', service.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old image:", oldImagePath);
        }
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("Service updated successfully");

    res.json({
      success: true,
      message: "Service updated successfully",
      service: updatedService
    });

  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// Toggle service status
router.put("/services/:id/toggle-status", checkPermission('Category'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const Service = mongoose.model("Service");
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    
    service.isActive = isActive !== undefined ? isActive : !service.isActive;
    await service.save();
    
    res.json({
      success: true,
      message: `Service ${service.isActive ? 'enabled' : 'disabled'} successfully`,
      service
    });
    
  } catch (error) {
    console.error("Error toggling service status:", error);
    res.status(500).json({ error: "Failed to update service status" });
  }
});

// Delete service
router.delete("/services/:id", checkPermission('Category'), async (req, res) => {
  try {
    const Service = mongoose.model("Service");
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Delete image file if exists and is not default
    if (service.img && service.img !== "/assets/default-category.png") {
      const imagePath = path.join(__dirname, '..', service.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted service image:", imagePath);
      }
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ 
      success: true,
      message: "Service deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// Get all bookings with filters
router.get("/bookings", checkPermission('Bookings'), async (req, res) => {
  try {
    const Booking = mongoose.model("Booking");
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
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status
router.put("/bookings/:id/status", checkPermission('Bookings'), async (req, res) => {
  try {
    const Booking = mongoose.model("Booking");
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
    console.error("Error updating booking status:", error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

// Delete single booking
router.delete("/bookings/:id", checkPermission('Bookings'), async (req, res) => {
  try {
    const Booking = mongoose.model("Booking");
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
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// Get all packages
router.get("/packages", checkPermission('Product'), async (req, res) => {
  try {
    const Package = mongoose.model("Package");
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
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Bulk delete
router.post("/bulk-delete", async (req, res) => {
  try {
    const { entity, ids } = req.body;
    
    if (!entity || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: "Entity type and IDs array are required" 
      });
    }

    // Check permission based on entity
    const permissionMap = {
      'users': 'Users', // Changed from 'staff' to 'users'
      'customers': 'Customer',
      'services': 'Category',
      'packages': 'Product',
      'bookings': 'Bookings'
    };

    const requiredPermission = permissionMap[entity];
    if (!requiredPermission) {
      return res.status(400).json({ error: "Invalid entity type" });
    }

    // Admin bypasses permission check
    if (req.user.role !== 'admin') {
      if (!req.user.permissions || !req.user.permissions[requiredPermission]) {
        return res.status(403).json({ error: "You don't have permission to delete this entity" });
      }
    }

    let model;
    let deletedCount = 0;
    let message = "";

    switch(entity) {
      case 'users': // Changed from 'staff'
        model = User; // Changed from Staff to User
        message = "user(s)"; // Changed from staff member(s)
        break;
      case 'customers':
        model = Customer;
        message = "customer(s)";
        break;
      case 'services':
        model = mongoose.model("Service");
        message = "service(s)";
        break;
      case 'packages':
        model = mongoose.model("Package");
        message = "package(s)";
        break;
      case 'bookings':
        model = mongoose.model("Booking");
        message = "booking(s)";
        break;
      default:
        return res.status(400).json({ error: "Invalid entity type" });
    }

    // Get records to handle file deletion if needed
    if (entity === 'services') {
      const services = await model.find({ _id: { $in: ids } });
      
      // Delete image files
      services.forEach(service => {
        if (service.img && service.img !== "/assets/default-category.png") {
          const imagePath = path.join(__dirname, '..', service.img);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
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
    console.error(`Error bulk deleting ${entity}:`, error);
    res.status(500).json({ 
      error: `Failed to delete ${entity}` 
    });
  }
});

router.get("/subcategories", checkPermission('Category'), async (req, res) => {
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

    const subcategories = await SubCategory.find(query)
      .populate('parentCategory', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubCategory.countDocuments(query);

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
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Create subcategory
router.post("/subcategories", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, parentCategory, order, isActive } = req.body;

    if (!name || !parentCategory) {
      return res.status(400).json({ error: "Name and parent category are required" });
    }

    // Handle image upload
    let imageUrl = "/assets/default-category.png";
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
    }

    const subcategory = new SubCategory({
      name,
      description: description || "",
      parentCategory,
      img: imageUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await subcategory.save();

    // Populate parent category name for response
    await subcategory.populate('parentCategory', 'name');

    res.status(201).json({
      success: true,
      message: "Sub-category created successfully",
      subcategory
    });

  } catch (error) {
    console.error("Error creating subcategory:", error);
    res.status(500).json({ error: "Failed to create subcategory" });
  }
});

// Update subcategory
router.put("/subcategories/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subcategory = await SubCategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ error: "Sub-category not found" });
    }

    // Handle image upload
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
      
      // Delete old image if not default
      if (subcategory.img && subcategory.img !== "/assets/default-category.png") {
        const oldImagePath = path.join(__dirname, '..', subcategory.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    res.json({
      success: true,
      message: "Sub-category updated successfully",
      subcategory: updatedSubCategory
    });

  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
});

// Delete subcategory
router.delete("/subcategories/:id", checkPermission('Category'), async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await SubCategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ error: "Sub-category not found" });
    }

    // Delete image if not default
    if (subcategory.img && subcategory.img !== "/assets/default-category.png") {
      const imagePath = path.join(__dirname, '..', subcategory.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await SubCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Sub-category deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

export default router;