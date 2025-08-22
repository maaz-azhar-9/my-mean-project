const express = require("express");

const router = express.Router();

const checkAuth = require('../middleware/check-auth');

const likeController = require('../controllers/likes');

router.post('/:postId/:userId', checkAuth, likeController.like);

router.delete('/:postId/:userId', checkAuth, likeController.removeLike);


module.exports = router;

