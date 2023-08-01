const express = require('express')
const router = express.Router();
const { auth, isAdmin } = require("../middleware/auth");
const { getLeavesMonthWise, getSingleLeave, updateLeave } = require('../controllers/leavemanagement');

router.get("/", auth, isAdmin, getLeavesMonthWise)

router.post("/search", auth, isAdmin, getLeavesMonthWise)

router.get("/singleLeave/:id", auth, isAdmin, getSingleLeave)

router.put("/updateLeave/:id", auth, isAdmin, updateLeave)

module.exports = router
