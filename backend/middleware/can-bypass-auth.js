module.exports = (req, res, next) =>{
    req.canBypassAuth = true;
    next();
}