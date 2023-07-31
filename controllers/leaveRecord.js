const Leaves = require("../models/leaveModel")
const Users = require("../models/userModel")
const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler')
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

    const leaveDaysCount =  (startDate, endDate) => {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);
  
    let currentDate = new Date(startDate);
    let totalDays = 0;
  
    while (currentDate <= eDate) {
      const dayOfWeek = currentDate.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalDays
    // this.totalDaysExcludingWeekends = totalDays;
  };

const sendMailForLeaveStatus = async (user, status) => {
    try {
        const { fullName, email } = user
        const mailOptions = {
            from: process.env.MAIL_FROM_EMAIL,
            to: email,
            subject: "Leave Status",
            text: `${fullName}, Your leave is ${status}`,
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log("Mail.sendEmail [ERROR: " + err + "]");
                return { error: true, message: err };
            }
            console.log("Mail.sendEmail [SUCCESS]");
            return { error: false, message: "Email sent successfully!" };

        });
    } catch (error) {
        console.error("Error sending email:", error);
        return { status: false, message: "Failed to send email." };
    }
};

const sendMailForLeaveRequest = async (user, data) => {
    try {
        const { reason, startDate, endDate, type } = data;
        const { fullName } = user
        const adminUser = await Users.findOne({ role: 'admin' }).select("email");
        const mailOptions = {
            from: process.env.MAIL_FROM_EMAIL,
            to: adminUser.email,
            subject: "Leave Request",
            text: `
            Leave Request from: ${fullName}
            Reason: ${reason}
            Start Date: ${startDate}
            End Date: ${endDate}
            Type: ${type}`,
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log("Mail.sendEmail [ERROR: " + err + "]");
                return { error: true, message: err };
            }
            console.log("Mail.sendEmail [SUCCESS]");
            return { error: false, message: "Email sent successfully!" };

        });
    } catch (error) {
        console.error("Error sending email:", error);
        return { status: false, message: "Failed to send email." };
    }
};

const createLeave = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { reason, startDate, endDate, type, userId, status, totalDays } = req.body
        let uId
        if (userId) {
            uId = userId
        } else {
            uId = req.user._id
        }
        const createLeaves = await new Leaves({ userId: uId, reason, startDate, endDate, type, status, totalDays }).save();
        const user = await Users.find({ _id: uId }).select("-photo")
        await sendMailForLeaveRequest(user[0], createLeaves)
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

function capitalizeFLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

const getLeaves = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const { filter } = req.body;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder || -1

    try {
        let query = {};
        if (filter) {
            let fullName = [];
            let searchUser = await Users.find({ fullName: { $regex: filter, $options: 'i' } })
            if (searchUser.length !== 0) {
                fullName = searchUser.map((u) => {
                    return u._id
                })
            }
            query = {
                $or: [
                    { type: { $regex: filter.toLowerCase() } },
                    { status: { $regex: filter.toLowerCase() } },
                    { userId: { $in: fullName } },
                ]
            }
        }

        const totalLeaves = await Leaves.countDocuments(query)
        const skip = (page - 1) * limit;
        let leaves;
        if (sortField === 'userId.fullName') {

            leaves = await Leaves.find(query)
                .populate({
                    path: 'userId',
                    select: 'fullName',
                })
                .skip(skip)
                .limit(limit)
                .lean();

            leaves.sort((a, b) => {
                const nameA = a.userId?.fullName || '';
                const nameB = b.userId?.fullName || '';
                return sortOrder * nameA.localeCompare(nameB);
            });
        } else {
            leaves = await Leaves.find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'userId',
                    select: 'fullName',
                })
                .lean();

        }
        const formattedLeaves = leaves.map((leave, i) => {
            const index = i + 1
            return {
                ...leave,
                type: capitalizeFLetter(leave.type),
                status: capitalizeFLetter(leave.status),
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const { filter } = req.body;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1
        let query = { userId: req.user._id };
        if (filter) {
            query = {
                userId: req.user._id,
                $or: [
                    { type: { $regex: filter.toLowerCase() } },
                    { status: { $regex: filter.toLowerCase() } }
                ]
            }
        }
        const totalLeaves = await Leaves.countDocuments(query)
        const skip = (page - 1) * limit;
        const leaves = await Leaves.find(query)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'userId',
                select: 'fullName',
            })
            .lean();
        const formattedLeaves = leaves.map((leave, i) => {
            const index = i + 1
            return {
                ...leave,
                type: capitalizeFLetter(leave.type),
                status: capitalizeFLetter(leave.status),
                index: index,
                startDate: leave.startDate.toISOString().split('T')[0],
                endDate: leave.endDate.toISOString().split('T')[0],
            };
        });
        return res.status(200).json({
            error: false,
            message: "Get All Leave successfully !!",
            leaves: formattedLeaves,
            currentPage: page,
            totalPages: Math.ceil(totalLeaves / limit),
            totalLeaves
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
            leaves: {
                ...leaves,
                startDate: leaves.startDate.toISOString().split('T')[0],
                endDate: leaves.endDate.toISOString().split('T')[0],
            }
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const updateLeave = asyncHandler(async (req, res) => {
    try {
        const { reason, startDate, endDate, type, status, userId, totalDays } = req.body
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
            totalDays: totalDays || userLeave.totalDays
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

const updateStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.body
        const { id } = req.params;

        const updateLeave = await Leaves.findByIdAndUpdate({ _id: id }, { status }, { new: true }).populate({ path: "userId", select: "-photo" });
        let user = updateLeave.userId
        await sendMailForLeaveStatus(user, status)
        return res.status(201).send({
            error: false,
            message: "Status Updated Successfully !!",
            leave: updateLeave
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

module.exports = { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave, getLeaveById, getLeaves, updateStatus }