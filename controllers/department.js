const Department = require("../models/departmentModel")
const Users = require("../models/userModel")
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler')
const { capitalizeFLetter } = require("../helper/mail")

const createDepartment = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body

        const existingDepartment = await Department.findOne({ name })
        if (existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department Is Already Existing"
            })
        }

        const newDepartment = await new Department({ name: capitalizeFLetter(name) }).save()
        res.status(201).send({
            error: false,
            message: "Department Create Successfully !!",
            department: newDepartment
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const updateDepartment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const { name } = req.body

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing"
            })
        }

        const updateDepartment = await Department.findByIdAndUpdate({ _id: id }, { name: capitalizeFLetter(name) }, { new: true })
        return res.status(201).json({
            error: false,
            message: "Department update successfully!!",
            updateDepartment
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const deleteDepartment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing"
            })
        }

        await Department.findByIdAndDelete({ _id: id })

        const user = await Users.findOne({ department: id })
        if (user) {
            await Users.updateMany({ department: id }, { $unset: { department: "" } })
            return res.status(200).json({
                error: false,
                message: "Department delete successfully!!",
            })
        }
        return res.status(200).json({
            error: false,
            message: "Department delete successfully!!",
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const getAllDepartment = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.query || '';
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = parseInt(req.query.sortOrder) || -1

    try {
        const query = {
            name: { $regex: filter, $options: 'i' },
        };
        const totalDepartments = await Department.countDocuments(query);
        const skip = (page - 1) * limit;

        const departments = await Department.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit);
        return res.status(200).json({
            error: false,
            message: 'Departments retrieved successfully',
            departments,
            currentPage: page,
            totalPages: Math.ceil(totalDepartments / limit),
            totalDepartments,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
});

const getDepartmentList = asyncHandler(async (req, res) => {
    try {
        const departments = await Department.find()
        return res.status(200).json({
            error: false,
            message: "Departments retrieved successfully",
            departments,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
});

const getSingleDepartment = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params

        const existingDepartment = await Department.findById({ _id: id })
        if (!existingDepartment) {
            return res.status(400).json({
                error: true,
                message: "Department is not existing"
            })
        }

        const getSingle = await Department.findById({ _id: id })
        return res.status(200).json({
            error: false,
            message: "Single Department getting successfull !",
            getSingle
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})


module.exports = { createDepartment, updateDepartment, deleteDepartment, getAllDepartment, getSingleDepartment, getDepartmentList }