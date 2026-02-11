import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import adminRoutes from "./adminRoutes.js";

const app = express();
const PORT = 5000;
const JWT_SECRET = "your-jwt-secret-key-change-this";

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
    console.log(" MongoDB connected successfully");
  })
  .catch(err => console.error(" MongoDB connection error:", err));

// Add this to your existing Package schema in server.js
const packageSchema = new mongoose.Schema({
  name: String,           // Product name (e.g., "Premium Hair Care Package")
  title: String,          // Display title (can be same as name or custom)
  rating: String,         // "4.82"
  bookings: String,       // "1.5M"
  price: String,          // "₹868"
  originalPrice: String,  // "₹938"
  duration: String,       // "90 mins"
  description: String,    // Detailed description
  img: String,            // Package image
  category: String,       // Main category (e.g., "Salon for women")
  subcategory: String,    // Subcategory name (e.g., "Hair Care")
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  items: [{
    name: String,         // Service item name (e.g., "Hair Wash")
    description: String   // Item description
  }],
  content: [{
    title: String,        // Content title
    description: String   // Content details
  }],
  ratingBreak: [{
    stars: Number,        // 5
    value: Number,        // 100
    count: String         // "1.5M"
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
  items: [{
    name: String,
    description: String
  }],
  name: String, // Add this field for service name
  customerEmail: String, // Add this to link cart to customer
  createdAt: { type: Date, default: Date.now }
});

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

// Category Schema (Updated with subcategories)
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

// Update your customerSchema in server.js around line 200
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

// Booking Schema - Updated with cart items
const bookingSchema = new mongoose.Schema({
  customerId: String,
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
  // Cart items from booking
  cartItems: [{
    productId: String,
    name: String,
    title: String,
    price: String,
    originalPrice: String,
    count: Number,
    content: [{ value: String, details: String }],
    items: [{ name: String, description: String }],
    category: String
  }],
  // Individual service items
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

const Customer = mongoose.models.Customer || mongoose.model("Customer", customerSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

// Admin Routes
app.use("/api/admin", adminRoutes);

// ==================== UPDATED BOOKING ROUTES ====================

// Create new booking with cart items
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      customerId,
      customerEmail,
      customerName,
      customerPhone,
      customerCity,
      serviceName,
      servicePrice,
      originalPrice,
      address,
      scheduledDate,
      scheduledTime,
      items,
      cartItems, // Add this parameter
      slotExtraCharge,
      tipAmount,
      taxAmount,
      paymentMethod
    } = req.body;

    console.log(" Received booking data:", {
      customerEmail,
      serviceName,
      servicePrice,
      itemsCount: items ? items.length : 0,
      cartItemsCount: cartItems ? cartItems.length : 0,
      hasCartItems: !!cartItems
    });

    if (!customerEmail) {
      return res.status(400).json({ error: "Customer email is required" });
    }

    // Prepare booking items - use cartItems if available
    let bookingItems = [];
    let bookingCartItems = [];
    let finalServiceName = serviceName || "Multiple Services";
    let finalServicePrice = servicePrice || "0";

    if (cartItems && cartItems.length > 0) {
      console.log("Processing cart items for booking:", cartItems);

      // Save cart items for reference
      bookingCartItems = cartItems.map(item => ({
        productId: item.productId || item._id,
        name: item.name || item.title || "Service",
        title: item.title || item.name || "Service",
        price: item.price || "0",
        originalPrice: item.originalPrice || item.price || "0",
        count: item.count || 1,
        content: item.content || [],
        items: item.items || [],
        category: item.category || "General"
      }));

      // Convert cart items to service items format
      bookingItems = cartItems.map(item => ({
        name: item.name || item.title || "Service Item",
        quantity: item.count || 1,
        price: item.price ? item.price.toString() : "0"
      }));

      // Calculate total price from cart
      const totalPrice = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price?.replace(/[^0-9.-]+/g, "")) || 0;
        const count = item.count || 1;
        return sum + (price * count);
      }, 0);

      finalServiceName = cartItems.map(item => item.name || item.title || "Service").join(", ");

      // FIX: Only use calculated item total if servicePrice wasn't provided 
      // This prevents overwriting the full amount (with tax/tip) sent from frontend
      if (!servicePrice) {
        finalServicePrice = totalPrice.toString();
      }

      console.log(`Total calculated from cart: ₹${totalPrice}`);

    } else if (items && items.length > 0) {
      // Use the existing items format
      bookingItems = items;
      bookingCartItems = items.map(item => ({
        name: item.name,
        price: item.price,
        count: item.quantity || 1
      }));
    } else {
      // Single service booking
      bookingItems = [{
        name: finalServiceName || "Service",
        quantity: 1,
        price: finalServicePrice || "0"
      }];
      bookingCartItems = [{
        name: finalServiceName || "Service",
        price: finalServicePrice || "0",
        count: 1
      }];
    }

    const booking = new Booking({
      customerId: customerId || `customer_${customerEmail}`,
      customerEmail,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      customerCity: customerCity || "",
      serviceName: finalServiceName,
      servicePrice: finalServicePrice,
      originalPrice: originalPrice || finalServicePrice,
      address: address || {},
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      scheduledTime: scheduledTime || "10:00 AM",
      cartItems: bookingCartItems, // Save cart items
      items: bookingItems, // Save service items
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
      price: savedBooking.servicePrice,
      cartItems: savedBooking.cartItems.length,
      items: savedBooking.items.length
    });

    // Clear cart for this customer after successful booking
    if (customerEmail) {
      try {
        const deleteResult = await Cart.deleteMany({ customerEmail: customerEmail });
        console.log(`🗑️ Cleared ${deleteResult.deletedCount} cart items for: ${customerEmail}`);
      } catch (cartError) {
        console.error("Error clearing cart:", cartError);
      }
    }

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

// Get customer's bookings by email - Updated to include cart items
app.get("/api/bookings/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log(`📋 Fetching bookings for email: ${email}`);

    const bookings = await Booking.find({ customerEmail: email })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${bookings.length} bookings for email: ${email}`);

    // Log details of first booking for debugging
    if (bookings.length > 0) {
      console.log("First booking details:", {
        id: bookings[0]._id,
        serviceName: bookings[0].serviceName,
        cartItemsCount: bookings[0].cartItems?.length || 0,
        itemsCount: bookings[0].items?.length || 0,
        hasCartItems: !!bookings[0].cartItems
      });
    }

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

// Get cart items by customer email
app.get("/api/cart/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log(`🛒 Fetching cart for email: ${email}`);

    const cartItems = await Cart.find({ customerEmail: email })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${cartItems.length} cart items for email: ${email}`);

    res.json({
      success: true,
      cartItems: cartItems,
      count: cartItems.length
    });

  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart: " + error.message });
  }
});

