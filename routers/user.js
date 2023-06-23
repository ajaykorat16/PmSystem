const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require("../middleware/auth")

const { createUser, loginUser, updateUser } = require("../controllers/user")

router.post("/register",
    check('firstname', 'Name is required').notEmpty(),
    check('lastname', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'phone number is required').notEmpty(),
    check('address', 'address number is required').notEmpty(),
    check('dateOfBirth', 'date of birth is required').notEmpty(),
    check('department', 'department number is required').notEmpty(),
    check('dateOfJoining', 'date of joining is required').notEmpty(),
    createUser
)

router.post("/login",
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    loginUser
)

router.put("/profile", auth, updateUser)

module.exports = router    
