const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createBanner, getBanners, updateBanner, deleteBanner, getBannerById } = require('../controllers/bannerController');

const router = express.Router();
router.post('/', protect, createBanner);
router.get('/', getBanners); // Public for homepage display
router.put('/', protect, updateBanner);
router.delete('/', protect, deleteBanner);
router.get('/:id', getBannerById);

module.exports = router;