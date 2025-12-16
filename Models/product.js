const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
	{
		id: { type: Number },
		title: { type: String },
		description: { type: String },
		price: { type: Number },
		discountPercentage: { type: Number },
		rating: { type: Number },
		stock: { type: Number },
		brand: { type: String },
		category: { type: String },
		images: { type: [String] },
	},
	{ _id: false, timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
