const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth, isAdmin } = require("../middleware/auth")

const { createCredential } = require("../controllers/credentials")

router.post("/create",
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    auth, createCredential)

module.exports = router