const Leaves = require("../models/leaveModel")
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler')


const createLeave = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { reason, startDate, endDate, type, userId, status } = req.body
        let uId
        if(userId){
            uId = userId
        }else{
            uId = req.user._id
        }

        const createLeaves = await new Leaves({ userId:uId, reason, startDate, endDate, type, status }).save();
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
        const leaves = await Leaves.find().populate("userId").lean()
        const formattedLeaves = leaves.map(leave => {
            return {
                ...leave,
                startDate: leave.startDate.toISOString().split('T')[0],
                endDate: leave.endDate.toISOString().split('T')[0]
            };
        });
        return res.status(200).json({
            error: false,
            message: "Get All Leave successfully !!",
            leaves: formattedLeaves
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const getLeaves = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const filter = req.query.query || '';
    try {
        const query = {
            reason: { $regex: filter, $options: 'i' },
        };
        const totalLeaves = await Leaves.countDocuments(query)
        const skip = (page - 1) * limit;
        const leaves = await Leaves.find(query).skip(skip).limit(limit).populate("userId").lean()
        const formattedLeaves = leaves.map((leave, i) => {
            const index = i + 1
            const name = leave.userId.firstname + " " + leave.userId.lastname
            return {
                ...leave,
                name: name,
                index: index,
                startDate: leave.startDate.toISOString().split('T')[0],
                endDate: leave.endDate.toISOString().split('T')[0]
            };
        });
        return res.status(200).json({
            error: false,
            message: "Leaves retrieved successfully !!",
            leaves: formattedLeaves,
            currentPage: page,
            totalPages: Math.ceil(totalLeaves / limit),
            totalLeaves,
        })
    } catch (error) {
        console.log(error);
    }
})

const userGetLeave = asyncHandler(async (req, res) => {
    try {
        const leaves = await Leaves.find({ userId: req.user._id }).populate("userId").lean()
        return res.status(200).json({
            error: false,
            message: "Get All Leave successfully !!",
            leaves
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})


const getLeaveById = asyncHandler(async (req, res) => {
    try {
        const leaves = await Leaves.findById(req.params.id).populate('userId').lean();
        return res.status(200).json({
            error: false,
            message: "Get Leave successfully !!",
            leaves:{
                ...leaves,
                startDate:leaves.startDate.toISOString().split('T')[0],
                endDate:leaves.endDate.toISOString().split('T')[0],
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})


const updateLeave = asyncHandler(async (req, res) => {
    try {
        const { reason, startDate, endDate, type, status, userId } = req.body
        const { id } = req.params;

        let userLeave;

        if (id) {
            userLeave = await Leaves.findOne({ _id: id });
        } else {
            userLeave = await Leaves.findOne({ userId: req.user._id });
        }

        const updatedFields = {
            userId: userId || userLeave.userId,
            reason: reason || userLeave.reason,
            status: status || userLeave.status,
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
            leave: updateLeave
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const deleteLeave = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        await Leaves.findByIdAndDelete({ _id: id });
        return res.status(201).send({
            error: false,
            message: "Leave Delete Successfully !!",
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

module.exports = { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave, getLeaveById, getLeaves }