const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createDepartment, updateDepartment, deleteDepartment, getAllDepartment, getSingleDepartment } = require("../controllers/department")

router.get("/",auth, isAdmin, getAllDepartment)

router.get("/getSingleDepartment/:id",auth, isAdmin, getSingleDepartment)

router.post("/createDepartment",
    check('name', 'Name is required').notEmpty(),
    auth, isAdmin, createDepartment)


router.put("/updateDepartment/:id",auth, isAdmin, updateDepartment)

router.delete("/deleteDepartment/:id",auth, isAdmin, deleteDepartment)


module.exports = router