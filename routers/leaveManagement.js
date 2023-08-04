const express = require('express')
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves } = require('../controllers/leavemanagement');

router.get("/", auth, isAdmin, getLeavesMonthWise)

router.post("/search", auth, isAdmin, getLeavesMonthWise)

router.get("/singleLeave/:id", auth, isAdmin, getSingleLeave)

router.put("/updateLeave/:id", auth, isAdmin, updateLeave)

router.get("/userLeaves", auth, getUserLeaves)

module.exports = router
