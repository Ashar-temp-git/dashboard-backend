/**
 * Vercel Serverless Entry Point
 * Optimized for cold starts and connection pooling
 */

const app = require("../app");

// Export the Express app as a serverless function
module.exports = app;
