const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg'
  }

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      if (!ext) {
        throw new Error('Invalid mime type'); // reject non-image files
      }
      return {
        folder: 'my-app-images',
        format: ext, // ensure correct file extension
        public_id: Date.now().toString() // unique filename
      };
    }
  });

  module.exports = multer({ storage: storage }).single('image');