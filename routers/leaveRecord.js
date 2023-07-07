const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave, getLeaveById } = require("../controllers/leaveRecord")

router.get("/", auth, isAdmin, getAllLeaves)

router.get("/userLeaves", auth, userGetLeave)

router.get("/getLeaveById/:id", auth, getLeaveById)

router.post("/createLeave",
    check('reason', 'reasone is required').notEmpty(),
    check('startDate', 'startDate is required').notEmpty(),
    check('endDate', 'endDate is required').notEmpty(),
    auth, createLeave)

router.post("/createLeaveAdmin",
    check('reason', 'reasone is required').notEmpty(),
    check('startDate', 'startDate is required').notEmpty(),
    check('endDate', 'endDate is required').notEmpty(),
    auth, isAdmin, createLeave)

router.put("/updateLeave", auth, updateLeave)

router.put("/updateLeave/:id", auth, isAdmin, updateLeave)

router.delete("/deleteLeave/:id", auth, isAdmin, deleteLeave)


module.exports = router