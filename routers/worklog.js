const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createWorkLog, userGetWorklog, getAllWorklog, getSingleWorklog, updateWorklog, deleteWorklog } = require("../controllers/worklog")

router.post("/create",
    check('project', 'Project name is required').notEmpty(),
    check('logDate', 'Work log date is required').notEmpty(),
    check('time', 'Work log time is required').notEmpty(),
    check('description', 'Work log description is required').notEmpty(),
    auth, createWorkLog)

router.get('/user-worklog', auth, userGetWorklog)

router.post('/search-worklog', auth, userGetWorklog)

router.post('/admin-search-worklog', auth, isAdmin, getAllWorklog)

router.get('/', auth, isAdmin, getAllWorklog)

router.get('/single-worklog/:id', auth, getSingleWorklog)

router.put('/update-worklog/:id', auth, updateWorklog)

router.delete("/delete-worklog/:id", auth, deleteWorklog)

module.exports = router