const mongoose = require("mongoose")

const departmentSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
})

const Department = mongoose.model("Department", departmentSchema)

module.exports = Department