const mongoose = require("mongoose")

const leaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: "User",
        required: true,
    },
    reasone: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        require: true
    },
    endDate: {
        type: Date,
        require: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    type: {
        type: String,
        enum: ["Paid", "LWP"],
        default: "LWP"
    },
}, {
    timestamps: true
})

const Leaves = mongoose.model("Leave", leaveSchema)

module.exports = Leaves