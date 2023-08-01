const LeaveManagement = require("../models/leaveManagementModel");
const asyncHandler = require("express-async-handler");

const getLeavesMonthWise = asyncHandler(async (req, res) => {
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

  try {
    const leaves = await LeaveManagement.find(query)
      .skip(skip)
      .limit(limit)
      .populate({ path: "user", select: "fullName" })
      .lean();

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
    // const existingLeave = await LeaveManagement.findById({ _id: id })
    // if (!existingLeave) {
    //     return res.status(400).json({
    //         error: true,
    //         message: "Leave is not existing"
    //     })
    // }
    const getLeave = await LeaveManagement.findById({ _id: id }).populate("user").select("fullName");
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

const updateLeave = asyncHandler(async (req,res) => {
  try {
    const { id } = req.params;
    const { leave } = req.body
    const updateLeave = await LeaveManagement.findByIdAndUpdate({_id: id}, {leave}, { new: true }) 
    return res.status(200).json({
      error: false,
      message: "Leave update successfully",
      updateLeave
    })
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error")
  }
})

module.exports = { getLeavesMonthWise, getSingleLeave, updateLeave };
