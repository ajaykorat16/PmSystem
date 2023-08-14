const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createProject, getAllProjects, getProjects, getUserProjects, updateProject, delelteProject, getSingleProject } = require("../controllers/projects")

router.get("/project-list", auth, getAllProjects)

router.post("/create",
    check('name', 'Project name is required').notEmpty(),
    check('startDate', 'Project start date is required').notEmpty(),
    check('description', 'Project description is required').notEmpty(),
    auth, isAdmin, createProject)

router.get("/", auth, isAdmin, getProjects)

router.get("/single-project/:id", auth, isAdmin, getSingleProject)

router.post("/project-search", auth, isAdmin, getProjects)

router.get("/developer-project-list", auth, getUserProjects)

router.post("/search-project-list", auth, getUserProjects)

router.put("/update-project/:id", auth, isAdmin, updateProject)

router.delete("/delete-project/:id", auth, isAdmin, delelteProject)

module.exports = router