import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";

const router = express.Router();

// Setup multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
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
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Staff Schema - No profileImage field
const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true },
  profileImage:{type:String,default:" "},
  isActive: { type: Boolean, default: true },
  permissions: {
    Dashboard: { type: Boolean, default: false },
    Staff: { type: Boolean, default: false },
    User: { type: Boolean, default: false },
    Category: { type: Boolean, default: false },
    Product: { type: Boolean, default: false },
    Bookings: { type: Boolean, default: false },
    Reports: { type: Boolean, default: false },
    Settings: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Staff = mongoose.model("Staff", staffSchema);



// Get all staff with pagination
router.get("/staff", async (req, res) => {
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

    const staff = await Staff.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      staff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Get single staff member
router.get("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id).select('-__v');
    
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    res.json({
      success: true,
      staff
    });

  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Create new staff member WITHOUT profile image
router.post("/staff", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      designation,
      permissions,
      isActive
    } = req.body;

    // Parse permissions if it's a string
    let parsedPermissions = {};
    if (permissions) {
      if (typeof permissions === 'string') {
        parsedPermissions = JSON.parse(permissions);
      } else {
        parsedPermissions = permissions;
      }
    }

    // Validate required fields
    if (!name || !email || !phone || !designation) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ error: "Staff member with this email already exists" });
    }

    // Create new staff
    const staff = new Staff({
      name,
      email,
      phone,
      designation,
      isActive: isActive !== undefined ? isActive : true,
      permissions: parsedPermissions || {
        Dashboard: false,
        Staff: false,
        User: false,
        Category: false,
        Product: false,
        Bookings: false,
        Reports: false,
        Settings: false
      }
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      staff
    });

  } catch (error) {
    console.error("Error creating staff:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

// Update staff member WITHOUT profile image
router.put("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find existing staff
    const existingStaff = await Staff.findById(id);
    if (!existingStaff) {
      return res.status(404).json({ error: "Staff member not found" });
    }

    // Don't allow email update to existing email
    if (updateData.email && updateData.email !== existingStaff.email) {
      const emailExists = await Staff.findOne({ 
        email: updateData.email, 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Parse permissions if it's a string
    if (updateData.permissions && typeof updateData.permissions === 'string') {
      updateData.permissions = JSON.parse(updateData.permissions);
    }

    // Update staff
    const staff = await Staff.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: "Staff member updated successfully",
      staff
    });

  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ error: "Failed to update staff member" });
  }
});

// Delete staff member
router.delete("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    await Staff.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Staff member deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ error: "Failed to delete staff member" });
  }
});

