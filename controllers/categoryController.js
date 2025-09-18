const Category = require('../models/Category');
const multer = require('multer');
const path = require('path');
const validate = require('../middleware/validationMiddleware');
const Joi = require('joi');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const categorySchema = Joi.object({
  name: Joi.string().required(),
});

const updateCategorySchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().allow('').optional(),
  image: Joi.any().optional(), 
});


// Create Category
const createCategory = async (req, res) => {
  try {
    let { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    name = name.trim().toLowerCase();

    const existing = await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) {
      return res.status(400).json({ success: false, message: "Category name already exists" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const category = new Category({ name, image });
    await category.save();

    res.status(201).json({ success: true, message: "Category created successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


// Get Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 }); 
    res.json({
      success: true,
      message: "Categories fetched successfully",
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// Get Category by ID

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = {};

    if (name) {
      const normalizedName = name.trim().toLowerCase();

      // Check if another category already has this name (case insensitive)
      const existing = await Category.findOne({
        _id: { $ne: id }, // exclude current category
        name: new RegExp(`^${normalizedName}$`, "i"),
      });

      if (existing) {
        return res.status(400).json({ success: false, message: "Category name already exists" });
      }

      updateData.name = normalizedName;
    }

    if (image) updateData.image = image;

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category updated successfully", data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Category ID is required" });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

module.exports = {
  createCategory: [upload.single('image'), validate(categorySchema), createCategory],
  getCategories,
  updateCategory: [upload.single('image'), validate(updateCategorySchema), updateCategory],
  deleteCategory,
  getCategoryById
};