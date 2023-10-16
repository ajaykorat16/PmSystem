const mongoose = require("mongoose");
const Credential = require("../models/credentials")
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { capitalizeFLetter } = require("../helper/mail");

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

const getCredential = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder || -1;
        const { filter } = req.body;

        let query = { "users.id": req.user._id };

        if (filter) {
            query.$or = [
                { title: { $regex: filter, $options: "i" } }
            ];
        }

        const totalCredentialCount = await Credential.countDocuments(query);

        const credential = await Credential.find(query).skip((page - 1) * limit).limit(limit).sort({ [sortField]: sortOrder }).lean();
        return res.status(201).json({
            error: false,
            message: "Credential Get Successfully",
            credential,
            currentPage: page,
            totalPages: Math.ceil(totalCredentialCount / limit),
            totalCredential: totalCredentialCount,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

const getSingleCredential = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Credential.findById(id).populate({ path: "users.id", select: "-photo", });
        return res.status(200).json({
            error: false,
            message: "Single Credential Get Successfully.",
            project,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

const updateCredential = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, users } = req.body;
        const { id } = req.params;

        const existingCredential = await Credential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({
                error: true,
                message: "This credential is not existing in the database.",
            });
        }

        if (existingCredential.title === capitalizeFLetter(title)) {
            return res.status(400).json({
                error: true,
                message: "Credential with the same title already exists.",
            });
        }

        const projectObj = {
            title: title ? capitalizeFLetter(title) : existingCredential.title,
            description: description ? capitalizeFLetter(description) : existingCredential.description,
            users: users || existingCredential.users,
        };

        if (users && Array.isArray(users)) {
            const newUserIds = users.map((p) => {
                return { id: new mongoose.Types.ObjectId(p) };
            });
            projectObj.users = [{ id: req.user._id }].concat(newUserIds);
        }

        const updatedCredential = await Credential.findByIdAndUpdate(id, projectObj, { new: true, });

        return res.status(200).json({
            error: false,
            message: "Credential updated successfully.",
            credential: updatedCredential,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

const deleteCredential = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const existingCredential = await Credential.findById(id);
        if (!existingCredential) {
            return res.status(404).json({
                error: true,
                message: "This credential is not existing in the database.",
            });
        }

        await Credential.findByIdAndDelete(id);
        return res.status(200).json({
            error: false,
            message: "Credential is delete successfully.",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

module.exports = { createCredential, getCredential, getSingleCredential, updateCredential, deleteCredential }