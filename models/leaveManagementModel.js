const mongoose = require("mongoose");

const leaveManagementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },
    monthly: {
      type: Date,
      required: true,
      trim: true,
    },
    leave: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveManagement = mongoose.model("LeaveManagement", leaveManagementSchema);

module.exports = LeaveManagement;
