const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        require: true
    },
    developers: [
        {
            id: {
                type: mongoose.ObjectId,
                ref: "User",
                required: true,
            }
        }
    ]
}, {
    timestamps: true,
});

const Projects = mongoose.model("Project", projectSchema);

module.exports = Projects;
