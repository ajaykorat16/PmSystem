const Users = require("../models/userModel")
const Leaves = require("../models/leaveModel")
const Department = require("../models/departmentModel")
const { validationResult } = require('express-validator');
const fs = require("fs")
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const saltRounds = 10

const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        return hashedPassword
    } catch (error) {
        console.log(error)
    }
}

const comparePassword = async (password, hashPassword) => {
    try {
        return bcrypt.compare(password, hashPassword)
    } catch (error) {
        console.log(error)
    }
}

const createUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = req.body

        const existingEmployeeNumber = await Users.findOne({ employeeNumber })
        if (existingEmployeeNumber) {
            return res.status(200).json({
                error: true,
                message: "Employee Number should be unique"
            })
        }
        const existingUser = await Users.findOne({ email })
        if (existingUser) {
            return res.status(200).json({
                error: true,
                message: "User already register with this email"
            })
        }
        const existingPhone = await Users.findOne({ phone })
        if (existingPhone) {
            return res.status(200).json({
                error: true,
                message: "Phone Number should be unique"
            })
        }
        const hashedPassword = await hashPassword(password)

        const newUser = await new Users({ employeeNumber, firstname, lastname, email, password: hashedPassword, phone, address, dateOfBirth, department, dateOfJoining }).save()
        return res.status(201).json({
            error: false,
            message: "User Register successfully !!",
            user: newUser
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        const { email, password } = req.body;

        const user = await Users.findOne({ email }).select("-photo").populate("department");
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Invalid Email. Please sign up first."
            });
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({
                error: true,
                message: "Invalid Password"
            });
        }
        const token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: '5 days' });
        return res.status(200).send({
            error: false,
            message: "User login successful!",
            user,
            token
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).send('Server error');
    }
});


const updateUser = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining } = req.fields;
        const { photo } = req.files;
        const { id } = req.params;
        let user;
        if (id) {
            user = await Users.findById(id);
        } else {
            user = await Users.findById(req.user._id);
        }

        const existingPhone = await Users.findOne({ phone, _id: { $ne: user._id } })
        if (existingPhone !== null) {
            return res.status(200).json({
                error: true,
                message: "Phone Number should be unique"
            })
        }

        const updatedFields = {
            employeeNumber: employeeNumber || user.employeeNumber,
            firstname: firstname || user.firstname,
            lastname: lastname || user.lastname,
            email: email || user.email,
            phone: phone || user.phone,
            address: address || user.address,
            dateOfBirth: dateOfBirth || user.dateOfBirth,
            department: department || user.department,
            dateOfJoining: dateOfJoining || user.dateOfJoining,
            photo: photo || user.photo
        };
        if (photo) {
            updatedFields.photo = {
                data: fs.readFileSync(photo.path),
                contentType: photo.type
            };
        }
        const updateUser = await Users.findByIdAndUpdate(user._id, updatedFields, { new: true });
        return res.status(201).send({
            error: false,
            message: "Profile Updated Successfully !!",
            updateUser
        });
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const deleteUserProfile = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const user = await Users.findOne({ _id: id })
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid User"
            })
        }

        await Users.findByIdAndDelete({ _id: id })
        const userLeave = await Leaves.findOne({ userId: id });
        if (userLeave) {
            await Leaves.deleteMany({ userId: userLeave.userId });
            return res.status(200).send({
                error: false,
                message: "User All Record Delete Successfully !!",
            })
        }

        return res.status(200).send({
            error: false,
            message: "Profile Delete Successfully !!",
        })

    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const { filter } = req.body;

    try {
        let query = {};

        if (filter) {
            function isValidDate(filter) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            let dateSearch;
            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = new Date(filter.split("-").reverse().join("-"))
            } else {
                dateSearch = null
            }

            let department = [];
            let searchdepartment = await Department.find({ name: { $regex: filter, $options: 'i' } })
            if (searchdepartment.length !== 0) {
                department = searchdepartment.map((d) => {
                    return d._id
                })
            }

            query = {
                $or: [
                    { firstname: { $regex: filter } },
                    { lastname: { $regex: filter } },
                    { email: { $regex: filter } },
                    { $expr: { $eq: [{ $month: "$dateOfBirth" }, isNaN(filter) ? null : filter] } },
                    { $expr: { $eq: [{ $year: "$dateOfBirth" }, isNaN(filter) ? null : filter] } },
                    { $expr: { $eq: [{ $month: "$dateOfJoining" }, isNaN(filter) ? null : filter] } },
                    { $expr: { $eq: [{ $year: "$dateOfJoining" }, isNaN(filter) ? null : filter] } },
                    { employeeNumber: { $eq: isNaN(filter) ? null : parseInt(filter) } },
                    { phone: { $eq: isNaN(filter) ? null : parseInt(filter) } },
                    { department: { $in: department } },
                    { dateOfBirth: { $eq: dateSearch } },
                    { dateOfJoining: { $eq: dateSearch } }
                ],
            };
        }

        const totalUsers = await Users.countDocuments(query);

        const skip = (page - 1) * limit;

        const users = await Users.find(query).skip(skip).limit(limit).populate("department").lean();

        const formattedUsers = users.map(user => {
            const photoUrl = user.photo && user.photo.contentType
                ? `data:${user.photo.contentType};base64,${user.photo.data.toString("base64")}`
                : null;

            const name = user.firstname + " " + user.lastname
            const avatar = user.firstname.charAt(0) + user.lastname.charAt(0)

            return {
                ...user,
                avatar: avatar,
                name: name,
                department: user.department.name,
                dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
                dateOfJoining: user.dateOfJoining.toISOString().split('T')[0],
                photo: photoUrl,
            };
        });
        return res.status(200).json({
            error: false,
            message: "Users retrieved successfully",
            users: formattedUsers,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: true, message: "Server error" });
    }
});

