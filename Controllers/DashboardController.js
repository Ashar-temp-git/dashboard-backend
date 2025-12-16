/**
 * Dashboard Controller
 * Handles dashboard-related API operations
 */

const Dashboard = require("../Models/Dashboard");

/**
 * Get all dashboard data
 * @route GET /api/dashboards/getDashboard
 */
exports.getDashboard = async (req, res) => {
	try {
		const dashboard = await Dashboard.find().lean();
		return res.status(200).json(dashboard);
	} catch (error) {
		console.error("getDashboard Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to fetch dashboard data",
		});
	}
};
