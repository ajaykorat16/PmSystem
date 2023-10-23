const express = require('express')
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const { check } = require('express-validator');

const { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves, createManageLeave } = require('../controllers/leavemanagement');

router.get("/", auth, isAdmin, getLeavesMonthWise)

router.post("/create-manageLeave",
    check('user', 'User is reruired.').notEmpty(),
    check('monthly', 'Month is reruired.').notEmpty(),
    check('leave', 'Leave is reruired.').notEmpty(),
    auth, isAdmin, createManageLeave)

router.post("/search", auth, isAdmin, getLeavesMonthWise)

router.get("/singleLeave/:id", auth, isAdmin, getSingleLeave)

router.put("/updateLeave/:id", auth, isAdmin, updateLeave)

router.get("/userLeaves", auth, getUserLeaves)

module.exports = router
