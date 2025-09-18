const Banner = require('../models/Banner');
const multer = require('multer');
const path = require('path');
const validate = require('../middleware/validationMiddleware');
const Joi = require('joi');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const bannerSchema = Joi.object({
  subTitle: Joi.string().allow('').optional(),
  mainTitle: Joi.string().allow('').optional(),
  link: Joi.string().allow('').optional(),
});

const updateBannerSchema = Joi.object({
  id: Joi.string().required(),
  subTitle: Joi.string().allow('').optional(),
  mainTitle: Joi.string().allow('').optional(),
  link: Joi.string().allow('').optional(),
  image: Joi.any().optional(), 
});
const createBanner = async (req, res) => {
  try {
    const { subTitle, mainTitle, link } = req.body;

    // if (!mainTitle) {
    //   return res.status(400).json({ success: false, message: "Main title is required" });
    // }

    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const banner = new Banner({ subTitle, mainTitle, link, image });
    await banner.save();

    res.status(201).json({ success: true, message: "Banner created successfully", data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 }); 
    res.json({
      success: true,
      message: "Banners fetched successfully",
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};


const getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required",
      });
    }

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


const updateBanner = async (req, res) => {
  try {
    const { id, subTitle, mainTitle, link } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "Banner ID is required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updateData = {};
    if (subTitle) updateData.subTitle = subTitle;
    if (mainTitle) updateData.mainTitle = mainTitle;
    if (link) updateData.link = link;
    if (image) updateData.image = image;

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });

    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    res.json({ success: true, message: "Banner updated successfully", data: banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};


const deleteBanner = async (req, res) => {
  const { id } = req.body;
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) return res.status(404).json({ message: 'Banner not found' });
  res.json({ message: 'Banner deleted' });
};

module.exports = {
  createBanner: [upload.single('image'), validate(bannerSchema), createBanner],
  getBanners,
  updateBanner: [upload.single('image'), validate(updateBannerSchema), updateBanner],
  deleteBanner,
  getBannerById,
};