// Bulk delete staff members
router.delete("/staff/bulk-delete", async (req, res) => {
  try {
    const { staffIds } = req.body;

    if (!staffIds || !Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({ error: "No staff IDs provided" });
    }

    const result = await Staff.deleteMany({ _id: { $in: staffIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No staff members found to delete" });
    }

    res.json({
      success: true,
      message: `${result.deletedCount} staff member(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting staff:", error);
    res.status(500).json({ error: "Failed to delete staff members" });
  }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  isActive: { type: Boolean, default: true }, // Added missing field
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
// In adminRoutes.js - update the dashboard endpoint

// Admin Dashboard Statistics
router.get("/dashboard", async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Booking = mongoose.model("Booking");
    const Service = mongoose.model("Service");
    const Package = mongoose.model("Package");

    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Service.countDocuments();
    const totalPackages = await Package.countDocuments();
    
    const totalRevenue = await Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: { $toDouble: "$servicePrice" } }
        }
      }
    ]);

    // Get recent bookings with user details
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(); // Use lean() for plain JavaScript objects
    
    // Get user emails from bookings
    const userEmails = recentBookings.map(b => b.userEmail);
    
    // Get users with profile images
    const users = await User.find({ email: { $in: userEmails } })
      .select('email name profileImage')
      .lean();
    
    // Create a user map for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.email] = {
        name: user.name,
        profileImage: user.profileImage
      };
    });
    
    // Add user details to bookings
    const recentBookingsWithUserDetails = recentBookings.map(booking => {
      const userDetails = userMap[booking.userEmail] || {};
      return {
        ...booking,
        userName: userDetails.name || booking.userName,
        userProfileImage: userDetails.profileImage || ''
      };
    });
    
    const recentUsers = await User.find()
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
        totalUsers,
        totalBookings,
        totalCategories,
        totalPackages,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentBookings: recentBookingsWithUserDetails,
      recentUsers,
      monthlyRevenue,
      topServices
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get users by emails
router.post("/users-by-emails", async (req, res) => {
  try {
    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Emails array is required" });
    }
    
    const User = mongoose.model("User");
    const users = await User.find({ email: { $in: emails } })
      .select('name email profileImage');
    
    res.json({
      success: true,
      users
    });
    
  } catch (error) {
    console.error("Error fetching users by emails:", error);
    res.status(500).json({ error: "Failed to fetch users" });
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
      .select('name email phone city profileImage createdAt password') // Include password for display
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

// Bulk delete users
router.delete("/users/bulk-delete", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "No user IDs provided" });
    }

    const User = mongoose.model("User");
    const result = await User.deleteMany({ _id: { $in: userIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No users found to delete" });
    }

    res.json({
      success: true,
      message: `${result.deletedCount} user(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting users:", error);
    res.status(500).json({ error: "Failed to delete users" });
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

// Bulk delete bookings
router.delete("/bookings/bulk-delete", async (req, res) => {
  try {
    const { bookingIds } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: "No booking IDs provided" });
    }

    const Booking = mongoose.model("Booking");
    const result = await Booking.deleteMany({ _id: { $in: bookingIds } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No bookings found to delete" });
    }

    res.json({
      success: true,
      message: `${result.deletedCount} booking(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting bookings:", error);
    res.status(500).json({ error: "Failed to delete bookings" });
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

// Delete single booking
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
// In adminRoutes.js - update the get services endpoint:
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

router.put("/services/:id/toggle-status", async (req, res) => {
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

// Update service/category WITH image upload
router.put("/services/:id", upload.single('image'), async (req, res) => {
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
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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

// Create new service WITH image upload
router.post("/services", upload.single('image'), async (req, res) => {
  try {
    const { name, description, category, order, isActive = true } = req.body;

    // Handle image upload
    let imageUrl = "/assets/default-category.png";
    if (req.file) {
      imageUrl = `/assets/${req.file.filename}`;
    }

    if (!name) {
      return res.status(400).json({ error: "Service name is required" });
    }

    const Service = mongoose.model("Service");
    const service = new Service({
      name,
      description: description || "",
      category: category || "General",
      img: imageUrl,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await service.save();

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

// Update service WITH image upload
router.put("/services/:id", upload.single('image'), async (req, res) => {
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
      
      // Optional: Delete old image if not default
      if (service.img && service.img !== "/assets/default-category.png") {
        const oldImagePath = path.join(__dirname, '..', service.img);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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
// In adminRoutes.js - add bulk delete
router.delete("/services/bulk-delete", async (req, res) => {
  try {
    const { serviceIds } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ error: "No service IDs provided" });
    }

    const Service = mongoose.model("Service");
    
    // Get services to delete images
    const services = await Service.find({ _id: { $in: serviceIds } });
    
    // Delete image files
    services.forEach(service => {
      if (service.img && service.img !== "/assets/default-category.png") {
        const imagePath = path.join(__dirname, '..', service.img);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });

    const result = await Service.deleteMany({ _id: { $in: serviceIds } });

    res.json({
      success: true,
      message: `${result.deletedCount} service(s) deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error("Error bulk deleting services:", error);
    res.status(500).json({ error: "Failed to delete services" });
  }
});

// Admin middleware for authentication
const adminAuth = (req, res, next) => {
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