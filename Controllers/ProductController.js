/**
 * Product Controller
 * Handles product-related API operations
 */

const Product = require("../Models/product");

/**
 * Get all products
 * @route GET /api/products/getAllProducts
 */
exports.getAllProducts = async (req, res) => {
	try {
		const products = await Product.find().lean();
		return res.status(200).json(products);
	} catch (error) {
		console.error("getAllProducts Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to fetch products",
		});
	}
};

/**
 * Get a single product by ID
 * @route GET /api/products/getproduct/:id
 */
exports.getProduct = async (req, res) => {
	try {
		const id = req.params.id || req.params.Id || req.query.id;

		if (!id) {
			return res.status(400).json({
				error: "Bad Request",
				message: "Product ID is required",
			});
		}

		const product = await Product.findOne({ id: parseInt(id, 10) }).lean();

		if (!product) {
			return res.status(404).json({
				error: "Not Found",
				message: "Product not found",
			});
		}

		return res.status(200).json(product);
	} catch (error) {
		console.error("getProduct Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to fetch product",
		});
	}
};

/**
 * Add a new product
 * @route POST /api/products/addproduct
 */
exports.addProduct = async (req, res) => {
	try {
		const { title, description, price, discountPercentage, rating, stock, brand, category, images } = req.body;

		// Generate a unique ID
		const lastProduct = await Product.findOne().sort({ id: -1 });
		const newId = lastProduct ? lastProduct.id + 1 : 1;

		const product = new Product({
			id: newId,
			title,
			description,
			price,
			discountPercentage,
			rating,
			stock,
			brand,
			category,
			images,
		});

		const createdProduct = await product.save();

		return res.status(201).json({
			message: "Product Added",
			product: {
				...createdProduct.toObject(),
				id: createdProduct.id,
			},
		});
	} catch (error) {
		console.error("addProduct Error:", error);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Failed to create product",
		});
	}
};
