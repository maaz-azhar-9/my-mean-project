const express = require("express");

const router = express.Router();

const multer = require('multer');

const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null
    }
    cb(error, 'backend/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  },
})

const postsController = require('../controllers/posts')

router.post('', checkAuth, multer({ storage: storage }).single('image'), postsController.creatPost);

router.get('', postsController.getPosts)

router.put('/:id', checkAuth, multer({ storage: storage }).single('image'), postsController.updatePost)

router.delete("/:id", checkAuth, postsController.deletePost)

router.get("/:id", checkAuth, postsController.getPost);

module.exports = router;