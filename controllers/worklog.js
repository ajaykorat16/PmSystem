const Worklog = require("../models/workLogmodel")
const Projects = require("../models/projects");
const Users = require("../models/userModel")
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const { capitalizeFLetter, formattedDate } = require("../helper/mail");
const mongoose = require("mongoose");

const createWorkLog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { project, description, logDate, time } = req.body;
        const userId = req.user._id

        const logObj = {
            userId,
            project,
            description: capitalizeFLetter(description),
            logDate,
            time
        };

        const worklog = await Worklog.create(logObj);

        return res.status(201).json({
            error: false,
            message: "Worklog  created successfully",
            worklog
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const userGetWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.user._id

        const worklog = await Worklog.find({ userId: userId }).populate({ path: "project", select: "name" }).lean();
        const formatteWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });
        return res.status(200).json({
            error: false,
            message: "Worklog get successfully",
            worklog: formatteWorklog
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const getAllWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const worklog = await Worklog.find().populate({ path: "userId", select: "fullName" }).populate({ path: "project", select: "name" }).lean();
        const formatteWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });
        return res.status(200).json({
            error: false,
            message: "Worklog get successfully",
            worklog: formatteWorklog
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const getSingleWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params
        const worklog = await Worklog.findById({ _id: id }).populate({ path: "userId", select: "fullName" }).populate({ path: "project", select: "name" });
        return res.status(200).json({
            error: false,
            message: "single worklog get successfully",
            worklog: {
                ...worklog.toObject(),
                logDate: worklog.logDate.toISOString().split('T')[0]
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const updateWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params
        const { project, description, logDate, time } = req.body;

        const worklog = await Worklog.findById({ _id: id });
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist"
            })
        }

        const updatedFeilds = {
            project: project || worklog.project,
            description: capitalizeFLetter(description) || worklog.description,
            logDate: logDate || worklog.logDate,
            time: time || worklog.time
        }

        const updateworklog = await Worklog.findByIdAndUpdate(id, updatedFeilds, { new: true })
        return res.status(200).json({
            error: false,
            message: "Update worklog successfully",
            worklog: updateworklog
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const deleteWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params

        const worklog = await Worklog.findById({ _id: id });
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist"
            })
        }

        const updateworklog = await Worklog.findByIdAndDelete(id)
        return res.status(200).json({
            error: false,
            message: "Delete worklog successfully",
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


module.exports = { createWorkLog, userGetWorklog, getAllWorklog, getSingleWorklog, updateWorklog, deleteWorklog }
