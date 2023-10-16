const mongoose = require("mongoose");
const Projects = require("../models/projects");
const Users = require("../models/userModel");
const Worklog = require("../models/workLogmodel");
const Credential = require("../models/credentials")
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { capitalizeFLetter, formattedDate } = require("../helper/mail");

const createCredential = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, users } = req.body;

        const existingCredential = await Credential.findOne({ title: capitalizeFLetter(title) });

        if (existingCredential) {
            return res.status(400).json({
                error: true,
                message: "Credential with the same title already exists.",
            });
        }

        const credentialObj = {
            title: capitalizeFLetter(title),
            description: capitalizeFLetter(description),
            users: users ? [{ id: req.user._id }].concat(users) : [{ id: req.user._id }],
        };

        const credential = await Credential.create(credentialObj);
        return res.status(201).json({
            error: false,
            message: "Credential created successfully",
            credential,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

module.exports = { createCredential }