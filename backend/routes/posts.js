const express = require("express");

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const canBypassAuth = require('../middleware/can-bypass-auth');

const postsController = require('../controllers/posts');

const extractFile = require('../middleware/file')

router.post('', checkAuth, extractFile, postsController.creatPost);

router.get('', postsController.getPosts)

router.put('/:id', checkAuth, extractFile, postsController.updatePost)

router.delete("/:id", checkAuth, postsController.deletePost)

router.get("/:id", canBypassAuth, checkAuth, postsController.getPost);

router.post('/semanticSearch',postsController.semanticSearch);

router.post('/AiFeatureHealthCheck', postsController.AiFeatureHealthCheck);

module.exports = router;