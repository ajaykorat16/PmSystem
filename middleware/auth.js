const jwt = require('jsonwebtoken');
const Users = require("../models/userModel")

const auth = function (req, res, next) {

    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const [bearer, token] = authorizationHeader.split(' ');

    // Verify token
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                return res.status(401).json({ msg: 'Token is not valid' });
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await Users.findById(req.user._id)
        console.log("admin---->", user)
        if (user.role !== 1) {
            return res.status(401).send({
                success: false,
                message: "UnAuthorized Access"
            })
        } else {
            next();
        }
    } catch (error) {
        return res.status(401).send({
            success: false,
            message: "Error In Admin Middleware",
            error: error.message
        })
    }
}

module.exports = { auth, isAdmin }