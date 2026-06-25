const jwt = require('jsonwebtoken');

const authMiddleware = function(req, res, next){
    const token = req.cookies.token;


    if(!token){
        return res.redirect("/login");
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } 
    catch(err){
        res.clearCookie('token');
        return res.redirect("/login");
    }
}

const isAdmin = function(req, res, next){
    if(req.user.role!=='admin'){
        return res.status(403).send('Access Denied');
    }
    next();
}

module.exports = {authMiddleware, isAdmin};