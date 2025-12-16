/**
 * User Controller
 * Handles user authentication and registration
 */

const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * User Signup
 * @route POST /api/users/signup
 */
exports.signup = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				error: "Validation Error",
				message: "Email and password are required",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return res.status(400).json({
				error: "Registration Error",
				message: "User with this email already exists",
			});
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create new user
		const newUser = new User({
			username: username || email.split("@")[0],
			email,
			password: hashedPassword,
		});

		await newUser.save();

		// Generate JWT token
		const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.SECRET, { algorithm: "HS256", expiresIn: "24h" });

		return res.status(201).json({
			message: "User created successfully",
			token,
			expiresIn: "24h",
			userId: newUser._id,
			user: {
				id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			},
		});
	} catch (error) {
		console.error("Signup Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to create user",
		});
	}
};

/**
 * User Login
 * @route POST /api/users/login
 */
exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Validate required fields
		if (!email || !password) {
			return res.status(400).json({
				error: "Validation Error",
				message: "Email and password are required",
			});
		}

		// Find user by email
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(401).json({
				error: "Authentication Error",
				message: "Invalid email or password",
			});
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({
				error: "Authentication Error",
				message: "Invalid email or password",
			});
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user._id, email: user.email }, process.env.SECRET, { algorithm: "HS256", expiresIn: "24h" });

		return res.status(200).json({
			message: "Login successful",
			token,
			expiresIn: "24h",
			userId: user._id,
			user: {
				id: user._id,
				username: user.username,
				email: user.email,
			},
		});
	} catch (error) {
		console.error("Login Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Authentication failed",
		});
	}
};
