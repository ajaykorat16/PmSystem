const Projects = require("../models/projects");
const Users = require("../models/userModel")
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const { capitalizeFLetter, formattedDate } = require("../helper/mail");
const mongoose = require("mongoose");


const createProject = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, startDate, developers } = req.body;

        const projectObj = {
            name: capitalizeFLetter(name),
            description: capitalizeFLetter(description),
            startDate,
            developers
        };

        const projectName = await Projects.findOne({ name: projectObj.name })
        if (projectName) {
            return res.status(200).json({
                error: true,
                message: "Project has already created."
            })
        }

        const project = await Projects.create(projectObj);
        for (const developer of project.developers) {
            let id = developer.id
            let projectId = project._id
            await Users.findOneAndUpdate({ _id: id }, { $push: { projects: { id: projectId } } }, { new: true });
        }

        return res.status(201).json({
            error: false,
            message: "Project created successfully",
            project
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const getAllProjects = asyncHandler(async (req, res) => {
    try {
        const getAllProjects = await Projects.find().lean();

        const formatteProject = getAllProjects.map((project) => {
            return {
                ...project,
                startDate: formattedDate(project.startDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "All Projects retrieved successfully",
            getAllProjects: formatteProject
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
});

const getProjects = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1
        const { filter } = req.body;

        let query = {};

        if (filter) {
            function isValidDate(filter) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            } else {
                dateSearch = null;
            }

            query = {
                $or: [
                    { name: { $regex: filter, $options: "i" } },
                    { description: { $regex: filter, $options: "i" } },
                    { $expr: { $eq: [{ $month: "$startDate" }, isNaN(filter) ? null : filter] } },
                    { $expr: { $eq: [{ $year: "$startDate" }, isNaN(filter) ? null : filter] } },
                    { startDate: { $eq: dateSearch } },
                ],
            };
        }
        const totalProjects = await Projects.countDocuments(query);
        const skip = (page - 1) * limit;

        let projects = await Projects.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean();
        const formatteProject = projects.map((project) => {
            return {
                ...project,
                startDate: formattedDate(project.startDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "Project retrieved successfully",
            projects: formatteProject,
            currentPage: page,
            totalPages: Math.ceil(totalProjects / limit),
            totalProjects,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

const getUserProjects = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1;
        const userId = req.user._id;
        const { filter } = req.body;

        let query = { 'developers.id': userId };

        if (filter) {
            function isValidDate(filter) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"));
            } else {
                dateSearch = null;
            }

            query.$or = [
                { name: { $regex: filter, $options: "i" } },
                { description: { $regex: filter, $options: "i" } },
                { $expr: { $eq: [{ $month: "$startDate" }, isNaN(filter) ? null : filter] } },
                { $expr: { $eq: [{ $year: "$startDate" }, isNaN(filter) ? null : filter] } },
                { startDate: { $eq: dateSearch } }
            ]
        }

        const totalProjectsCount = await Projects.countDocuments(query);

        const matchingProjects = await Projects.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ [sortField]: sortOrder })
            .lean();

        const formattedProjects = matchingProjects.map((project) => ({
            ...project,
            startDate: formattedDate(project.startDate),
        }));

        return res.status(200).json({
            error: false,
            message: "Projects retrieved successfully",
            projects: formattedProjects,
            currentPage: page,
            totalPages: Math.ceil(totalProjectsCount / limit),
            totalProjects: totalProjectsCount,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const updateProject = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, description, startDate, developers } = req.body;
        const { id } = req.params;
        // let developersArr = JSON.parse(developers)

        console.log("developers", developers);

        const existingProject = await Projects.findById(id);
        if (!existingProject) {
            return res.status(404).json({
                error: true,
                message: "This project is not existing in the database."
            });
        }

        const projectObj = {
            name: capitalizeFLetter(name) || existingProject.name,
            description: capitalizeFLetter(description) || existingProject.description,
            startDate: startDate || existingProject.startDate,
            developers: developers || existingProject.developers
        };

        if (developers && Array.isArray(developers)) {
            const newdevelopersIds = developers.map((p) => { return { id: new mongoose.Types.ObjectId(p) } });
            console.log("newdevelopersIds", newdevelopersIds);
            projectObj.developers = newdevelopersIds;
        }

        const updatedProject = await Projects.findByIdAndUpdate(id, projectObj, { new: true });

        for (const developerId of existingProject.developers) {
            console.log("remove developerId", developers);
            // await Users.findByIdAndUpdate(developerId, { $pull: { projects: { id: id } } });
        }

        for (const developerId of developers) {
            console.log("add developerId", developers);
            // await Users.findByIdAndUpdate(developerId, { $addToSet: { projects: { id: id } } });
        }
        return res.status(200).json({
            error: false,
            message: "Project updated successfully",
            project: updatedProject
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const getSingleProject = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const project = await Projects.findById(id).populate({ path: "developers.id", select: "-photo" })
        return res.status(200).json({
            error: false,
            message: "Single project get successfully.",
            project: {
                ...project.toObject(),
                startDate: project.startDate.toISOString().split('T')[0]
            }
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

const delelteProject = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const project = await Projects.findByIdAndDelete(id)
        if (project) {
            await Users.updateMany(
                { projects: { $elemMatch: { id: id } } },
                { $pull: { projects: { id: id } } }
            );
        }
        return res.status(200).json({
            error: false,
            message: "Delete Project Successfully"
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
})

module.exports = { createProject, getAllProjects, getProjects, getUserProjects, updateProject, delelteProject, getSingleProject };
