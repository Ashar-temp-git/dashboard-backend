/**
 * Main Application Entry Point
 * Merges Express App and Serverless Logic
 */

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Routes
const productRoute = require("./Routes/productRoute");
const userRoute = require("./Routes/userRoute");
const dashboardRoute = require("./Routes/dashboard");
const orderRoute = require("./Routes/orderRoute");

// Initialize Express
const app = express();

// ============================================
// DATABASE CONNECTION (Cached for Serverless)
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
// MIDDLEWARE
// ============================================

// CORS Configuration
// CORS Configuration
const corsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL]
			.filter(Boolean)
			.map(url => url.replace(/\/$/, "")); // Remove trailing slash from all allowed origins

		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);

		// Normalize incoming origin just in case (though browsers usually don't send trailing slash)
		const normalizedOrigin = origin.replace(/\/$/, "");

		if (allowedOrigins.includes(normalizedOrigin) || process.env.NODE_ENV !== "production") {
			callback(null, true);
		} else {
			console.log("Blocked by CORS:", origin);
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "X-Access-Token", "Origin"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// Connect to DB before routes
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
app.get("/", (req, res) => {
	res.status(200).json({
		message: "Sales Dashboard API",
		status: "Running",
		endpoints: {
			products: "/api/products",
			orders: "/api/orders",
			users: "/api/users",
			dashboard: "/api/dashboards",
			health: "/api/health",
		},
	});
});

app.get("/api/health", (req, res) => {
	res.status(200).json({
		status: "healthy",
		timestamp: new Date().toISOString(),
	});
});

app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/dashboards", dashboardRoute);

// 404 Handler
app.use((req, res) => {
	res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal Server Error" });
});

// ============================================
// SERVER START
// ============================================

// If running directly (node index.js), listen on port
if (require.main === module) {
	const PORT = process.env.PORT || 8080;
	app.listen(PORT, () => {
		console.log(`🚀 Server running on port ${PORT}`);
		console.log(`📍 Local: http://localhost:${PORT}`);
	});
}

// Export app for Vercel
module.exports = app;
