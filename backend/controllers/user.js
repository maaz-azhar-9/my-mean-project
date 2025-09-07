
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.createUser = (req, res) => {
    if (req.body.password) {
        bcrypt.hash(req.body.password, 10).then((hash) => {
            const user = new User({
                email: req.body.email,
                password: hash,
                isPasswordSet: true
            })

            user.save().then((result) => {
                res.status(201).json({
                    message: "User successfully created",
                    result: result
                })
            }).catch((err) => {
                if (err.errors.email.kind === "unique") {
                    res.status(500).json({
                        message: "User already exists."
                    })
                }
                else {
                    res.status(500).json({
                        message: "Invalid authentication credentials"
                    })
                }
            })
        })
    }
    else {
        res.status(500).json({ message: "password should not be empty" })
    }

}

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email }).then((user) => {
        if (!user || !user?.isPasswordSet) {
            return res.status(401).json({
                message: "Invalid authentication credentials 1",
            })
        }
        fetchedUser = user;
        return bcrypt.compare(req.body.password, user.password)
    })
        .then((result) => {
            if (!res.headersSent) {
                if (!result) {
                    return res.status(401).json({
                        message: "Invalid authentication credentials 2",
                    })
                }

                res.status(200).json(loginResponse(fetchedUser.email, fetchedUser._id))
            }
        })
        .catch((err) => {
            return res.status(401).json({
                message: "Invalid authentication credentials 3",
            })
        })
}

exports.loginWithGoogle = async (req, res, next) => {
    const token = req.body.token;
    if(!token){
        res.status(500).json({message:"No token found!"});
    }
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        const data = await response.json()
        let user = await User.find({ email: data.email })
        if (!user.length) {
            const newuser = User({
                email: data.email,
                password: null,
                isPasswordSet: false
            })
            const savedUser = await newuser.save();

            res.status(200).json(loginResponse(savedUser.email, savedUser._id))
        }
        else {
            res.status(200).json(loginResponse(user[0].email, user[0]._id))
        }
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
}

function loginResponse(email, id) {

    const token = jwt.sign(
        { email: email, userId: id },
        process.env.JWT_KEY,
        { expiresIn: '1h' }
    )

    return {
        token: token,
        expireIn: 3600,
        userId: id,
        userName: email.split('@')[0]
    }
}