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

// ==================== MODELS DEFINITION ====================

// User Schema
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
    Catalog: { type: Boolean, default: false },
    Product: { type: Boolean, default: false },
    Bookings: { type: Boolean, default: false },
    Reports: { type: Boolean, default: false },
    Settings: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

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
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model("Customer", customerSchema);

// Category Schema
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

// Subcategory Schema
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

// Package Schema
const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  rating: { type: String, default: "4.5" },
  bookings: { type: String, default: "100+" },
  price: { type: String, required: true },
  originalPrice: { type: String },
  duration: { type: String, required: true },
  description: { type: String },
  img: { type: String, default: "" },
  category: { type: String, required: true },
  subcategory: { type: String },
  subcategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  },
  items: [{
    name: { type: String },
    description: { type: String }
  }],
  content: [{
    title: { type: String },
    description: { type: String }
  }],
  ratingBreak: [{
    stars: { type: Number, default: 5 },
    value: { type: Number, default: 100 },
    count: { type: String, default: "100+" }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Package = mongoose.models.Package || mongoose.model("Package", packageSchema);
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

// JWT Authentication Middleware with better error handling
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
      expired: false
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access denied. No token provided.",
      expired: false
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: "Session expired. Please login again.",
        expired: true
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: "Invalid token.",
        expired: false
      });
    } else {
      return res.status(401).json({
        success: false,
        error: "Authentication failed.",
        expired: false
      });
    }
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
// ==================== ADMIN LOGIN ====================

