const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")
const formidableMiddleware = require('express-formidable');

const { createUser, loginUser, updateUser, deleteUserProfile, getAllUser, getUserProfile, changePasswordController, getUsers, getUserByBirthDayMonth, loginUserByAdmin, userForCredential, setDateOfLeaving } = require("../controllers/user")

router.get("/", auth, getUsers)

router.get("/userList", auth, isAdmin, getAllUser)

router.get("/getUserProfile/:id", auth, formidableMiddleware(), getUserProfile)

router.get("/credentialUser", auth, userForCredential)

router.get("/getUserByBirthDayMonth", auth, getUserByBirthDayMonth)

router.post("/getUserByBirthDayMonth-search", auth, getUserByBirthDayMonth)

router.get("/profile", auth, getUserProfile)

router.get('/admin-auth', auth, isAdmin, (req, res) => {
    res.status(200).json({ ok: true })
})

router.get('/user-auth', auth, (req, res) => {
    res.status(200).json({ ok: true })
})

router.post("/register",
    check('employeeNumber', 'Employee Number is reruired.').notEmpty(),
    check('firstname', 'Firstname is required.').notEmpty(),
    check('lastname', 'Lastname is required.').notEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    check('phone', 'Phone number is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('dateOfBirth', 'Date of birth is required.').notEmpty(),
    check('department', 'Department is required.').notEmpty(),
    check('dateOfJoining', 'Date of joining is required').notEmpty(),
    createUser
)

router.post("/addUser",
    check('employeeNumber', 'Employee Number is reruired.').notEmpty(),
    check('firstname', 'Firstname is required.').notEmpty(),
    check('lastname', 'Lastname is required.').notEmpty(),
    check('email', 'Please include a valid email.').isEmail(),
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    check('phone', 'Phone number is required.').notEmpty(),
    check('address', 'Address is required.').notEmpty(),
    check('dateOfBirth', 'Date of birth is required.').notEmpty(),
    check('department', 'Department is required.').notEmpty(),
    check('dateOfJoining', 'Date of joining is required').notEmpty(),
    auth, isAdmin, createUser
)

router.post("/login",
    check('email', 'Email is required.').isEmail(),
    check('password', 'Password is required.').notEmpty(),
    loginUser
)

router.post("/loginByAdmin",
    check('email', 'Email is required.').isEmail(), auth,
    loginUserByAdmin
)

router.put("/updateProfile", auth, updateUser)

router.put("/updateProfile/:id", auth, isAdmin, updateUser)

router.put("/date-of-leaving/:id",
    check('dateOfLeaving', 'Date of leaving is required').notEmpty(),
    auth, isAdmin, setDateOfLeaving)

router.put("/resetPassword",
    check('password', 'Please enter a password with 6 or more characters.').isLength({ min: 6 }),
    auth, changePasswordController
)

router.delete("/deleteProfile/:id", auth, isAdmin, deleteUserProfile)

module.exports = router    
