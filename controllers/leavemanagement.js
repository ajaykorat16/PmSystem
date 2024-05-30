const { validationResult } = require("express-validator");
const { parsedDate } = require("../helper/mail")
const asyncHandler = require("express-async-handler");
const moment = require('moment');
const { knex } = require('../database/db');
const { LEAVEMANAGEMENTS, USERS } = require("../constants/tables");

const getLeavesMonthWise = asyncHandler(async (req, res) => {
  try {
    const d = new Date();
    let month = d.getMonth() + 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.body.filter || month;

    let query = function() {
      this.whereRaw('YEAR(monthly) = ?', [d.getFullYear()])
        .andWhereRaw('MONTH(monthly) = ?', isNaN(filter) ? month : filter)
    }
    let totalLeaves = await knex(`${LEAVEMANAGEMENTS} as lm`)
      .innerJoin(`${USERS} as u`, 'lm.user', 'u.id')
      .where(query)
      .count('lm.id as count')
      .first();
    totalLeaves = totalLeaves ? totalLeaves.count : 0;

    const skip = (page - 1) * limit;

    const leaves = await knex.select('lm.*', 'u.fullName').from(`${LEAVEMANAGEMENTS} as lm`).where(query).innerJoin(`${USERS} as u`, 'lm.user', 'u.id').offset(skip).limit(limit);

    return res.status(200).json({
      error: false,
      message: "Leaves are retrieved successfully.",
      data: leaves,
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
    
    const getLeave = await knex.select('lm.*', 'u.fullName')
      .where('lm.id', id)
      .from(`${LEAVEMANAGEMENTS} as lm`)
      .innerJoin(`${USERS} as u`, 'lm.user', 'u.id')
      .first();

    return res.status(200).json({
      error: false,
      message: "Single leave is getting successfully.",
      data: getLeave,
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

    const getLeave = await knex.select('lm.*', 'u.fullName', 'u.leaveBalance').from(`${LEAVEMANAGEMENTS} as lm`).where('lm.id', id).innerJoin(`${USERS} as u`, 'lm.user', 'u.id').first();
    if (!getLeave) {
      return res.status(404).json({ error: true, message: "Leave record not found" });
    }
    const leaveChange = parseFloat(leave) - parseFloat(getLeave.leave);

    await knex(LEAVEMANAGEMENTS).where('id', id).update({ leave, updatedAt: new Date() });

    await knex(USERS).where('id', getLeave.user).increment('leaveBalance', leaveChange);
    return res.status(200).json({
      error: false,
      message: "Manage leave updated successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

const getUserLeaves = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    const leaves = await knex.select('lm.*', 'u.fullName').from(`${LEAVEMANAGEMENTS} as lm`).where('user', userId).innerJoin(`${USERS} as u`, 'lm.user', 'u.id'); 

    const currentYear = new Date().getFullYear();

    const currentYearLeaves = leaves.filter((leave) => {
      const leaveYear = new Date(leave.monthly).getFullYear();
      return leaveYear === currentYear;
    });

    return res.status(200).json({
      error: false,
      message: "User's Leaves getting successfully.",
      data: currentYearLeaves,
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

    const createdLeave = { user, monthly: parsedDate(monthlyDate), leave };
    await knex(LEAVEMANAGEMENTS).insert(createdLeave);
    
    await knex(USERS).where('id', user).increment('leaveBalance', leave);

    return res.status(201).json({
      error: false,
      message: " Manage leave created successfully.",
    })

  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
})

module.exports = { getLeavesMonthWise, getSingleLeave, updateLeave, getUserLeaves, createManageLeave };
