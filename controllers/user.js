const mongoose = require("mongoose");
const Users = require("../models/userModel");
const Leaves = require("../models/leaveModel");
const Department = require("../models/departmentModel");
const Worklog = require("../models/workLogmodel");
const Projects = require("../models/projects");
const LeaveManagement = require("../models/leaveManagementModel");
const fs = require("fs");
const { validationResult } = require("express-validator");
const { formattedDate, capitalizeFLetter } = require("../helper/mail");
const asyncHandler = require("express-async-handler");
const moment = require('moment')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Credential = require("../models/credentials");
const saltRounds = 10;

const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

const comparePassword = async (password, hashPassword) => {
  try {
    return bcrypt.compare(password, hashPassword);
  } catch (error) {
    console.log(error);
  }
};

const createUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining, } = req.body;

    const existingEmployeeNumber = await Users.findOne({ employeeNumber });
    if (existingEmployeeNumber) {
      return res.status(200).json({
        error: true,
        message: "Employee Number should be unique.",
      });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        error: true,
        message: "User already register with this email.",
      });
    }

    const existingPhone = await Users.findOne({ phone });
    if (existingPhone) {
      return res.status(200).json({
        error: true,
        message: "Phone Number should be unique.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await new Users({
      employeeNumber,
      firstname: capitalizeFLetter(firstname),
      lastname: capitalizeFLetter(lastname),
      email,
      password: hashedPassword,
      phone,
      address,
      dateOfBirth: dateOfBirth,
      department,
      dateOfJoining: dateOfJoining,
    }).save();


    const doj = new Date(newUser.dateOfJoining);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (doj.getFullYear() === currentYear && doj.getMonth() === currentMonth && doj.getDate() <= 15) {
      await new LeaveManagement({ user: newUser._id, monthly: currentDate, leave: 1.5, }).save();
      await Users.findByIdAndUpdate(newUser._id, { $inc: { leaveBalance: 1.5 } }, { new: true });
    }

    return res.status(201).json({
      error: false,
      message: "User created successfully.",
      user: newUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

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
        message: "Invalid Email. Please sign up first.",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({
        error: true,
        message: "Invalid Password.",
      });
    }

    const token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: "365 days", });
    return res.status(200).send({
      error: false,
      message: "Login successfully !",
      user,
      token,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server error");
  }
});

