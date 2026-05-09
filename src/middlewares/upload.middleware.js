

const multer = require('multer');
const config = require('../config/env');

const MAX_FILE_SIZE_BYTES = config.upload.maxFileSizeMB * 1024 * 1024;


const storage = multer.memoryStorage();


function fileFilter(req, file, cb) {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, webp) are allowed'), false);
  }
}


const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
});


const uploadImage = upload.single('image');


function uploadImageWithErrorHandling(req, res, next) {
  uploadImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          msg: `File too large. Max size: ${config.upload.maxFileSizeMB}MB`,
        });
      }

      return res.status(400).json({ msg: err.message });
    }
    if (err) {

      return res.status(400).json({ msg: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ msg: 'Image file is required' });
    }
    next();
  });
}

module.exports = { uploadImage: uploadImageWithErrorHandling };