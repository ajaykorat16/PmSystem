const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { auth } = require("../middleware/auth")

const { createCredential, getCredential, getSingleCredential, updateCredential, deleteCredential } = require("../controllers/credentials")

router.get("/", auth, getCredential)

router.get("/single-credential/:id", auth, getSingleCredential)

router.post("/create",
    check('title', 'Title is required.').notEmpty(),
    check('description', 'Description is required.').notEmpty(),
    auth, createCredential)

router.put("/update/:id", auth, updateCredential)

router.delete("/delete/:id", auth, deleteCredential)

module.exports = router