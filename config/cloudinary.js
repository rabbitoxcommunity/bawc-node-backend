const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const brandStorage = new CloudinaryStorage({
  cloudinary,
   params: {
    folder: 'brands',    
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const bannerStorage = new CloudinaryStorage({
  cloudinary,
    params: {
    folder: 'banners',    
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const categoryStorage = new CloudinaryStorage({
  cloudinary,
    params: {
    folder: 'categories',    
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const productsStorage = new CloudinaryStorage({
  cloudinary,
    params: {
    folder: 'products',    
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});
module.exports = { cloudinary, brandStorage, bannerStorage, categoryStorage , productsStorage};