const loginUserByAdmin = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, errors: errors.array() });
  }
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email }).select("-photo").populate("department");
    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid Email. Please sign up first.",
      });
    }

    const token = await jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: "365 days", });
    return res.status(200).send({
      error: false,
      message: "Login successfully !",
      user,
      token,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server error");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, projects, } = req.fields;
    const { photo } = req.files;
    const { id } = req.params;

    let projectArr = [];
    if (typeof projects !== 'undefined') {
      projectArr = JSON.parse(projects);
    }

    let user;
    if (id) {
      user = await Users.findById(id);
    } else {
      user = await Users.findById(req.user._id);
    }

    const existingPhone = await Users.findOne({ phone, _id: { $ne: user._id }, });
    if (existingPhone !== null) {
      return res.status(200).json({
        error: true,
        message: "Phone Number should be unique.",
      });
    }

    const updatedFields = {
      employeeNumber: employeeNumber || user.employeeNumber,
      firstname: firstname ? capitalizeFLetter(firstname) : user.firstname,
      lastname: lastname ? capitalizeFLetter(lastname) : user.lastname,
      email: email || user.email,
      phone: phone || user.phone,
      address: address || user.address,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      department: department || user.department,
      dateOfJoining: dateOfJoining ? dateOfJoining : user.dateOfJoining,
      photo: photo || user.photo,
      fullName: (firstname ? capitalizeFLetter(firstname) : user.firstname) + " " + (lastname ? capitalizeFLetter(lastname) : user.lastname)
    };

    if (photo) {
      updatedFields.photo = {
        data: fs.readFileSync(photo.path),
        contentType: photo.type,
      };
    }

    if (projectArr && Array.isArray(projectArr)) {
      const newProjectIds = projectArr.map((p) => {
        return { id: new mongoose.Types.ObjectId(p) };
      });
      updatedFields.projects = newProjectIds;
    }

    const updateUser = await Users.findByIdAndUpdate(user._id, updatedFields, { new: true, });

    for (const projectsId of user.projects) {
      await Projects.findByIdAndUpdate(projectsId.id, { $pull: { developers: { id: id } }, });
    }

    for (const projectsId of projectArr) {
      await Projects.findByIdAndUpdate(projectsId, { $addToSet: { developers: { id: id } }, });
    }

    return res.status(201).send({
      error: false,
      message: "Updated Successfully !!",
      updateUser,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid User.",
      });
    }

    await Users.findByIdAndDelete({ _id: id });
    await LeaveManagement.deleteMany({ user: id });
    await Worklog.deleteMany({ userId: id });
    await Leaves.deleteMany({ userId: id });
    await Projects.updateMany({ "developers.id": id }, { $pull: { developers: { id } } });
    await Credential.deleteMany({ createdBy: id });
    await Credential.updateMany({ "users.id": id }, { $pull: { users: { id } } });

    return res.status(200).send({
      error: false,
      message: "User is delete successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = req.query.sortOrder || -1;
  const { filter } = req.body;
  const authUser = req.user;

  try {
    let query = {};

    if (filter) {
      function isValidDate(filter) {
        const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
        return dateRegex.test(filter);
      }

      let dateSearch;
      if (typeof filter === "string" && isValidDate(filter)) {
        dateSearch = new Date(filter.split("-").reverse().join("-"));
      } else {
        dateSearch = null;
      }

      let department = [];
      let searchdepartment = await Department.find({
        name: { $regex: filter, $options: "i" },
      });
      if (searchdepartment.length !== 0) {
        department = searchdepartment.map((d) => {
          return d._id;
        });
      }

      query = {
        $or: [
          { firstname: { $regex: filter, $options: "i" } },
          { lastname: { $regex: filter, $options: "i" } },
          { fullName: { $regex: filter, $options: "i" } },
          { email: { $regex: filter, $options: "i" } },
          {
            $expr: {
              $eq: [{ $month: "$dateOfBirth" }, isNaN(filter) ? null : filter],
            },
          },
          {
            $expr: {
              $eq: [{ $year: "$dateOfBirth" }, isNaN(filter) ? null : filter],
            },
          },
          {
            $expr: {
              $eq: [
                { $month: "$dateOfJoining" },
                isNaN(filter) ? null : filter,
              ],
            },
          },
          {
            $expr: {
              $eq: [{ $year: "$dateOfJoining" }, isNaN(filter) ? null : filter],
            },
          },
          { employeeNumber: { $eq: isNaN(filter) ? null : parseInt(filter) } },
          { phone: { $eq: isNaN(filter) ? null : parseInt(filter) } },
          { department: { $in: department } },
          { dateOfBirth: { $eq: dateSearch } },
          { dateOfJoining: { $eq: dateSearch } },
        ],
      };
    }

    const skip = (page - 1) * limit;
    let totalEmployee = await Users.countDocuments({ role: "user" });

    let totalUsers;
    let users;
    if (authUser.role === "user") {
      totalUsers = await Users.countDocuments({ ...query, role: "user", });
      users = await Users.find({ ...query, role: "user", }).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate("department").lean();
    } else {
      totalUsers = await Users.countDocuments(query);
      users = await Users.find(query).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).populate("department").lean();
    }

    const formattedUsers = users.map((user) => {
      const photoUrl =
        user.photo && user.photo.contentType
          ? `data:${user.photo.contentType};base64,${user.photo.data.toString(
            "base64"
          )}`
          : null;
      const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

      return {
        ...user,
        avatar: avatar,
        department: user.department?.name || null,
        dateOfBirth: formattedDate(user.dateOfBirth),
        dateOfJoining: formattedDate(user.dateOfJoining),
        photo: photoUrl,
      };
    });

    return res.status(200).json({
      error: false,
      message: "Users retrieved successfully.",
      users: formattedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      totalEmployee,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

const getUserByBirthDayMonth = asyncHandler(async (req, res) => {
  try {
    const d = new Date();
    let month = d.getMonth() + 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.body.filter || month;

    let query;
    if (filter) {
      const filterMonth = isNaN(filter) ? month : parseInt(filter);
      query = {
        $or: [
          {
            $expr: {
              $eq: [{ $month: "$dateOfBirth" }, filterMonth],
            },
          },
        ],
      };
    }

    const totalUsers = await Users.countDocuments(query);
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      { $match: query },
      {
        $addFields: {
          dayOfMonth: { $dayOfMonth: "$dateOfBirth" },
        },
      },
      { $sort: { dayOfMonth: 1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "departments",
          let: { departmentId: "$department" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$departmentId"],
                },
              },
            },
          ],
          as: "department",
        },
      },
      {
        $addFields: {
          department: { $arrayElemAt: ["$department", 0] },
        },
      },
    ];

    const users = await Users.aggregate(aggregationPipeline);

    const formattedUsers = users.map((user) => {
      const photoUrl =
        user.photo && user.photo.contentType
          ? `data:${user.photo.contentType};base64,${user.photo.data.toString(
            "base64"
          )}`
          : null;
      const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

      return {
        ...user,
        avatar: avatar,
        department: user.department ? user.department.name : null,
        dateOfBirth: formattedDate(user.dateOfBirth),
        dateOfJoining: formattedDate(user.dateOfJoining),
        photo: photoUrl,
      };
    });

    return res.status(200).json({
      error: false,
      message: "Users retrieved successfully.",
      users: formattedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getAllUsers = await Users.find({ role: "user" }).select("-photo");

    return res.status(200).json({
      error: false,
      message: "All users retrieved successfully.",
      getAllUsers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const userForCredential = asyncHandler(async (req, res) => {
  try {
    const loginUser = req.user._id
    const getAllUsers = await Users.find({ _id: { $ne: loginUser } }).select("-photo");

    return res.status(200).json({
      error: false,
      message: "All users is retrieved successfully.",
      getAllUsers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let getProfile;
    if (id) {
      getProfile = await Users.findById({ _id: id }).populate("department").populate("projects.id");
    } else {
      getProfile = await Users.findById({ _id: req.user._id }).populate("department").populate("projects.id");
    }

    const photoUrl =
      getProfile.photo && getProfile.photo.contentType
        ? `data:${getProfile.photo.contentType
        };base64,${getProfile.photo.data.toString("base64")}`
        : null;

    return res.status(200).json({
      error: false,
      message: "Users get profile successfully!!",
      getProfile: {
        ...getProfile.toObject(),
        photo: photoUrl,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const changePasswordController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, errors: errors.array() });
  }
  try {
    const user = req.user._id;
    const { password } = req.body;

    const hashed = await hashPassword(password);
    await Users.findByIdAndUpdate(user, { password: hashed });
    res.status(200).send({
      error: false,
      message: "Password Reset Successfully.",
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

module.exports = { createUser, loginUser, updateUser, deleteUserProfile, getAllUser, getUserProfile, changePasswordController, getUsers, getUserByBirthDayMonth, loginUserByAdmin, userForCredential };
