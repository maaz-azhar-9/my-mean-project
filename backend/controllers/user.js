
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res) => {

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
            console.log(err.errors.email.kind);
            if(err.errors.email.kind === "unique"){
                res.status(500).json({
                    message:"User already exists."
                })
            }
            else{
            res.status(500).json({
                message:"Invalid authentication credentials"
            })
           }
        })
    })

}

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({email: req.body.email}).then((user) => {
        if(!user){
            return res.status(401).json({
                message:"Invalid authentication credentials",
            })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password,user.password)
    })
    .then((result) => {
        if(!res.headersSent){
        if(!result){
            return res.status(401).json({
                message:"Invalid authentication credentials",
            })
        }

        const token = jwt.sign(
            {email: fetchedUser.email, userId: fetchedUser._id},
            process.env.JWT_KEY,
            {expiresIn: '1h'}
        )

        res.status(200).json({
            token: token,
            expireIn: 3600,
            userId: fetchedUser._id
        })
     }
    })
    .catch((err) => {
        return res.status(401).json({
            message:"Invalid authentication credentials",
        })
    })
}