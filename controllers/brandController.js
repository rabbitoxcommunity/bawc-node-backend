const Brand = require('../models/Brand');
const multer = require('multer');
const path = require('path');
const validate = require('../middleware/validationMiddleware');
const Joi = require('joi');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const brandSchema = Joi.object({
  name: Joi.string().required(),
});
const updateBrandSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().allow('').optional(),
  image: Joi.any().optional(), 
});


const createBrand = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    // normalize name
    name = name.trim().toLowerCase();

    // check for existing brand (case-insensitive)
    const existing = await Brand.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      return res.status(400).json({ success: false, message: "Brand name already exists" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const brand = new Brand({ name, image });
    await brand.save();

    res.status(201).json({ success: true, message: "Brand created successfully", data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 }); 
    res.json({
      success: true,
      message: "Brands fetched successfully",
      data: brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Brand ID is required",
      });
    }

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      message: "Brand fetched successfully",
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const updateBrand = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Brand ID is required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = {};

    if (name) {
      const normalizedName = name.trim().toLowerCase();

      // check if another brand already has this name
      const existing = await Brand.findOne({
        _id: { $ne: id }, // exclude current brand
        name: new RegExp(`^${normalizedName}$`, "i"),
      });

      if (existing) {
        return res.status(400).json({ success: false, message: "Brand name already exists" });
      }

      updateData.name = normalizedName;
    }

    if (image) updateData.image = image;

    const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    res.json({ success: true, message: "Brand updated successfully", data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


// const updateBrand = async (req, res) => {
//   const { id, name } = req.body;
//   const image = req.file ? `/uploads/${req.file.filename}` : undefined;
//   const updateData = { name };
//   if (image) updateData.image = image;
//   const brand = await Brand.findByIdAndUpdate(id, updateData, { new: true });
//   if (!brand) return res.status(404).json({ message: 'Brand not found' });
//   res.json(brand);
// };

const deleteBrand = async (req, res) => {
  const { id } = req.body;
  const brand = await Brand.findByIdAndDelete(id);
  if (!brand) return res.status(404).json({ message: 'Brand not found' });
  res.json({ message: 'Brand deleted successfully' });
};

module.exports = {
  createBrand: [upload.single('image'), validate(brandSchema), createBrand],
  getBrands,
  updateBrand: [upload.single('image'), validate(updateBrandSchema), updateBrand],
  getBrandById,
  deleteBrand,
};