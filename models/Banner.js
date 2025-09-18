const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  subTitle: { type: String },
  mainTitle: { type: String, required: false },
  link: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);