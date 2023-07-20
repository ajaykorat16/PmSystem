const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {auth, isAdmin} = require("../middleware/auth")
const formidableMiddleware = require('express-formidable');


const { createUser, loginUser, updateUser, deleteUserProfile, getAllUser, getUserProfile, changePasswordController, getUsers } = require("../controllers/user")

router.get("/userList", auth, isAdmin, getAllUser)

router.get("/", auth, isAdmin, getUsers)

router.post("/user-search", auth, isAdmin, getUsers)

router.get("/profile", auth, getUserProfile)

router.get('/admin-auth',auth,isAdmin,(req,res)=>{
    res.status(200).json({ok:true})
})

router.get('/user-auth', auth, (req,res)=>{
    res.status(200).json({ok:true})
})

router.post("/register",
    check('employeeNumber', 'Employee Number is reruired').notEmpty(),
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

router.post("/addUser",
    check('employeeNumber', 'Employee Number is reruired').notEmpty(),
    check('firstname', 'Name is required').notEmpty(),
    check('lastname', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'phone number is required').notEmpty(),
    check('address', 'address number is required').notEmpty(),
    check('dateOfBirth', 'date of birth is required').notEmpty(),
    check('department', 'department number is required').notEmpty(),
    check('dateOfJoining', 'date of joining is required').notEmpty(),
    auth, isAdmin, createUser
)

router.post("/login",
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').notEmpty(),
    loginUser
)

router.put("/updateProfile", auth, formidableMiddleware(), updateUser)

router.put("/updateProfile/:id", auth, isAdmin, formidableMiddleware(), updateUser)

router.get("/getUserProfile/:id", auth, formidableMiddleware(), getUserProfile)

router.delete("/deleteProfile/:id", auth, isAdmin, deleteUserProfile)

router.put("/resetPassword", 
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    auth, changePasswordController
)

module.exports = router    
