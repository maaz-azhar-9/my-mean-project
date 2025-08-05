const express = require("express");

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const postsController = require('../controllers/posts');

const extractFile = require('../middleware/file')

router.post('', checkAuth, extractFile, postsController.creatPost);

router.get('', postsController.getPosts)

router.put('/:id', checkAuth, extractFile, postsController.updatePost)

router.delete("/:id", checkAuth, postsController.deletePost)

router.get("/:id", checkAuth, postsController.getPost);

module.exports = router;