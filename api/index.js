/**
 * Vercel Serverless Entry Point
 * Self-contained serverless function with all necessary code
 */

// Load environment variables
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// ============================================
// MODELS (inline to avoid path issues)
// ============================================
const userSchema = new mongoose.Schema({
	username: { type: String },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema(
	{
		id: { type: Number },
		title: { type: String },
		description: { type: String },
		price: { type: Number },
		discountPercentage: { type: Number },
		rating: { type: Number },
		stock: { type: Number },
		brand: { type: String },
		category: { type: String },
		images: { type: [String] },
	},
	{ _id: false }
);
const Product = mongoose.models.Products || mongoose.model("Products", productSchema);

const orderSchema = new mongoose.Schema(
	{
		id: { type: Number, unique: true },
		products: [productSchema],
		totalProducts: { type: Number },
		total: { type: Number },
		discountedTotal: { type: Number },
		totalQuantity: { type: Number },
		userId: { type: String },
		title: { type: String },
	},
	{ timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const dashboardSchema = new mongoose.Schema(
	{
		user_id: { type: Number },
		createdAt: { type: Date },
		is_loyal: { type: Number },
		is_new: { type: Number },
		is_unique: { type: Number },
		amount_spent: { type: Number },
		sales_channel: { type: String },
		service_type: { type: String },
		region: { type: String },
		day_of_week: { type: String },
		month: { type: String },
		satisfaction_score: { type: Number },
	},
	{ id: false }
);
const Dashboard = mongoose.models.DashBoard || mongoose.model("DashBoard", dashboardSchema);

// ============================================
// MongoDB Connection with Caching
// ============================================
let cached = global.mongoose;
if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const MONGODB_URI = "mongodb+srv://syed:" + process.env.password + "@cluster0.1ndmrol.mongodb.net/dash-board?retryWrites=true&w=majority";

		cached.promise = mongoose.connect(MONGODB_URI, {
			bufferCommands: false,
			maxPoolSize: 10,
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

// ============================================
// Initialize Express
// ============================================
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Database connection middleware
app.use(async (req, res, next) => {
	try {
		await dbConnect();
		next();
	} catch (error) {
		console.error("Database connection error:", error);
		res.status(500).json({ error: "Database connection failed" });
	}
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get("/", (req, res) => {
	res.json({ message: "Sales Dashboard API", status: "running" });
});

app.get("/api/health", (req, res) => {
	res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Product routes
app.get("/api/products/getAllProducts", async (req, res) => {
	try {
		const products = await Product.find().lean();
		res.json(products);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch products" });
	}
});

app.get("/api/products/getproduct", async (req, res) => {
	try {
		const id = req.query.id || req.params.id;
		const product = await Product.findOne({ id: parseInt(id, 10) }).lean();
		if (!product) return res.status(404).json({ error: "Product not found" });
		res.json(product);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch product" });
	}
});

app.post("/api/products/addproduct", async (req, res) => {
	try {
		const lastProduct = await Product.findOne().sort({ id: -1 });
		const newId = lastProduct ? lastProduct.id + 1 : 1;
		const product = new Product({ id: newId, ...req.body });
		await product.save();
		res.status(201).json({ message: "Product Added", product });
	} catch (error) {
		res.status(500).json({ error: "Failed to add product" });
	}
});

// Order routes
app.get("/api/orders/getAllorders", async (req, res) => {
	try {
		const orders = await Order.find().lean();
		res.json(orders);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch orders" });
	}
});

app.get("/api/orders/getorder", async (req, res) => {
	try {
		const id = req.query.id || req.params.id;
		const order = await Order.findOne({ id: parseInt(id, 10) }).lean();
		if (!order) return res.status(404).json({ error: "Order not found" });
		res.json(order);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch order" });
	}
});

app.post("/api/orders/addorder", async (req, res) => {
	try {
		const lastOrder = await Order.findOne().sort({ id: -1 });
		const newId = lastOrder ? lastOrder.id + 1 : 1;
		const order = new Order({ id: newId, ...req.body });
		await order.save();
		res.status(201).json({ message: "Order Added", order });
	} catch (error) {
		res.status(500).json({ error: "Failed to add order" });
	}
});

// Dashboard routes
app.get("/api/dashboards/getDashboard", async (req, res) => {
	try {
		const dashboard = await Dashboard.find().lean();
		res.json(dashboard);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch dashboard" });
	}
});

// User routes
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.post("/api/users/signup", async (req, res) => {
	try {
		const { username, email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({
			username: username || email.split("@")[0],
			email,
			password: hashedPassword,
		});
		await newUser.save();

		const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.SECRET || "fallback-secret", { expiresIn: "24h" });

		res.status(201).json({
			message: "User created",
			token,
			userId: newUser._id,
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({ error: "Failed to create user" });
	}
});

app.post("/api/users/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET || "fallback-secret", { expiresIn: "24h" });

		res.json({
			message: "Login successful",
			token,
			userId: user._id,
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Authentication failed" });
	}
});

// 404 Handler
app.use((req, res) => {
	res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Error Handler
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal Server Error" });
});

// Export for Vercel
module.exports = app;