// Add to cart with customer email
app.post("/api/addcarts", async (req, res) => {
  try {
    const { productId, title, price, originalPrice, content, category, name, customerEmail } = req.body;

    console.log("📦 Adding to cart:", {
      productId,
      title,
      name,
      customerEmail,
      price
    });

    let existing = null;
    if (productId) {
      existing = await Cart.findOne({ productId, customerEmail });
    }

    if (existing) {
      existing.content = content;
      existing.price = price;
      existing.originalPrice = originalPrice;
      existing.category = category || 'Salon for women';
      existing.name = name || title;
      existing.count = existing.count || 1;
      await existing.save();

      console.log(`✅ Cart updated: ${existing.name}`);

      return res.json({
        message: "Cart updated",
        cart: existing
      });
    }

    const newCart = new Cart({
      productId: productId || new mongoose.Types.ObjectId().toString(),
      title: title || name,
      name: name || title,
      price,
      originalPrice,
      content,
      category: category || 'Salon for women',
      count: 1,
      customerEmail: customerEmail || "guest"
    });

    await newCart.save();

    console.log(`🆕 Cart added: ${newCart.name} for ${customerEmail}`);

    res.status(201).json({
      message: "Cart added",
      cart: newCart
    });

  } catch (err) {
    console.error("❌ Error in /api/addcarts:", err);
    res.status(500).json({ error: "Failed to add/update cart" });
  }
});

