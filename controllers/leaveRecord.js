const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { sendMailForLeaveStatus, sendMailForLeaveRequest, formattedDate, capitalizeFLetter, formatteDayType, parsedDayType } = require("../helper/mail");
const { USERS, LEAVES } = require('../constants/tables');
const { knex } = require('../database/db');


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
      uId = req.user.id;
    }

    const user = await knex(USERS).where("id", uId).first();

    let createLeaves;
    if (user.leaveBalance >= totalDays && leaveType === "paid" && user.leaveBalance !== 0) {
      const leaveData = {
        userId: uId,
        reason,
        startDate: startDate,
        endDate: endDate,
        leaveType,
        leaveDayType: parsedDayType(leaveDayType),
        status,
        totalDays,
      };
      createLeaves = await knex(LEAVES).insert(leaveData);
    } else if (leaveType === "lwp") {
      const leaveData = {
        userId: uId,
        reason,
        startDate: startDate,
        endDate: endDate,
        leaveType,
        leaveDayType: parsedDayType(leaveDayType),
        status,
        totalDays,
      };
      createLeaves = await knex(LEAVES).insert(leaveData);
    } else {
      return res.status(201).json({
        error: true,
        message: "Your leave balance is not enough to take paid leave!",
      });
    }

    await sendMailForLeaveRequest(createLeaves);

    if (status === "approved" && leaveType === "paid") {
      if (user.leaveBalance >= totalDays) {
        await knex(USERS).where("id", uId).decrement("leaveBalance", totalDays);
        await sendMailForLeaveStatus(createLeaves, "-");
      } else {
        return res.status(201).json({
          error: true,
          message: `${user.fullName}'s leave balance is not enough to take paid leave!`,
        });
      }
    }

    return res.status(201).json({
      error: false,
      message: "Leave Created Successfully !!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getAllLeaves = asyncHandler(async (req, res) => {
  try {
    const leaves = await knex
      .select("l.*", "u.fullName as username")
      .from(`${LEAVES} as l`)
      .innerJoin(`${USERS} as u`, "l.userId", "u.id");

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
      data: formattedLeaves,
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
  const sortOrder = parseInt(req.query.sortOrder) || 1;
  try {
    let query = {};

    let fullName = [];

    if (filter) {
      let searchUser = await knex(USERS).select().where("fullName", "like", `%${filter}%`);

      if (searchUser.length !== 0) {
        fullName = searchUser.map((u) => {
          return u.id;
        });
      }

      query = function () {
        this.where("l.leaveType", filter.toLowerCase())
          .orWhere("l.status", filter.toLowerCase())
          .orWhereIn("userId", fullName);
      };
    }

    let totalLeaves = await knex(LEAVES).count("id").first();
    totalLeaves = totalLeaves["count(`id`)"];

    const skip = (page - 1) * limit;
    let leaves;

    // sortField is createdAt by default.
    if (sortField === "userId.fullName") {
      leaves = await knex
        .select("l.*", "u.fullName as username")
        .from(`${LEAVES} as l`)
        .where(query)
        .innerJoin(`${USERS} as u`, "l.userId", "u.id")
        .offset(skip)
        .limit(limit);
      leaves.sort((a, b) => {
        const nameA = a.userId?.fullName || "";
        const nameB = b.userId?.fullName || "";
        return sortOrder * nameA.localeCompare(nameB);
      });
    } else {
      leaves = await knex
        .select("l.*", "u.fullName as username")
        .from(`${LEAVES} as l`)
        .where(query)
        .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
        .innerJoin(`${USERS} as u`, "l.userId", "u.id")
        .offset(skip)
        .limit(limit);
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
    let query = { userId: req.user.id };

    if (filter) {
      query = function () {
        this.where("l.leaveType", filter.toLowerCase())
          .orWhere("l.status",filter.toLowerCase());
      };
    }

    let totalLeaves = await knex(LEAVES).count("id").first();
    totalLeaves = totalLeaves["count(`id`)"];

    const skip = (page - 1) * limit;

    const currentYear = new Date().getFullYear();

    const approvedLeaves = await knex(LEAVES).where({
      userId: req.user.id,
      status: "approved",
    });
    let totalApprovedLeaveDays = 0;

    for (const leave of approvedLeaves) {
      if (new Date(leave.startDate).getFullYear() === currentYear) {
        totalApprovedLeaveDays += leave.totalDays;
      }
    }

    const leaves = await knex
      .select("l.*", "u.fullName as username")
      .from(`${LEAVES} as l`)
      .where("userId", req.user.id)
      .andWhere(query)
      .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
      .innerJoin(`${USERS} as u`, "l.userId", "u.id")
      .offset(skip)
      .limit(limit);

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
    const leaves = await knex
      .select("l.*", "u.*")
      .from(`${LEAVES} as l`)
      .where("l.id", req.params.id)
      .innerJoin(`${USERS} as u`, "l.userId", "u.id")
      .first();

    const { password, ...rest } = leaves;

    return res.status(200).json({
      error: false,
      message: "Single Leave getting successfully !!",
      leaves: {
        ...rest,
        leaveDayType: formatteDayType(rest.leaveDayType),
        startDate: rest.startDate.toISOString().split("T")[0],
        endDate: rest.endDate.toISOString().split("T")[0],
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
        message: "Please select proper date.",
      });
    }

    const userLeave = await knex(LEAVES).where("id", id).first();

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

    const user = await knex(USERS).where("id", updatedFields.userId).first();

    let updateLeave;
    if ( user.leaveBalance >= updatedFields.totalDays && updatedFields.leaveType === "paid" && user.leaveBalance !== 0 ) {
      updateLeave = await knex(LEAVES).where("id", userLeave.id).update({ ...updatedFields, updatedAt: new Date() });
    } else if (updatedFields.leaveType === "lwp") {
      updateLeave = await knex(LEAVES).where("id", userLeave.id).update({ ...updatedFields, updatedAt: new Date() });
    } else {
      return res.status(201).json({
        error: true,
        message: "Your leave balance is not enough to take paid leave!",
      });
    }
    return res.status(201).send({
      error: false,
      message: "Leave updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const deleteLeave = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    await knex(LEAVES).where("id", id).del();
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
      const leaveDetail = await knex(LEAVES).where("id", id).first();
      if (leaveDetail.status === "rejected") {
        return res.status(200).json({
          error: true,
          message: "Cannot reject already rejected leave",
        });
      }

      await knex(LEAVES).where("id", id).update({ status, reasonForLeaveReject, updatedAt: new Date() });
      updateLeave = await knex(LEAVES).where("id", id).first();
      await sendMailForLeaveStatus(updateLeave, reasonForLeaveReject);
    }

    if (status === "approved") {
      const leaveDetail = await knex(LEAVES).where("id", id).first();
      if (leaveDetail.status === "approved") {
        return res.status(200).json({
          error: true,
          message: "Cannot approve already approved leave",
        });
      }
      await knex(LEAVES).where("id", id).update({ status, updatedAt: new Date() });
      updateLeave = await knex(LEAVES).where("id", id).first();
      await sendMailForLeaveStatus(updateLeave, "-");
    }

    if (updateLeave.status === "approved" && updateLeave.leaveType === "paid") {
      await knex(USERS).where("id", updateLeave.userId).decrement("leaveBalance", updateLeave.totalDays);
    }

    return res.status(201).send({
      error: false,
      message: "Status updated successfully.",
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
    const sortOrder = parseInt(req.query.sortOrder) || -1;

    let query = { 'l.status': "pending" };
    if (filter) {
      let fullName = [];

      let searchUser = await knex(USERS).select().where("fullName", "like", `%${filter}%`);

      if (searchUser.length !== 0) {
        fullName = searchUser.map((u) => {
          return u.id;
        });
      }
      query = function () {
        this.where("l.leaveType", filter.toLowerCase())
        .orWhereIn("userId", fullName);
      };
    }

    let totalLeaves = await knex(LEAVES).count("id").first();
    totalLeaves = totalLeaves["count(`id`)"];

    const skip = (page - 1) * limit;
    let leaves;

    if (sortField === "userId.fullName") {

      leaves = await knex.select("l.*", "u.fullName as username").from(`${LEAVES} as l`)
        .innerJoin(`${USERS} as u`, "l.userId", "u.id")
        .where("l.status", "pending")
        .orWhere(query)
        .offset(skip)
        .limit(limit);

      leaves.sort((a, b) => {
        const nameA = a.userId?.fullName || "";
        const nameB = b.userId?.fullName || "";
        return sortOrder * nameA.localeCompare(nameB);
      });
    } else {
      leaves = await knex
        .select("l.*", "u.fullName as username")
        .from(`${LEAVES} as l`)
        .innerJoin(`${USERS} as u`, "l.userId", "u.id")
        .where("l.status", "pending")
        .orWhere(query)
        .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
        .offset(skip)
        .limit(limit);
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