// Admin Login with JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Admin/User login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // 1. Check Admin Collection
    const admin = await Admin.findOne({ email });

    if (admin) {
      // --- Handle Admin Login ---
      if (!admin.isActive) {
        return res.status(400).json({ error: "Account is deactivated" });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwt.sign(
        {
          id: admin._id,
          email: admin.email,
          role: 'admin',
          permissions: {
            Dashboard: true,
            Users: true,
            Customer: true,
            Catalog: true,
            Product: true,
            Bookings: true,
            Reports: true,
            Settings: true
          }
        },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        success: true,
        message: "Admin login successful",
        token,
        role: 'admin',
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: {
            Dashboard: true,
            Users: true,
            Customer: true,
            Catalog: true,
            Product: true,
            Bookings: true,
            Reports: true,
            Settings: true
          }
        }
      });
    }

    // 2. Check User Collection (if not Admin)
    const user = await User.findOne({ email });

    if (user) {
      // --- Handle User Login ---
      if (!user.isActive) {
        return res.status(400).json({ error: "Account is deactivated" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          role: 'user',
          profileImage: user.profileImage,
          permissions: user.permissions
        },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.json({
        success: true,
        message: "User login successful",
        token,
        role: 'user',
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
    }

    // 3. Neither found
    return res.status(400).json({ error: "Invalid email or password" });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// User Login with JWT
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
      { expiresIn: '2h' }
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

// Get customers by emails for booking profiles (Helper for Booking Management)
router.post("/customers-by-emails", async (req, res) => {
  try {
    // No explicit permission check needed; verifyToken is sufficient.
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Emails array is required" });
    }

    const customers = await Customer.find({
      email: { $in: emails }
    }).select('name email profileImage');

    res.json({
      success: true,
      customers
    });
  } catch (error) {
    console.error("Error fetching customers by emails:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// ==================== PACKAGE ROUTES ====================

// Create new package
router.post("/packages", checkPermission('Product'), upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      title,
      description,
      category,
      subcategory,
      subcategoryId,
      price,
      originalPrice,
      rating,
      bookings,
      duration,
      stock,
      isActive,
      items,
      content,
      ratingBreak
    } = req.body;

    // Validation
    if (!name || !category || !price || !duration) {
      return res.status(400).json({
        success: false,
        error: "Name, category, price, and duration are required"
      });
    }

    // Auto-generate title if not provided
    let displayTitle = title;
    if (!displayTitle && subcategory) {
      displayTitle = `${subcategory} - ${name}`;
    } else if (!displayTitle) {
      displayTitle = name;
    }

    // Filter empty items
    const filteredItems = items ? items.filter(item =>
      item.name && item.name.trim() || item.description && item.description.trim()
    ) : [];

    const filteredContent = content ? content.filter(cont =>
      cont.title && cont.title.trim() || cont.description && cont.description.trim()
    ) : [];

    // Create package
    const newPackage = new Package({
      name: name.trim(),
      title: displayTitle.trim(),
      description: description || "",
      category,
      subcategory: subcategory || null,
      subcategoryId: subcategoryId || null,
      price: price.toString(),
      originalPrice: originalPrice || price.toString(),
      rating: rating || "4.5",
      bookings: bookings || "100+",
      duration,
      stock: parseInt(stock) || 0,
      isActive: isActive !== undefined ? isActive : true,
      items: filteredItems.length > 0 ? filteredItems : [{ name: 'Service included', description: '' }],
      content: filteredContent,
      ratingBreak: ratingBreak || [{ stars: 5, value: 100, count: "100+" }],
      img: req.file ? `/assets/${req.file.filename}` : "",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newPackage.save();

    console.log(`Package created: ${newPackage.name} (${newPackage._id})`);

    res.status(201).json({
      success: true,
      message: "Package created successfully",
      package: newPackage
    });

  } catch (error) {
    console.error("Error creating package:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Package with this name already exists"
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create package"
    });
  }
});

// Get all packages with filters
router.get("/packages", checkPermission('Product'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      category = "",
      subcategory = "",
      isActive
    } = req.query;

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const packages = await Package.find(query)
      .populate('subcategoryId', 'name key')
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
    res.status(500).json({
      success: false,
      error: "Failed to fetch packages"
    });
  }
});

// Get single package - FIXED: Changed 'package' variable name to 'packageData'
router.get("/packages/:id", checkPermission('Product'), async (req, res) => {
  try {
    const { id } = req.params;
    const packageData = await Package.findById(id)  // Changed from 'package' to 'packageData'
      .populate('subcategoryId', 'name key');

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    res.json({
      success: true,
      package: packageData  // Return as 'package' in response but use 'packageData' in code
    });

  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch package"
    });
  }
});

// Update package
router.put("/packages/:id", checkPermission('Product'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if package exists
    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    // Auto-generate title if name or subcategory changes
    if (updateData.name || updateData.subcategory) {
      const newName = updateData.name || existingPackage.name;
      const newSubcategory = updateData.subcategory || existingPackage.subcategory;

      if (!updateData.title && newSubcategory) {
        updateData.title = `${newSubcategory} - ${newName}`;
      } else if (!updateData.title) {
        updateData.title = newName;
      }
    }

    // Filter empty items
    if (updateData.items) {
      updateData.items = updateData.items.filter(item =>
        item.name && item.name.trim() || item.description && item.description.trim()
      );
      if (updateData.items.length === 0) {
        updateData.items = [{ name: 'Service included', description: '' }];
      }
    }

    // Filter empty content
    if (updateData.content) {
      updateData.content = updateData.content.filter(cont =>
        cont.title && cont.title.trim() || cont.description && cont.description.trim()
      );
    }

    // Handle image update
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;

      // Optional: Delete old image
      if (existingPackage.img && existingPackage.img.startsWith('/assets/')) {
        const oldImagePath = path.join(__dirname, existingPackage.img);
        if (fs.existsSync(oldImagePath)) {
          // fs.unlinkSync(oldImagePath); // Careful with deleting in case of shared images
        }
      }
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('subcategoryId', 'name key');

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    console.log(`Package updated: ${updatedPackage.name} (${updatedPackage._id})`);

    res.json({
      success: true,
      message: "Package updated successfully",
      package: updatedPackage
    });

  } catch (error) {
    console.error("Error updating package:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update package"
    });
  }
});

// Toggle package status - FIXED: Changed 'package' variable name to 'packageData'
router.put("/packages/:id/toggle-status", checkPermission('Product'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const packageData = await Package.findById(id);  // Changed from 'package' to 'packageData'
    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    packageData.isActive = isActive !== undefined ? isActive : !packageData.isActive;  // Updated reference
    packageData.updatedAt = new Date();  // Updated reference
    await packageData.save();  // Updated reference

    console.log(`Package ${packageData.isActive ? 'activated' : 'deactivated'}: ${packageData.name}`);  // Updated reference

    res.json({
      success: true,
      message: `Package ${packageData.isActive ? 'enabled' : 'disabled'} successfully`,  // Updated reference
      package: packageData  // Updated reference
    });

  } catch (error) {
    console.error("Error toggling package status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update package status"
    });
  }
});

