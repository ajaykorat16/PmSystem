const Department = require("../models/departmentModel")
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler')

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

        const newDepartment = await new Department({ name }).save()
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

        const updateDepartment = await Department.findByIdAndUpdate({ _id: id }, { name }, { new: true })
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
        return res.status(201).json({
            error: false,
            message: "Department delete successfully!!",
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const getAllDepartment = asyncHandler(async (req, res) => {
    try {
        const getAllDepartments = await Department.find()
        return res.status(200).json({
            error: false,
            message: "All Department get successfully!!",
            getAllDepartments
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})


module.exports = { createDepartment, updateDepartment, deleteDepartment, getAllDepartment }