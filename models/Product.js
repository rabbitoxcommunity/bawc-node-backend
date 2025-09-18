const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  images: [{ type: String, required: true }], // Array of image URLs/paths
  title: { type: String, required: true },
  description: { type: String, required: true },
  actualPrice: { type: Number, required: true },
  discountPrice: { type: Number, required: false },
  isOutOfStock: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text' }); // For potential search

module.exports = mongoose.model('Product', productSchema);