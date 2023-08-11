const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createProject, getProjects, getUserProjects, updateProject, delelteProject } = require("../controllers/projects")

router.post("/create",
    check('name', 'Project name is required').notEmpty(),
    check('startDate', 'Project start date is required').notEmpty(),
    check('description', 'Project description is required').notEmpty(),
    auth, isAdmin, createProject)

router.get("/", auth, isAdmin, getProjects)

router.get("/developer-project-list", auth, getUserProjects)

router.put("/update-project/:id", auth, isAdmin, updateProject)

router.delete("/delete-project/:id", auth, isAdmin, delelteProject)

module.exports = router