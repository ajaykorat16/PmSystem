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

// leaveSchema.pre("save", function (next) {
//   const startDate = new Date(this.startDate);
//   const endDate = new Date(this.endDate);

//   let currentDate = new Date(startDate);
//   let totalDays = 0;

//   while (currentDate <= endDate) {
//     const dayOfWeek = currentDate.getDay();
//     // 0 = Sunday, 6 = Saturday
//     if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//       totalDays++;
//     }
//     currentDate.setDate(currentDate.getDate() + 1);
//   }

//   this.totalDaysExcludingWeekends = totalDays;
//   next();
// });

const Leaves = mongoose.model("Leave", leaveSchema);

module.exports = Leaves;