const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getAllUsers = await Users.find().populate("department").lean();

        const formattedUsers = getAllUsers.map(user => {
            const photoUrl = user.photo && user.photo.contentType
                ? `data:${user.photo.contentType};base64,${user.photo.data.toString("base64")}`
                : null;

            return {
                ...user,
                dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
                dateOfJoining: user.dateOfJoining.toISOString().split('T')[0],
                photo: photoUrl,
            };
        });

        return res.status(200).json({
            error: false,
            message: "All users retrieved successfully",
            getAllUsers: formattedUsers
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server error');
    }
});


const getUserProfile = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params

        let getProfile;
        if (id) {
            getProfile = await Users.findById({ _id: id }).populate("department")
        } else {
            getProfile = await Users.findById({ _id: req.user._id }).populate("department")
        }

        const photoUrl = getProfile.photo && getProfile.photo.contentType
            ? `data:${getProfile.photo.contentType};base64,${getProfile.photo.data.toString("base64")}`
            : null;

        return res.status(200).json({
            error: false,
            message: "Users get profile successfully!!",
            getProfile: {
                ...getProfile.toObject(),
                photo: photoUrl,
                dateOfBirth: getProfile.dateOfBirth.toISOString().split('T')[0],
                dateOfJoining: getProfile.dateOfJoining.toISOString().split('T')[0],
            },
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Server error');
    }
})

//changePasswordController

const changePasswordController = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: true, errors: errors.array() });
    }
    try {
        console.log(req.user._id);
        const user = req.user._id
        const { password } = req.body
        const hashed = await hashPassword(password);
        console.log(hashed);
        await Users.findByIdAndUpdate(user, { password: hashed });
        res.status(200).send({
            error: false,
            message: "Password Reset Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: true,
            message: "Something went wrong",
            error,
        });
    }
});

module.exports = { createUser, loginUser, updateUser, deleteUserProfile, getAllUser, getUserProfile, changePasswordController, getUsers }