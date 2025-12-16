/**
 * Local Development Server
 * Uses the exact same application logic as Vercel
 */

// Use the Vercel entry point
const app = require("./api/index");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📍 Local: http://localhost:${PORT}`);
	console.log(`💡 Environment: ${process.env.NODE_ENV || "development"}`);
});
