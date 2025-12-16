/**
 * Express Application - Optimized for Vercel Serverless
 */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import database connection
const dbConnect = require("./lib/dbConnect");

// Import routes
const productRoute = require("./Routes/productRoute");
const userRoute = require("./Routes/userRoute");
const dashboardRoute = require("./Routes/dashboard");
const orderRoute = require("./Routes/orderRoute");

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// CORS Configuration - Production ready
const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (mobile apps, curl, etc.)
		if (!origin) return callback(null, true);

		// List of allowed origins - add your frontend domains here
		const allowedOrigins = [
			"http://localhost:3000",
			"http://localhost:5173",
			"https://your-frontend.vercel.app", // Replace with your actual frontend URL
			process.env.FRONTEND_URL, // Or use environment variable
		].filter(Boolean);

		if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Access-Token", "Origin"],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// ============================================
// DATABASE CONNECTION MIDDLEWARE
// ============================================
// This runs BEFORE routes to ensure DB is connected
app.use(async (req, res, next) => {
	try {
		await dbConnect();
		next();
	} catch (error) {
		console.error("Database connection error:", error);
		res.status(500).json({
			error: "Database connection failed",
			message: process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
		});
	}
});

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get("/api/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || "development",
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.status(200).json({
		message: "Sales Dashboard API",
		version: "1.0.0",
		endpoints: {
			products: "/api/products",
			orders: "/api/orders",
			users: "/api/users",
			dashboard: "/api/dashboards",
			health: "/api/health",
		},
	});
});

// ============================================
// API ROUTES
// ============================================
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/dashboards", dashboardRoute);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res, next) => {
	res.status(404).json({
		error: "Not Found",
		message: `Cannot ${req.method} ${req.originalUrl}`,
	});
});

// Global Error Handler
app.use((err, req, res, next) => {
	console.error("Error:", err);

	// Handle CORS errors
	if (err.message === "Not allowed by CORS") {
		return res.status(403).json({
			error: "CORS Error",
			message: "Origin not allowed",
		});
	}

	// Handle validation errors
	if (err.name === "ValidationError") {
		return res.status(400).json({
			error: "Validation Error",
			message: err.message,
		});
	}

	// Handle JWT errors
	if (err.name === "JsonWebTokenError") {
		return res.status(401).json({
			error: "Authentication Error",
			message: "Invalid token",
		});
	}

	if (err.name === "TokenExpiredError") {
		return res.status(401).json({
			error: "Authentication Error",
			message: "Token expired",
		});
	}

	// Default error response
	res.status(err.status || 500).json({
		error: "Internal Server Error",
		message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
	});
});

// Export the app for serverless deployment
module.exports = app;
