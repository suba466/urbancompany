// adminRoutes.js
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const router = express.Router();

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
        role: "superadmin"
      });
      await admin.save();
      console.log("✅ Default admin created: admin@urbancompany.com / admin123");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

// Admin Login
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

    console.log(`Admin logged in: ${email}`);

    res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Admin Dashboard Statistics
router.get("/dashboard", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Booking = mongoose.model("Booking");
    const Service = mongoose.model("Service");
    const Package = mongoose.model("Package");

    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalPackages = await Package.countDocuments();
    
    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$servicePrice" } }
        }
      }
    ]);

    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userName userEmail serviceName servicePrice status createdAt');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email phone city createdAt');

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
        totalUsers,
        totalBookings,
        totalServices,
        totalPackages,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings,
      recentUsers,
      monthlyRevenue,
      topServices
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get all users with pagination
router.get("/users", async (req, res) => {
  try {
    const User = mongoose.model("User");
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

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
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

// Get all bookings with filters
router.get("/bookings", async (req, res) => {
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
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { userPhone: { $regex: search, $options: "i" } },
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
router.put("/bookings/:id/status", async (req, res) => {
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

// Delete booking
router.delete("/bookings/:id", async (req, res) => {
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

// Get all services
router.get("/services", async (req, res) => {
  try {
    const Service = mongoose.model("Service");
    const { page = 1, limit = 20, search = "", category = "" } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (category) {
      query.category = category;
    }

    const services = await Service.find(query)
      .sort({ order: 1 })
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

// Get all packages
router.get("/packages", async (req, res) => {
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

// Admin middleware for authentication (simple version)
const adminAuth = (req, res, next) => {
  // For now, we'll use a simple check
  // In production, use JWT tokens
  const adminToken = req.headers['admin-token'];
  
  if (!adminToken) {
    return res.status(401).json({ error: "Admin authentication required" });
  }
  
  // Simple check - in real app, verify JWT
  if (adminToken !== "admin-secret-token") {
    return res.status(401).json({ error: "Invalid admin token" });
  }
  
  next();
};

// Apply admin auth middleware to all routes except login
router.use((req, res, next) => {
  if (req.path === '/login') {
    return next();
  }
  adminAuth(req, res, next);
});

export default router;