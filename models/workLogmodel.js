const mongoose = require("mongoose");

const workLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.ObjectId,
            ref: "User",
            required: true,
        },
        project: {
            type: mongoose.ObjectId,
            ref: "Project",
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        logDate: {
            type: Date,
            require: true
        },
        time: {
            type: Number,
            require: true
        }
    },
    {
        timestamps: true,
    }
);

const Worklog = mongoose.model("Worklog", workLogSchema);

module.exports = Worklog;
