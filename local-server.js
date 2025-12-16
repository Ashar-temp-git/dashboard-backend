/**
 * Local Development Server
 * Use this for local development - Vercel will use api/index.js
 */

const app = require("./app");

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📍 Local: http://localhost:${PORT}`);
	console.log(`💡 Environment: ${process.env.NODE_ENV || "development"}`);
});
