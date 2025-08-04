const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    try{
    const token =  req.headers.authorization.split(" ")[1];
    const decodedJwt = jwt.verify(token,"secret_this_should_be_longer_do_you_understand");
    req.userData = { email: decodedJwt.email, userId: decodedJwt.userId }
    next()
    }
    catch(error){
        res.status(401).send({
            message:"You are not authenticated"
        })
    }
}