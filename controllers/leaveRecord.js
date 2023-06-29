const Leaves = require("../models/leaveModel")
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler')


const createLeave = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { reasone, startDate, endDate, type, userId, status } = req.body
        // const { id } = req.params

        // let userId;
        // if (id) {
        //     userId = id
        // } else {
        //     userId = req.user._id
        // }    
     
        const createLeaves = await new Leaves({ userId, reasone, startDate, endDate, type, status }).save();
        return res.status(201).json({
            error: false,
            message: "Your Leave Create successfully !!",
            leave: createLeaves
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const getAllLeaves = asyncHandler(async (req, res) => {
    try {
        const leaves = await Leaves.find()
        return res.status(201).json({
            error: false,
            message: "Get All Leave successfully !!",
            leaves
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const userGetLeave = asyncHandler(async (req, res) => {
    try {
        const leaves = await Leaves.find({ userId: req.user._id })
        return res.status(201).json({
            error: false,
            message: "Get All Leave successfully !!",
            leaves
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const updateLeave = asyncHandler(async (req, res) => {
    try {
        const { reasone, startDate, endDate, type, status } = req.body
        const { id } = req.params;

        let userLeave;

        if (id) {
            userLeave = await Leaves.findOne({ userId: id });
        } else {
            userLeave = await Leaves.findOne({ userId: req.user._id });
        }

        const updatedFields = {
            reasone: reasone || userLeave.reasone,
            startDate: startDate || userLeave.startDate,
            endDate: endDate || userLeave.endDate,
            type: type || userLeave.type,
        }

        if (req.user.role === 1) {
            updatedFields.status = status || userLeave.status
        }

        const updateLeave = await Leaves.findByIdAndUpdate({ _id: userLeave._id }, updatedFields, { new: true });
        return res.status(201).send({
            error: false,
            message: "Leave Updated Successfully !!",
            updateLeave
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const deleteLeave = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const userLeave = await Leaves.findOne({ userId: id });
        await Leaves.findByIdAndDelete({ _id: userLeave._id });
        return res.status(201).send({
            error: false,
            message: "Leave Delete Successfully !!",
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

module.exports = { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave }