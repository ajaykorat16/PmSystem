const jwt = require('jsonwebtoken');
const { knex } = require('../database/db');
const { USERS } = require('../constants/tables');

const auth = function (req, res, next) {

    const token = req.headers.authorization
    
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (error, decoded) => {
            if (error) {
                console.log(error)
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
        const user = await knex(USERS).where('id', req.user.id).first();
        if (user.role !== "admin") {
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