// Upload package image
router.post("/packages/:id/upload-image", checkPermission('Product'), upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image uploaded"
      });
    }

    const imgPath = `/assets/${req.file.filename}`;

    // Find package and update image
    const packageData = await Package.findByIdAndUpdate(
      id,
      { img: imgPath, updatedAt: new Date() },
      { new: true }
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imgPath,
      package: packageData
    });

  } catch (error) {
    console.error("Error uploading package image:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload image"
    });
  }
});

// Delete package
router.delete("/packages/:id", checkPermission('Product'), async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPackage = await Package.findByIdAndDelete(id);
    if (!deletedPackage) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    console.log(`Package deleted: ${deletedPackage.name} (${deletedPackage._id})`);

    res.json({
      success: true,
      message: "Package deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete package"
    });
  }
});
// ==================== OTHER ROUTES (keeping existing routes) ====================

// Get Admin Profile
router.get("/profile", async (req, res) => {
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

// Get User Profile
router.get("/user-profile", async (req, res) => {
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
router.get("/dashboard", async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalBookings = await mongoose.model("Booking").countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalPackages = await Package.countDocuments();

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

// Get all users with pagination
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

// Get single user
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

// Create new user WITH PROFILE IMAGE UPLOAD
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
        Catalog: false,
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

// Update user WITH PROFILE IMAGE UPLOAD
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

// Toggle user status
router.put("/users/:id/toggle-status", checkPermission('Users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Default to true if undefined
    const currentStatus = user.isActive !== undefined ? user.isActive : true;
    user.isActive = isActive !== undefined ? isActive : !currentStatus;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user
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

// Toggle customer status
router.put("/customers/:id/toggle-status", checkPermission('Customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Customer schema doesn't have isActive by default, verify schema
    // Assuming we added it or using isVerified?
    // Step 489 showed customerSchema: isVerified: boolean, default: true. 
    // It did NOT show isActive. But UserManagement implies isActive.
    // If schema lacks isActive, it won't save.
    // I should check schema again. Step 489 Lines 87-98.
    // 95: isVerified.
    // No isActive.
    // But Admin panel expects Active/Inactive.
    // I should add isActive to Customer schema first!

    // Wait, let's assume I should update Schema first if needed.
    // Or map isActive to isVerified?
    // Usually 'Active' means 'Allowed to login'. 'Verified' means 'Email checked'.
    // If I map to isVerified, toggling it handles that.
    // But better to add isActive.

    // I'll update schema AND add route.

    // Default to true if undefined
    const currentStatus = customer.isActive !== undefined ? customer.isActive : true;
    customer.isActive = isActive !== undefined ? isActive : !currentStatus;
    await customer.save();

    res.json({
      success: true,
      message: `Customer ${customer.isActive ? 'unblocked' : 'blocked'} successfully`,
      customer
    });

  } catch (error) {
    console.error("Error toggling customer status:", error);
    res.status(500).json({ error: "Failed to update customer status" });
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
// Categories routes
router.get("/categories", checkPermission('Catalog'), async (req, res) => {
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
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create new category WITH image upload
router.post("/categories", checkPermission('Category'), upload.single('image'), async (req, res) => {
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

    console.log("Category created successfully");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });

  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// Update category
router.put("/categories/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
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

    console.log("Category updated successfully");

    res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Toggle category status
router.put("/categories/:id/toggle-status", checkPermission('Category'), async (req, res) => {
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
    console.error("Error toggling category status:", error);
    res.status(500).json({ error: "Failed to update category status" });
  }
});

// Delete category
router.delete("/categories/:id", checkPermission('Category'), async (req, res) => {
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
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
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
      'users': 'Users',
      'customers': 'Customer',
      'categories': 'Category',
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
      case 'packages':
        model = Package;
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
    if (entity === 'categories') {
      const categories = await model.find({ _id: { $in: ids } });

      // Delete image files
      categories.forEach(category => {
        if (category.img && category.img !== "/assets/default-category.png") {
          const imagePath = path.join(__dirname, '..', category.img);
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

// Get subcategories by category
router.get("/categories/:categoryId/subcategories", checkPermission('Category'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ categoryId })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Create subcategory
router.post("/subcategories", checkPermission('Category'), upload.single('image'), async (req, res) => {
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
    console.error("Error creating subcategory:", error);
    res.status(500).json({ error: "Failed to create subcategory" });
  }
});

// Update subcategory
router.put("/subcategories/:id", checkPermission('Category'), upload.single('image'), async (req, res) => {
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
    console.error("Error updating subcategory:", error);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
});

// Delete subcategory
router.delete("/subcategories/:id", checkPermission('Category'), async (req, res) => {
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
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

router.get("/subcategories", checkPermission('Catalog'), async (req, res) => {
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
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// In your adminRoutes.js file, ensure the subcategories API properly filters by category name
// Add this route for better category-based filtering:

router.get("/subcategories-by-category/:categoryName", checkPermission('Catalog'), async (req, res) => {
  try {
    const { categoryName } = req.params;

    const subcategories = await Subcategory.find({
      categoryName: categoryName,
      isActive: true
    })
      .sort({ order: 1, name: 1 });

    res.json({
      success: true,
      subcategories: subcategories || [],
      count: subcategories ? subcategories.length : 0
    });
  } catch (error) {
    console.error("Error fetching subcategories by category:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});
// Get subcategories by category
router.get("/categories/:categoryId/subcategories", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await Subcategory.find({ categoryId })
      .populate('categoryId', 'name key')
      .sort({ order: 1, name: 1 });

    const category = await Category.findById(categoryId);

    res.json({
      success: true,
      subcategories,
      categoryName: category?.name || 'Unknown'
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Get single subcategory
router.get("/subcategories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const subcategory = await Subcategory.findById(id)
      .populate('categoryId', 'name key');

    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    res.json({
      success: true,
      subcategory
    });

  } catch (error) {
    console.error("Error fetching subcategory:", error);
    res.status(500).json({ error: "Failed to fetch subcategory" });
  }
});

// Create subcategory WITH image upload
router.post("/subcategories", upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      categoryId,
      description,
      key,
      order = 0,
      isActive = true
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: "Name and category are required" });
    }

    // Check if parent category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    // Check if subcategory already exists
    const existingSubcategory = await Subcategory.findOne({
      $or: [
        { key: key || name.toLowerCase().replace(/ /g, '-'), },
        { name: name, categoryId: categoryId }
      ]
    });

    if (existingSubcategory) {
      return res.status(400).json({
        error: "Subcategory with this name or key already exists in this category"
      });
    }

    // Handle image upload
    let img = "/assets/default-subcategory.png";
    if (req.file) {
      img = `/assets/${req.file.filename}`;
      console.log("Subcategory image uploaded:", img);
    }

    const subcategory = new Subcategory({
      name,
      key: key || name.toLowerCase().replace(/ /g, '-'),
      categoryId,
      categoryName: category.name,
      description: description || `Subcategory for ${name}`,
      img,
      order: parseInt(order),
      isActive: isActive !== undefined ? isActive : true
    });

    await subcategory.save();

    // Update parent category
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
    console.error("Error creating subcategory:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Subcategory key already exists" });
    }
    res.status(500).json({ error: "Failed to create subcategory" });
  }
});

// Update subcategory WITH image upload
router.put("/subcategories/:id", upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    // Handle image upload
    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;
      console.log("Updated subcategory image:", updateData.img);

      // Delete old image if not default
      if (subcategory.img && subcategory.img !== "/assets/default-subcategory.png") {
        const oldImagePath = path.join(__dirname, '..', subcategory.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Deleted old subcategory image:", oldImagePath);
        }
      }
    }

    // Update category name if category changes
    if (updateData.categoryId && updateData.categoryId !== subcategory.categoryId.toString()) {
      const newCategory = await Category.findById(updateData.categoryId);
      if (newCategory) {
        updateData.categoryName = newCategory.name;

        // Remove from old category and add to new category
        await Category.findByIdAndUpdate(subcategory.categoryId, {
          $pull: { subcategories: subcategory._id }
        });

        await Category.findByIdAndUpdate(updateData.categoryId, {
          hasSubcategories: true,
          $push: { subcategories: subcategory._id }
        });
      }
    }

    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name key');

    res.json({
      success: true,
      message: "Subcategory updated successfully",
      subcategory: updatedSubcategory
    });

  } catch (error) {
    console.error("Error updating subcategory:", error);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
});

// Toggle subcategory status
router.put("/subcategories/:id/toggle-status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    subcategory.isActive = isActive !== undefined ? isActive : !subcategory.isActive;
    await subcategory.save();

    res.json({
      success: true,
      message: `Subcategory ${subcategory.isActive ? 'enabled' : 'disabled'} successfully`,
      subcategory
    });

  } catch (error) {
    console.error("Error toggling subcategory status:", error);
    res.status(500).json({ error: "Failed to update subcategory status" });
  }
});

// Delete subcategory
router.delete("/subcategories/:id", async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: "Subcategory not found" });
    }

    // Delete image file if exists and is not default
    if (subcategory.img && subcategory.img !== "/assets/default-subcategory.png") {
      const imagePath = path.join(__dirname, '..', subcategory.img);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Deleted subcategory image:", imagePath);
      }
    }

    // Remove from parent category
    await Category.findByIdAndUpdate(subcategory.categoryId, {
      $pull: { subcategories: subcategory._id }
    });

    // Update any packages using this subcategory
    await Package.updateMany(
      { subcategoryId: subcategory._id },
      {
        $unset: { subcategoryId: "", subcategory: "" },
        category: subcategory.categoryName
      }
    );

    await Subcategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Subcategory deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting subcategory:", error);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

// Bulk delete subcategories
router.post("/subcategories/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: "Subcategory IDs array is required"
      });
    }

    // Get subcategories to be deleted
    const subcategories = await Subcategory.find({ _id: { $in: ids } });

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

    // Update packages
    await Package.updateMany(
      { subcategoryId: { $in: ids } },
      {
        $unset: { subcategoryId: "", subcategory: "" }
      }
    );

    const result = await Subcategory.deleteMany({ _id: { $in: ids } });
    const deletedCount = result.deletedCount;

    if (deletedCount === 0) {
      return res.status(404).json({
        error: "No subcategories found to delete"
      });
    }

    res.json({
      success: true,
      message: `${deletedCount} subcategory(ies) deleted successfully`,
      deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting subcategories:", error);
    res.status(500).json({
      error: "Failed to delete subcategories"
    });
  }
});

// Add this route for toggling package status - NEW ROUTE
router.put("/packages/:id/status", checkPermission('Product'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const packageData = await Package.findById(id);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        error: "Package not found"
      });
    }

    packageData.isActive = isActive !== undefined ? isActive : !packageData.isActive;
    packageData.updatedAt = new Date();
    await packageData.save();

    console.log(`Package ${packageData.isActive ? 'activated' : 'deactivated'}: ${packageData.name}`);

    res.json({
      success: true,
      message: `Package ${packageData.isActive ? 'enabled' : 'disabled'} successfully`,
      package: packageData
    });

  } catch (error) {
    console.error("Error toggling package status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update package status"
    });
  }
});
// Bulk block/unblock customers
router.post("/customers/bulk-block", checkPermission('Customer'), async (req, res) => {
  try {
    const { ids, isActive } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Customer IDs array is required"
      });
    }

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: "isActive status is required"
      });
    }

    const action = isActive ? 'unblocked' : 'blocked';

    // Update all customers
    const result = await Customer.updateMany(
      { _id: { $in: ids } },
      { $set: { isActive: isActive, updatedAt: new Date() } }
    );

    console.log(`Bulk ${action} ${result.modifiedCount} customers`);

    res.json({
      success: true,
      message: `${result.modifiedCount} customer(s) ${action} successfully`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error(`Error bulk ${isActive ? 'unblocking' : 'blocking'} customers:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to ${isActive ? 'unblock' : 'block'} customers`
    });
  }
});

// Toggle customer status - UPDATED
router.put("/customers/:id/toggle-status", checkPermission('Customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: "isActive status is required"
      });
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found"
      });
    }

    customer.isActive = isActive;
    customer.updatedAt = new Date();
    await customer.save();

    const action = isActive ? 'unblocked' : 'blocked';
    console.log(`Customer ${action}: ${customer.email}`);

    res.json({
      success: true,
      message: `Customer ${action} successfully`,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        isActive: customer.isActive
      }
    });

  } catch (error) {
    console.error("Error toggling customer status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update customer status"
    });
  }
});
export default router;