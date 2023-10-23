const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave, getLeaveById, getLeaves, updateStatus } = require("../controllers/leaveRecord")

router.get("/", auth, isAdmin, getAllLeaves)

router.get("/leavelist", auth, isAdmin, getLeaves)

router.post("/leavelist-search", auth, isAdmin, getLeaves)

router.get("/userLeaves", auth, userGetLeave)

router.post("/userLeaves-search", auth, userGetLeave)

router.get("/getLeaveById/:id", auth, getLeaveById)

router.post("/createLeave",
    check('reason', 'Reason is required.').notEmpty(),
    check('startDate', 'Start date is required.').notEmpty(),
    check('endDate', 'End date is required.').notEmpty(),
    check('leaveType', 'Leave type is required.').notEmpty(),
    check('leaveDayType', 'Leave day type is required.').notEmpty(),
    auth, createLeave)

router.post("/createLeaveAdmin",
    check('userId', 'User name is required').notEmpty(),
    check('reason', 'Reason is required.').notEmpty(),
    check('startDate', 'Start date is required.').notEmpty(),
    check('endDate', 'End date is required.').notEmpty(),
    check('leaveType', 'Leave type is required.').notEmpty(),
    check('leaveDayType', 'Leave day type is required.').notEmpty(),
    auth, isAdmin, createLeave)

router.put("/updateLeave/:id", auth, updateLeave)

router.put("/updateStatus/:id", auth, isAdmin, updateStatus);

router.delete("/deleteLeave/:id", auth, deleteLeave)

module.exports = router