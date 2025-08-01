const express = require("express");

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/user');

router.post('/signup',(req, res) => {

    bcrypt.hash(req.body.password, 10).then((hash) => {
        const user = new User({
            email: req.body.email,
            password: hash
        })

        user.save().then((result) => {
            res.status(201).json({
                message: "User successfully created",
                result: result
            })
        }).catch((err) => {
            res.status(500).json({
                error:err
            })
        })
    })

})

router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            return res.status(401).json({
                message:"Auth Failed",
            })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password,user.password)
    })
    .then((result) => {
        console.log(result)
        if(!result){
            return res.status(401).json({
                message:"Auth Failed",
            })
        }

        const token = jwt.sign(
            {email: fetchedUser.email, userId: fetchedUser._id},
            "secret_this_should_be_longer_do_you_understand",
            {expiresIn: '1h'}
        )

        res.status(200).json({
            token: token,
            expireIn: 3600,
            userId: fetchedUser._id
        })
    })
    .catch((err) => {
        return res.status(401).json({
            message:"Auth Failed",
        })
    })
})

module.exports = router