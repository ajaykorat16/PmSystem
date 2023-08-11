const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    employeeNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
    },
    fullName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        require: true
    },
    department: {
        type: mongoose.ObjectId,
        ref: "Department",
        required: true,
    },
    dateOfJoining: {
        type: Date,
        require: true
    },
    status: {
        type: String,
        default: "Active"
    },
    leaveBalance: {
        type: Number,
        default: 0
    },
    photo: {
        data: {
            type: Buffer,
            default: null
        },
        contentType: {
            type: String,
            default: null
        }
    },
    role: {
        type: String,
        default: "user"
    },
    carryForward: {
        type: Number,
        default: 0
    },
    projects: [
        {
            id: {
                type: mongoose.ObjectId,
                ref: "Project"
            }
        }
    ]
}, {
    timestamps: true,
});

userSchema.pre("save", function (next) {
    this.fullName = this.firstname + " " + this.lastname;
    next();
});
const Users = mongoose.model("User", userSchema);

module.exports = Users;
