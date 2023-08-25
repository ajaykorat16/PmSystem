const LeaveManagement = require("../models/leaveManagementModel");
const Users = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const moment = require('moment');
const { parsedDate } = require("../helper/mail")
const { validationResult } = require("express-validator");

const getLeavesMonthWise = asyncHandler(async (req, res) => {
  try {
    const d = new Date();
    let month = d.getMonth() + 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.body.filter || month;

    let query;
    if (filter) {
      query = {
        $or: [
          {
            $expr: {
              $eq: [{ $month: "$monthly" }, isNaN(filter) ? null : filter],
            },
          },
        ],
      };
    }

    const totalLeaves = await LeaveManagement.countDocuments(query);
    const skip = (page - 1) * limit;

    const leaves = await LeaveManagement.find(query).skip(skip).limit(limit).populate({ path: "user", select: "fullName" }).lean();
    return res.status(200).json({
      error: false,
      message: "Leaves getting successfully",
      leaves,
      currentPage: page,
      totalPages: Math.ceil(totalLeaves / limit),
      totalLeaves,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getSingleLeave = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const getLeave = await LeaveManagement.findById({ _id: id }).populate({ path: "user", select: "fullName" });
    return res.status(200).json({
      error: false,
      message: "Single Leave getting successfully !",
      getLeave,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const updateLeave = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { leave } = req.body;

    const getLeave = await LeaveManagement.findById(id).populate({ path: "user", select: "fullName leaveBalance" });
    if (!getLeave) {
      return res.status(404).json({ error: true, message: "Leave record not found" });
    }

    const leaveChange = leave - getLeave.leave;

    const updatedLeave = await LeaveManagement.findByIdAndUpdate(id, { leave }, { new: true });

    await Users.findByIdAndUpdate(getLeave.user._id, { $inc: { leaveBalance: leaveChange } }, { new: true });
    return res.status(200).json({
      error: false,
      message: "Leave update successfully",
      updatedLeave
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

const getUserLeaves = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const leaves = await LeaveManagement.find({ user: userId })
      .populate({ path: "user", select: "fullName" })
      .lean();

    return res.status(200).json({
      error: false,
      message: "User's Leaves getting successfully",
      leaves,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const createManageLeave = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, errors: errors.array() });
  }
  try {
    const { user, monthly, leave } = req.body

    if (leave < 1) {
      return res.status(200).json({
        error: true,
        message: "Leave value must be greater than and equal to 1."
      })
    }

    const today = new Date()
    const currentYear = today.getFullYear()
    const monthlyDate = moment(new Date(currentYear, monthly - 1, 1)).format('YYYY-MM-DD');

    const manageCreateLeave = await new LeaveManagement({ user, monthly: parsedDate(monthlyDate), leave }).save()
    await Users.findByIdAndUpdate(user, { $inc: { leaveBalance: leave } }, { new: true })

    return res.status(201).json({
      error: false,
      message: "Create Manage Leave Successfully.",
      manageLeave: manageCreateLeave
    })

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
})

module.exports = { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves, createManageLeave };
