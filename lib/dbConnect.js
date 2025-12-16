/**
 * MongoDB Connection Handler for Serverless Environments
 *
 * Key optimizations:
 * - Connection caching to reuse connections across function invocations
 * - Promise caching to prevent multiple simultaneous connection attempts
 * - Serverless-optimized connection options
 */

const mongoose = require("mongoose");

// Global variable to cache the connection across hot reloads in development
// and across function invocations in production
let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with serverless optimizations
 * @returns {Promise<mongoose.Connection>}
 */
async function dbConnect() {
	// Return cached connection if available
	if (cached.conn) {
		return cached.conn;
	}

	// If a connection is already being established, wait for it
	if (!cached.promise) {
		// Check for password first
		if (!process.env.password) {
			throw new Error("Please define the password environment variable");
		}

		const MONGODB_URI = "mongodb+srv://syed:" + process.env.password + "@cluster0.1ndmrol.mongodb.net/dash-board?retryWrites=true&w=majority";

		const opts = {
			// Serverless-optimized connection options
			bufferCommands: false, // Disable mongoose buffering
			maxPoolSize: 10, // Maintain up to 10 socket connections
			minPoolSize: 1, // Minimum 1 connection in pool
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			serverSelectionTimeoutMS: 10000, // Give up initial connection after 10 seconds
		};

		cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
			console.log("MongoDB connected successfully");
			return mongoose;
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		// Reset the promise so we can retry
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

module.exports = dbConnect;
