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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1;
        const userId = req.user._id;
        const { filter } = req.body;

        let query = { userId: userId };

        if (filter) {
            function isValidDate(filter) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch = null;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            }

            let projects = [];
            let searchProjects = await Projects.find({ name: { $regex: filter, $options: 'i' } });
            if (searchProjects.length !== 0) {
                projects = searchProjects.map((d) => d._id);
            }

            query.$or = [
                { description: { $regex: filter, $options: "i" } },
                { project: { $in: projects } },
                { logDate: dateSearch },
            ];
        }

        const totalWorklogCount = await Worklog.countDocuments(query);

        const worklog = await Worklog.find(query).populate({ path: "project", select: "name" }).skip((page - 1) * limit).limit(limit).sort({ [sortField]: sortOrder }).lean();
        const formatteWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });
        return res.status(200).json({
            error: false,
            message: "Worklog get successfully",
            worklog: formatteWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

async function generateWorklogQuery(filter) {
    return new Promise(async (resolve, reject) => {
        const query = {};

        if (filter.project) {
            query.project = filter.project;
        }

        if (filter.userId) {
            query.userId = filter.userId;
        }

        if (filter.description) {
            query.description = { $regex: filter.description, $options: "i" };
        }

        if (filter.logDate) {
            const dateSearch = new Date(filter.logDate);
            dateSearch.setMinutes(dateSearch.getMinutes() - dateSearch.getTimezoneOffset());
            query.logDate = dateSearch.toISOString();
        }
        resolve(query);
    });
}

const getAllWorklog = asyncHandler(async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1;
        const filter = req.body.filter;
        let query = {}

        if (typeof filter !== 'undefined') {
            query = await generateWorklogQuery(filter);
        }

        const totalWorklogCount = await Worklog.countDocuments(query);
        const worklog = await Worklog.find(query)
            .populate({ path: "userId", select: "fullName" })
            .populate({ path: "project", select: "name" })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean();

        const formatteWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });


        return res.status(200).json({
            error: false,
            message: "Worklog get successfully",
            worklog: formatteWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
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
