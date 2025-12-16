const jwt = require("jsonwebtoken");
const User = require("../Models/User");

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
const requireAuth = async (req, res, next) => {
	try {
		// Get the authorization header
		const authHeader = req.headers["authorization"];

		if (!authHeader) {
			return res.status(401).json({ error: "Authorization header required" });
		}

		// Extract token (supports "Bearer <token>" format)
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

		if (!token) {
			return res.status(401).json({ error: "Token required" });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.SECRET);

		// Find user and attach to request
		const user = await User.findById(decoded.userId || decoded._id).select("_id email");

		if (!user) {
			return res.status(401).json({ error: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.error("Auth Error:", error.message);

		if (error.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Token expired" });
		}

		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({ error: "Invalid token" });
		}

		return res.status(401).json({ error: "Request is not authorized" });
	}
};

module.exports = requireAuth;
