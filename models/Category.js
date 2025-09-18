const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true },
  image: { type: String, required: true }, // URL/path to image
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);