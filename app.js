const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const productRoute = require("../Routes/productRoute");
const userRoute = require("../Routes/userRoute");
const dashboardRoute = require("../Routes/dashboard");
const orderRoute = require("../Routes/orderRoute");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let isConnected = false;
async function connectDB() {
	if (isConnected) {
		console.log("Using existing DB connection");
		return;
	}
	try {
		await mongoose.connect(
			`mongodb+srv://syed:${process.env.MONGO_PASSWORD}@cluster0.1ndmrol.mongodb.net/dash-board?retryWrites=true&w=majority&maxPoolSize=5&minPoolSize=1`,
			{ connectTimeoutMS: 10000, socketTimeoutMS: 45000, maxIdleTimeMS: 60000 }
		);
		isConnected = true;
		console.log("✓ Database connected");
	} catch (error) {
		console.error("✗ Database connection failed:", error.message);
		isConnected = false;
	}
}
connectDB();
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/dashboards", dashboardRoute);
app.get("/api/health", (req, res) => {
	res.status(200).json({ status: "ok", connected: isConnected });
});
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal server error" });
});
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});
module.exports = app;
