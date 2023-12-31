const Leaves = require("../models/leaveModel");
const Users = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { sendMailForLeaveStatus, sendMailForLeaveRequest, formattedDate, capitalizeFLetter, formatteDayType, parsedDayType } = require("../helper/mail");

const createLeave = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { reason, startDate, endDate, leaveType, leaveDayType, userId, status, totalDays } = req.body;

    if (startDate > endDate) {
      return res.status(200).json({
        error: true,
        message: "Please select proper date."
      })
    }

    let uId;
    if (userId) {
      uId = userId;
    } else {
      uId = req.user._id;
    }

    const user = await Users.findById({ _id: uId });

    let createLeaves;
    if (user.leaveBalance >= totalDays && leaveType === "paid" && user.leaveBalance !== 0) {
      createLeaves = await new Leaves({
        userId: uId,
        reason,
        startDate: startDate,
        endDate: endDate,
        leaveType,
        leaveDayType: parsedDayType(leaveDayType),
        status,
        totalDays,
      }).save();
    } else if (leaveType === "lwp") {
      createLeaves = await new Leaves({
        userId: uId,
        reason,
        startDate: startDate,
        endDate: endDate,
        leaveType,
        leaveDayType: parsedDayType(leaveDayType),
        status,
        totalDays,
      }).save();
    } else {
      return res.status(201).json({
        error: true,
        message: "Your leave balance is not enough to take paid leave!",
      });
    }

    await sendMailForLeaveRequest(createLeaves);

    if (status === "approved" && leaveType === "paid") {
      await Users.findByIdAndUpdate(uId, { $inc: { leaveBalance: -totalDays } }, { new: true });
      await sendMailForLeaveStatus(createLeaves, "-");
    }

    return res.status(201).json({
      error: false,
      message: "Leave Created Successfully !!",
      leave: createLeaves,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getAllLeaves = asyncHandler(async (req, res) => {
  try {
    const leaves = await Leaves.find().populate("userId").lean();
    const formattedLeaves = leaves.map((leave) => {
      return {
        ...leave,
        startDate: formattedDate(leave.startDate),
        endDate: formattedDate(leave.endDate),
      };
    });
    return res.status(200).json({
      error: false,
      message: "All Leaves getting successfully.",
      leaves: formattedLeaves,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getLeaves = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const { filter } = req.body;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = req.query.sortOrder || -1;

  try {
    let query = {};
    if (filter) {
      let fullName = [];
      let searchUser = await Users.find({
        fullName: { $regex: filter, $options: "i" },
      });
      if (searchUser.length !== 0) {
        fullName = searchUser.map((u) => {
          return u._id;
        });
      }
      query = {
        $or: [
          { leaveType: { $regex: filter.toLowerCase() } },
          { status: { $regex: filter.toLowerCase() } },
          { userId: { $in: fullName } },
        ],
      };
    }

    const totalLeaves = await Leaves.countDocuments(query);
    const skip = (page - 1) * limit;
    let leaves;

    if (sortField === "userId.fullName") {
      leaves = await Leaves.find(query).populate({ path: "userId", select: "fullName" }).skip(skip).limit(limit).lean();
      leaves.sort((a, b) => {
        const nameA = a.userId?.fullName || "";
        const nameB = b.userId?.fullName || "";
        return sortOrder * nameA.localeCompare(nameB);
      });
    } else {
      leaves = await Leaves.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate({ path: "userId", select: "fullName" }).lean();
    }

    const formattedLeaves = leaves.map((leave) => {
      return {
        ...leave,
        leaveType: capitalizeFLetter(leave.leaveType),
        leaveDayType: formatteDayType(leave.leaveDayType),
        status: capitalizeFLetter(leave.status),
        startDate: formattedDate(leave.startDate),
        endDate: formattedDate(leave.endDate),
      };
    });
    return res.status(200).json({
      error: false,
      message: "Leaves is retrieved successfully.",
      leaves: formattedLeaves,
      currentPage: page,
      totalPages: Math.ceil(totalLeaves / limit),
      totalLeaves,
    });
  } catch (error) {
    console.log(error);
  }
});

const userGetLeave = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { filter } = req.body;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || -1;
    let query = { userId: req.user._id };

    if (filter) {
      query = {
        userId: req.user._id,
        $or: [
          { leaveType: { $regex: filter.toLowerCase() } },
          { status: { $regex: filter.toLowerCase() } },
        ],
      };
    }

    const totalLeaves = await Leaves.countDocuments(query);
    const skip = (page - 1) * limit;

    const currentYear = new Date().getFullYear();

    const approvedLeaves = await Leaves.find({
      userId: req.user._id,
      status: "approved",
    });

    let totalApprovedLeaveDays = 0;

    for (const leave of approvedLeaves) {
      if (new Date(leave.startDate).getFullYear() === currentYear) {
        totalApprovedLeaveDays += leave.totalDays;
      }
    }

    const leaves = await Leaves.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate({ path: "userId", select: "fullName" }).lean();

    const formattedLeaves = leaves.map((leave) => {
      return {
        ...leave,
        leaveType: capitalizeFLetter(leave.leaveType),
        leaveDayType: formatteDayType(leave.leaveDayType),
        status: capitalizeFLetter(leave.status),
        startDate: formattedDate(leave.startDate),
        endDate: formattedDate(leave.endDate),
      };
    });

    return res.status(200).json({
      error: false,
      message: "All Leaves getting successfully.",
      leaves: formattedLeaves,
      currentPage: page,
      totalPages: Math.ceil(totalLeaves / limit),
      totalLeaves,
      approvedLeave: totalApprovedLeaveDays,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getLeaveById = asyncHandler(async (req, res) => {
  try {
    const leaves = await Leaves.findById(req.params.id).populate("userId").lean();
    return res.status(200).json({
      error: false,
      message: "Single Leave getting successfully !!",
      leaves: {
        ...leaves,
        leaveDayType: formatteDayType(leaves.leaveDayType),
        startDate: leaves.startDate.toISOString().split("T")[0],
        endDate: leaves.endDate.toISOString().split("T")[0],
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const updateLeave = asyncHandler(async (req, res) => {
  try {
    const { reason, startDate, endDate, leaveType, leaveDayType, status, userId, totalDays } = req.body;
    const { id } = req.params;

    if (startDate > endDate) {
      return res.status(200).json({
        error: true,
        message: "Please select proper date."
      })
    }
    const userLeave = await Leaves.findOne({ _id: id });

    const updatedFields = {
      userId: userId || userLeave.userId,
      reason: reason || userLeave.reason,
      status: status || userLeave.status,
      startDate: startDate || userLeave.startDate,
      endDate: endDate || userLeave.endDate,
      leaveType: leaveType || userLeave.leaveType,
      leaveDayType: parsedDayType(leaveDayType) || userLeave.leaveDayType,
      totalDays: totalDays || userLeave.totalDays,
    };

    const user = await Users.findById({ _id: updatedFields.userId }).select("-photo");

    let updateLeave;
    if (user.leaveBalance >= updatedFields.totalDays && updatedFields.leaveType === "paid" && user.leaveBalance !== 0) {
      updateLeave = await Leaves.findByIdAndUpdate({ _id: userLeave._id }, updatedFields, { new: true });
    } else if (updatedFields.leaveType === "lwp") {
      updateLeave = await Leaves.findByIdAndUpdate({ _id: userLeave._id }, updatedFields, { new: true });
    } else {
      return res.status(201).json({
        error: true,
        message: "Your leave balence is not enough to take paid leave!",
      });
    }

    return res.status(201).send({
      error: false,
      message: "Leave updated successfully.",
      leave: updateLeave,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const deleteLeave = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await Leaves.findByIdAndDelete({ _id: id });
    return res.status(201).send({
      error: false,
      message: "Leave deleted successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const updateStatus = asyncHandler(async (req, res) => {
  try {
    const { status, reasonForLeaveReject } = req.body;
    const { id } = req.params;

    let updateLeave;
    if (status === "rejected") {
      updateLeave = await Leaves.findByIdAndUpdate({ _id: id }, { status, reasonForLeaveReject }, { new: true });
      await sendMailForLeaveStatus(updateLeave, reasonForLeaveReject);
    }

    if (status === "approved") {
      updateLeave = await Leaves.findByIdAndUpdate({ _id: id }, { status }, { new: true });
      await sendMailForLeaveStatus(updateLeave, "-");
    }

    if (updateLeave.status === "approved" && updateLeave.leaveType === "paid") {
      await Users.findByIdAndUpdate(updateLeave.userId, { $inc: { leaveBalance: -updateLeave.totalDays } }, { new: true });
    }

    return res.status(201).send({
      error: false,
      message: "Status updated successfully.",
      leave: updateLeave,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getAllPendingLeave = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const { filter } = req.body;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || -1;

    let query = {status: "pending"};
    if (filter) {
      let fullName = [];
      let searchUser = await Users.find({
        fullName: { $regex: filter, $options: "i" },
      });
      if (searchUser.length !== 0) {
        fullName = searchUser.map((u) => {
          return u._id;
        });
      }
      query = {
        status:"pending",
        $or: [
          { leaveType: { $regex: filter.toLowerCase() } },
          { userId: { $in: fullName } },
        ],
      };
    }

    const totalLeaves = await Leaves.countDocuments(query);
    const skip = (page - 1) * limit;
    let leaves;

    if (sortField === "userId.fullName") {
      leaves = await Leaves.find(query).populate({ path: "userId", select: "fullName" }).skip(skip).limit(limit).lean();
      leaves.sort((a, b) => {
        const nameA = a.userId?.fullName || "";
        const nameB = b.userId?.fullName || "";
        return sortOrder * nameA.localeCompare(nameB);
      });
    } else {
      leaves = await Leaves.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate({ path: "userId", select: "fullName" }).lean();
    }

    const formattedLeaves = leaves.map((leave) => {
      return {
        ...leave,
        leaveType: capitalizeFLetter(leave.leaveType),
        leaveDayType: formatteDayType(leave.leaveDayType),
        status: capitalizeFLetter(leave.status),
        startDate: formattedDate(leave.startDate),
        endDate: formattedDate(leave.endDate),
      };
    });

    return res.status(200).json({
      error: false,
      message: "Pending Leaves is retrieved successfully.",
      leaves: formattedLeaves,
      currentPage: page,
      totalPages: Math.ceil(totalLeaves / limit),
      totalLeaves,
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = { createLeave, getAllLeaves, updateLeave, deleteLeave, userGetLeave, getLeaveById, getLeaves, updateStatus, getAllPendingLeave};
