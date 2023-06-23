const mongoose = require("mongoose")

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const Department = mongoose.model("Department", departmentSchema)

module.exports = Department