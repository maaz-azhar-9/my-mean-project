const express = require("express");

const router = express.Router();

const userConroller = require("../controllers/user");

router.post('/signup', userConroller.createUser);

router.post("/login", userConroller.userLogin);

module.exports = router