// Clear cart for customer
app.delete("/api/cart/clear/:email", async (req, res) => {
  try {
    const { email } = req.params;

    console.log(`🗑️ Clearing cart for: ${email}`);

    const result = await Cart.deleteMany({ customerEmail: email });

    console.log(`✅ Cleared ${result.deletedCount} items from cart`);

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} items from cart`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ==================== OTHER ROUTES ====================

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
        console.log(`  Order: ${cat.order}`);
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
      message: allCategories.length === 0 ? "Database is empty. Try /api/seed-categories" : "OK"
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post("/api/user-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" User login attempt:", { email });

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
    console.error(" Error in user login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Customer Registration with Image Upload
app.post("/api/register", upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, phone, city, password } = req.body;

    console.log(" Customer registration attempt:", { email, name, phone, city });

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

    // Password strength check
    if (password.length <= 6) {
      return res.status(400).json({ error: "Password must be greater than 6 characters" });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter" });
    }
    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one lowercase letter" });
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one special character" });
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
      console.log(" Customer profile image uploaded:", profileImageUrl);
    } else {
      console.log(" No profile image uploaded");
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

    console.log(` New customer registered: ${email}`);

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
    console.error(" Error in customer registration:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Customer already exists with this email" });
    }
    res.status(500).json({ error: "Failed to register customer" });
  }
});

// Customer Login with JWT - UPDATED
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(" Customer login attempt:", { email });

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find customer
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if customer is blocked
    if (customer.isActive === false) {
      return res.status(403).json({
        error: "Your account has been blocked. Please contact support."
      });
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
        role: 'customer',
        isActive: customer.isActive // Include status in token
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log(` Customer logged in: ${email}`);

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
        isActive: customer.isActive,
        role: 'customer'
      }
    });

  } catch (error) {
    console.error(" Error in customer login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Customer Update Profile
app.post("/api/update-profile", upload.single("profileImage"), async (req, res) => {
  try {
    const { customerId, name, email, phone, city, title } = req.body;

    console.log("Customer profile update request received:", {
      customerId,
      name,
      email,
      phone,
      city,
      title,
      hasFile: !!req.file,
      file: req.file
    });

    // Check if customerId is valid
    if (!customerId || customerId === "undefined") {
      console.error("Invalid customerId:", customerId);
      return res.status(400).json({
        error: "Invalid customer ID. Please log out and log in again."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.error(" Invalid MongoDB ObjectId:", customerId);
      return res.status(400).json({
        error: "Invalid customer ID format. Please log out and log in again."
      });
    }

    // Find existing customer
    const existingCustomer = await Customer.findById(customerId);
    if (!existingCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // Check if email is being changed to one that already exists
    if (email && email !== existingCustomer.email) {
      const emailExists = await Customer.findOne({ email, _id: { $ne: customerId } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Handle profile image
    let newProfileImage = existingCustomer.profileImage;
    if (req.file) {
      newProfileImage = `/assets/${req.file.filename}`;
      console.log(" New profile image:", newProfileImage);

      // Delete previous image if it exists and is not the default
      if (existingCustomer.profileImage && existingCustomer.profileImage.startsWith('/assets/')) {
        try {
          const oldImagePath = path.join(__dirname, existingCustomer.profileImage);
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
      name: name || existingCustomer.name,
      email: email || existingCustomer.email,
      phone: phone || existingCustomer.phone,
      city: city || existingCustomer.city,
      title: title || existingCustomer.title || "Ms",
      profileImage: newProfileImage,
      updatedAt: new Date()
    };

    console.log(" Updating customer with data:", updateData);

    // Update customer in database
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    console.log(" Customer updated successfully:", {
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

// Delete booking
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Cancelling booking with ID: ${id}`);
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found"
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

    // Log details of each booking
    bookings.forEach((booking, index) => {
      console.log(`Booking ${index + 1}:`, {
        id: booking._id,
        email: booking.customerEmail,
        service: booking.serviceName,
        cartItems: booking.cartItems?.length || 0,
        items: booking.items?.length || 0
      });
    });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all customers (for debugging)
app.get('/api/all-customers', async (req, res) => {
  try {
    const customers = await Customer.find({}).select('-password').sort({ createdAt: -1 });
    console.log(`Total customers in database: ${customers.length}`);
    res.json(customers);
  } catch (error) {
    console.error("Error fetching all customers:", error);
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

// Get customer by ID
app.get('/api/customer/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
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
app.get("/api/plans/:customerEmail", async (req, res) => {
  try {
    const { customerEmail } = req.params;

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
      categories: [
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
app.get("/api/categories", async (req, res) => {
  try {
    console.log("Fetching categories...");

    // FIRST: Try to get from MongoDB (your dynamic database)
    let categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    // SECOND: If MongoDB has no categories, use static JSON file
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
          isActive: true,
          order: index
        }));
      }
    }

    // THIRD: If still no categories, return empty array
    res.json({
      success: true,
      categories: categories || [],
      count: categories ? categories.length : 0,
      source: categories.length > 0 ? "database" : "static"
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    res.json({
      success: false,
      categories: [],
      count: 0,
      error: "Failed to fetch categories"
    });
  }
});

// Get all categories (including inactive)
app.get("/api/all-categories", async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ order: 1, name: 1 });
    res.json({
      categories,
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Create new category
app.post("/api/categories", upload.single('image'), async (req, res) => {
  try {
    const { name, key, description, order, isActive = true } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Use uploaded image or default
    let img = "/assets/default-category.png";
    if (req.file) {
      img = `/assets/${req.file.filename}`;
    }

    const categoryKey = key || name.toLowerCase().replace(/ /g, '-');

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [
        { key: categoryKey },
        { name: name }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        error: `Category with name '${name}' or key '${categoryKey}' already exists`
      });
    }

    const category = new Category({
      name,
      key: categoryKey,
      description: description || `Service for ${name}`,
      img,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await category.save();

    console.log(`Created new category: ${name} (${categoryKey})`);

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
app.put("/api/categories/:id", upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, key, description, order, isActive } = req.body;

    const updateData = {
      name,
      key,
      description,
      order,
      isActive,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.img = `/assets/${req.file.filename}`;

      // Optional: Delete old image if not default
      const oldCategory = await Category.findById(id);
      if (oldCategory && oldCategory.img !== "/assets/default-category.png") {
        const oldImagePath = path.join(__dirname, oldCategory.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// Delete category
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});


// Static data routes
app.get("/api/static-data", (req, res) => {
  const data = readStaticData();
  if (data) {
    res.json(data);
  } else {
    res.status(500).json({ error: "Failed to load static data" });
  }
});

// Updated static routes with categories
const staticRoutes = [
  'logo', 'logo1', 'categories', 'banner', 'carousel', 'book', 'salon',
  'advanced', 'super', 'smartlock', 'images',
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

// Package routes
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
      category: req.body.category || 'Salon for women'
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

// Cart routes - Updated
app.get("/api/carts", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json({ carts });
  } catch {
    res.status(500).json({ error: "Failed to fetch carts" });
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
    if (staticData && staticData.categories) {
      return res.json({ salonforwomen: staticData.categories });
    }
    res.status(404).json({ error: "No salon for women data found" });
  } catch (error) {
    console.error("Error fetching salon for women:", error);
    res.status(500).json({ error: "Failed to fetch salon for women data" });
  }
});

// Get packages for specific category
app.get("/api/packages/:category", async (req, res) => {
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
    console.error(`Error fetching ${category} packages:`, error);
    res.status(500).json({ error: `Failed to fetch ${category} packages` });
  }
});

app.get("/api/subcategories", async (req, res) => {
  try {
    const subcategories = await Subcategory.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .populate('categoryId', 'name key');

    res.json({
      success: true,
      subcategories: subcategories || [],
      count: subcategories ? subcategories.length : 0
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

app.get("/api/subcategories/:categoryKey", async (req, res) => {
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
    }).sort({ order: 1, name: 1 });

    res.json({
      success: true,
      subcategories: subcategories || [],
      categoryName: category.name,
      count: subcategories ? subcategories.length : 0
    });
  } catch (error) {
    console.error("Error fetching subcategories by category:", error);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// Get packages by subcategory
app.get("/api/packages/subcategory/:subcategoryKey", async (req, res) => {
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
    console.error("Error fetching packages by subcategory:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
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

// Get active packages only (for frontend)
app.get("/api/active-packages", async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      packages: packages || [],
      count: packages ? packages.length : 0
    });
  } catch (error) {
    console.error("Error fetching active packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

// Debug endpoint to see all packages
app.get("/api/debug-packages", async (req, res) => {
  try {
    const allPackages = await Package.find().sort({ createdAt: -1 });
    const activePackages = await Package.find({ isActive: true }).sort({ createdAt: -1 });

    console.log(`=== DEBUG: Found ${allPackages.length} total packages ===`);
    console.log(`=== DEBUG: Found ${activePackages.length} active packages ===`);

    allPackages.forEach(pkg => {
      console.log(`Package: ${pkg.name}`);
      console.log(`  ID: ${pkg._id}`);
      console.log(`  Category: ${pkg.category}`);
      console.log(`  isActive: ${pkg.isActive}`);
      console.log(`  Price: ${pkg.price}`);
      console.log(`---`);
    });

    res.json({
      success: true,
      total: allPackages.length,
      active: activePackages.length,
      allPackages: allPackages,
      activePackages: activePackages
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check all packages
app.get("/api/debug-all-packages", async (req, res) => {
  try {
    const allPackages = await Package.find().sort({ createdAt: -1 });

    console.log(`=== DEBUG: Found ${allPackages.length} total packages ===`);

    allPackages.forEach(pkg => {
      console.log(`Package: ${pkg.name}`);
      console.log(`  ID: ${pkg._id}`);
      console.log(`  isActive: ${pkg.isActive}`);
      console.log(`  Category: ${pkg.category}`);
      console.log(`  Title: ${pkg.title}`);
      console.log(`  Subcategory: ${pkg.subcategory}`);
      console.log(`---`);
    });

    res.json({
      success: true,
      total: allPackages.length,
      packages: allPackages
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Customer status check middleware
const checkCustomerStatus = async (req, res, next) => {
  try {
    // Only check for customer routes that require active status
    const customerId = req.user?.id;
    const customerEmail = req.body?.email || req.params?.email;

    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (customer && customer.isActive === false) {
        return res.status(403).json({
          success: false,
          error: "Account is blocked. Please contact support."
        });
      }
    } else if (customerEmail) {
      const customer = await Customer.findOne({ email: customerEmail });
      if (customer && customer.isActive === false) {
        return res.status(403).json({
          success: false,
          error: "Account is blocked. Please contact support."
        });
      }
    }
    next();
  } catch (error) {
    console.error("Error checking customer status:", error);
    next();
  }
};

// Apply to customer-related routes (add this after login route)
app.use("/api/bookings", checkCustomerStatus);
app.use("/api/cart", checkCustomerStatus);
app.use("/api/update-profile", checkCustomerStatus);

// 404 handler - MUST BE LAST
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});