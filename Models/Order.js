const mongoose = require("mongoose");
const Product = require("./product");
// Use the schema from the registered model if available, otherwise require it.
// However, order.js in Step 23 required "./product".schema.
// Optimally, we can just redefine sub-schema or require it.

const orderSchema = new mongoose.Schema(
	{
		id: {
			type: Number,
			unique: true,
		},
		products: [Product.schema],
		totalProducts: {
			type: Number,
		},
		total: {
			type: Number,
		},
		discountedTotal: {
			type: Number,
		},
		totalQuantity: {
			type: Number,
		},
		userId: {
			type: String,
		},
		title: {
			type: String,
		},
	},
	{ timestamps: true }
);
module.exports = mongoose.model("Order", orderSchema);
