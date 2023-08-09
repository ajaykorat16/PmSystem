const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reasonForLeaveReject: {
      type: String,
      default: null
    },
    startDate: {
      type: Date,
      require: true,
    },
    endDate: {
      type: Date,
      require: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["paid", "lwp"],
      default: "lwp",
    },
    totalDays: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Leaves = mongoose.model("Leave", leaveSchema);

module.exports = Leaves;
