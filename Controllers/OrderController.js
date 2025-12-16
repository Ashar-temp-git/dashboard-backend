/**
 * Order Controller
 * Handles order-related API operations
 */

const Order = require("../Models/Order");

/**
 * Get all orders
 * @route GET /api/orders/getAllorders
 */
exports.getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find().lean();
		return res.status(200).json(orders);
	} catch (error) {
		console.error("getAllOrders Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to fetch orders",
		});
	}
};

/**
 * Get a single order by ID
 * @route GET /api/orders/getorder/:id
 */
exports.getOrder = async (req, res) => {
	try {
		const id = req.params.id || req.params.Id || req.query.id;

		if (!id) {
			return res.status(400).json({
				error: "Bad Request",
				message: "Order ID is required",
			});
		}

		const order = await Order.findOne({ id: parseInt(id, 10) }).lean();

		if (!order) {
			return res.status(404).json({
				error: "Not Found",
				message: "Order not found",
			});
		}

		return res.status(200).json(order);
	} catch (error) {
		console.error("getOrder Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to fetch order",
		});
	}
};

/**
 * Add a new order
 * @route POST /api/orders/addorder
 */
exports.addOrder = async (req, res) => {
	try {
		const { name, description, price, quantityAvailable, products, totalProducts, total, discountedTotal, totalQuantity, userId, title } =
			req.body;

		// Generate a unique ID
		const lastOrder = await Order.findOne().sort({ id: -1 });
		const newId = lastOrder ? lastOrder.id + 1 : 1;

		const order = new Order({
			id: newId,
			name,
			description,
			price,
			quantityAvailable,
			products,
			totalProducts,
			total,
			discountedTotal,
			totalQuantity,
			userId,
			title,
		});

		const createdOrder = await order.save();

		return res.status(201).json({
			message: "Order Added",
			order: {
				...createdOrder.toObject(),
				id: createdOrder.id,
			},
		});
	} catch (error) {
		console.error("addOrder Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to create order",
		});
	}
};
