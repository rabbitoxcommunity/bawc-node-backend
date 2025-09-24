const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const validate = require('../middleware/validationMiddleware');
const Joi = require('joi');

/* ---------------- MULTER CONFIG ---------------- */


const { productsStorage } = require('../config/cloudinary');
const upload = multer({ storage: productsStorage });

/* ---------------- VALIDATION SCHEMAS ---------------- */
const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  actualPrice: Joi.number().required(),
  discountPrice: Joi.number().allow('').optional(),
  isOutOfStock: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),
  category: Joi.string().required(), // ObjectId as string
  brand: Joi.string().required(),
});

const updateProductSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().allow('').optional(),
  description: Joi.string().allow('').optional(),
  actualPrice: Joi.number().optional(),
  discountPrice: Joi.number().allow(null).optional(),
  isOutOfStock: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  category: Joi.string().allow('').optional(),
  brand: Joi.string().allow('').optional(),
  imagesToKeep: Joi.string().allow('').optional(),
});

/* ---------------- CONTROLLERS ---------------- */
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      actualPrice,
      discountPrice,
      isOutOfStock,
      isFeatured,
      category,
      brand,
    } = req.body;

    // const images = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
    const images = req.files.map(file => file.path);

    const product = new Product({
      images,
      title,
      description,
      actualPrice,
      discountPrice,
      isOutOfStock,
      isFeatured,
      category,
      brand,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: error.message,
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, brand, sort, page = 1, limit = 10, search } = req.query;

    let query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;

    // 🔎 Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // case-insensitive
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; 
    if (sort === "lowToHigh" || sort === "highToLow") {
      const sortDirection = sort === "lowToHigh" ? 1 : -1;

      const products = await Product.aggregate([
        { $match: query },
        {
          $addFields: {
            effectivePrice: {
              $cond: {
                if: { $and: [{ $ne: ["$discountPrice", null] }, { $gt: ["$discountPrice", 0] }] },
                then: "$discountPrice",
                else: "$actualPrice",
              },
            },
          },
        },
        { $sort: { effectivePrice: sortDirection } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      ]);

      const total = await Product.countDocuments(query);

      return res.json({
        success: true,
        message: "Products fetched successfully",
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } else {
      if (sort === "newest") sortOption = { createdAt: -1 };
      if (sort === "oldest") sortOption = { createdAt: 1 };

      const products = await Product.find(query)
        .sort(sortOption)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate("category brand");

      const total = await Product.countDocuments(query);

      return res.json({
        success: true,
        message: "Products fetched successfully",
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};


const getProductById = async (req, res) => {
  try {
    const { id } = req.params; // query instead of params
    const product = await Product.findById(id).populate('category brand');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      message: 'Product fetched successfully',
      data: product,
    });
  } catch (error) {
    console.error('Get Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message,
    });
  }
};


const updateProduct = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      actualPrice,
      discountPrice,
      isOutOfStock,
      isFeatured,
      category,
      brand,
      imagesToKeep,
    } = req.body;

    let updatedImages = [];

    // Parse old images to keep
    if (imagesToKeep) {
      updatedImages = JSON.parse(imagesToKeep);
    }

    // Add new uploaded images (if any)
    if (req.files && req.files.length > 0) {
      // const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      const newImages = req.files.map(file => file.path);
      updatedImages = [...updatedImages, ...newImages];
    }

    // ✅ Deduplicate by filename, not full path
    const seen = new Set();
    updatedImages = updatedImages.filter((img) => {
      const filename = path.basename(img); // extract only filename
      if (seen.has(filename)) return false;
      seen.add(filename);
      return true;
    });

    const updateData = {
      title,
      description,
      actualPrice,
      discountPrice,
      isOutOfStock,
      isFeatured,
      category,
      brand,
      images: updatedImages,
    };

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
      error: error.message,
    });
  }
};


const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message,
    });
  }
};

/* ---------------- EXPORTS ---------------- */
module.exports = {
  createProduct: [upload.array('images', 10), validate(productSchema), createProduct],
  getProducts,
  getProductById,
  updateProduct: [upload.array('images', 10), validate(updateProductSchema), updateProduct],
  deleteProduct,
};
