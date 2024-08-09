const { knex } = require("../database/db");
const { validationResult } = require("express-validator");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { formattedDate, capitalizeFLetter, isValidDate, uploadImage, isBase64Image } = require("../helper/mail");
const asyncHandler = require("express-async-handler");
const saltRounds = 10;
const { LEAVEMANAGEMENTS, USERS, WORKLOGS, PROJECTS, CREDENTIALS, LEAVES, DEPARTMENTS, USER_PROJECT_RELATION, USER_CREDENTIAL_RELATION } = require("../constants/tables");

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
    const { employeeNumber, firstname, lastname, email, password, phone, address, dateOfBirth, department, dateOfJoining } = req.body;

    const existingEmployeeNumber = await knex(USERS).where("employeeNumber", employeeNumber).first();
    if (existingEmployeeNumber) {
      return res.status(200).json({
        error: true,
        message: "Employee Number should be unique.",
      });
    }

    const existingUser = await knex(USERS).where("email", email).first();
    if (existingUser) {
      return res.status(200).json({
        error: true,
        message: "User already register with this email.",
      });
    }

    const existingPhone = await knex(USERS).where("phone", phone).first();
    if (existingPhone) {
      return res.status(200).json({
        error: true,
        message: "Phone Number should be unique.",
      });
    }

    const hashedPassword = await hashPassword(password);

    const userDetail = {
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
      fullName: firstname + " " + lastname,
    };

    const newUser = await knex(USERS).insert(userDetail);

    const user = await knex(USERS).where('id', newUser[0]).first();

    const doj = new Date(user.dateOfJoining);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (doj.getFullYear() === currentYear && doj.getMonth() === currentMonth && doj.getDate() <= 15) {
      await knex(LEAVEMANAGEMENTS).insert({ user:newUser[0], monthly: currentDate, leave: 1.5 });

      await knex(USERS).where("id", newUser[0]).increment("leaveBalance", 1.5);
    }

    return res.status(201).json({
      error: false,
      message: "User created successfully.",
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

    const user = await knex(USERS).where("email", email).first();
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

    const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: "365 days" });

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

    const user = await knex(USERS).where("email", email).first();
    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Invalid Email. Please sign up first.",
      });
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, { expiresIn: "365 days" });

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
    const { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, projects, photo, } = req.body;
    const { id } = req.params;

    let user = await knex(USERS).where("id", req.user.id).first();

    if (id) {
      user = await knex(USERS).where("id", id).first();

      if (!user) {
        return res.status(400).json({
          error: true,
          message: "User Not Found.",
        });
      }
    }

    if (phone) {
      const existingPhone = await knex(USERS).where("phone", phone).whereNot("id", user.id).first();
      if (existingPhone) {
        return res.status(200).json({
          error: true,
          message: "Phone Number should be unique.",
        });
      }
    }

    if (employeeNumber) {
      const existingEmployeeNumber = await knex(USERS).where('employeeNumber', employeeNumber).whereNot('id', user.id).first()
      if (existingEmployeeNumber) {
        return res.status(200).json({
          error: true,
          message: "Employee Number should be unique.",
        });
      }
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
      fullName: (firstname ? capitalizeFLetter(firstname) : user.firstname) + " " + (lastname ? capitalizeFLetter(lastname) : user.lastname),
      updatedAt: new Date()
    };

    if (photo && isBase64Image(photo)) {
      const uploadPath = "./uploads/images/";
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }

      if (user.photo) {
        const oldFilePath = `./uploads/images/${user.photo}`;
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (err) {
            console.error("Error deleting old image", err);
          }
        }
      }

      try {
        const imageName = uploadImage(photo, uploadPath)
        updatedFields.photo = imageName;
      } catch (err) {
        console.error("Image upload error", err);
      }
    } else if (photo === null || photo === "") {
      updatedFields.photo = null;
    }

    await knex(USERS).where("id", user.id).update(updatedFields);

    if (projects) {
      if (projects.length > 0) {
        await knex(USER_PROJECT_RELATION).where('userId', user.id).del();
        for (const projectId of projects) {
          await knex(USER_PROJECT_RELATION).insert({ userId: user.id, projectId })
        }
      } else {
        await knex(USER_PROJECT_RELATION).where('userId', user.id).del();
      }
    }

    return res.status(201).send({
      error: false,
      message: "Updated Successfully !!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await knex(USERS).where("id", id).first();
    if (!user) {
      return res.status(400).json({
        error: true,
        message: "Invalid User.",
      });
    }

    await knex(USER_CREDENTIAL_RELATION).where("userId", id).del();
    await knex(USER_PROJECT_RELATION).where("userId", id).del();
    await knex(USERS).where("id", id).del();
    await knex(LEAVEMANAGEMENTS).where("user", id).del();
    await knex(WORKLOGS).where("userId", id).del();
    await knex(LEAVES).where("userId", id).del();
    await knex(CREDENTIALS).where("createdBy", id).del();

    return res.status(200).send({
      error: false,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getUsers = asyncHandler(async (req, res) => {
  let { page, limit, sortField, sortOrder, filter } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  sortOrder = parseInt(sortOrder) || -1;
  sortField = sortField || "createdAt";
  authUser = req.user;

  try {
    let query = knex(`${USERS} as u`)
      .select('u.*', 'd.name as department')
      .leftJoin(`${DEPARTMENTS} as d`, 'u.department', 'd.id');

    if (filter) {
      const dateSearch = typeof filter === "string" && isValidDate(filter)
        ? filter.split('-').reverse().join('-')
        : null;

      const departmentIds = await knex(DEPARTMENTS)
        .where('name', 'like', `%${filter}%`)
        .pluck('id');

      query = query.where(function () {
        this.orWhere('u.firstname', 'like', `%${filter}%`)
          .orWhereRaw('YEAR(u.dateOfBirth) = ?', !isNaN(filter) ? filter : null)
          .orWhereRaw('MONTH(u.dateOfJoining) = ?', !isNaN(filter) ? filter : null)
          .orWhereRaw('YEAR(u.dateOfJoining) = ?', !isNaN(filter) ? filter : null)
          .orWhereRaw('MONTH(u.dateOfBirth) = ?', !isNaN(filter) ? filter : null)
          .orWhere('u.lastname', 'like', `%${filter}%`)
          .orWhere('u.fullName', 'like', `%${filter}%`)
          .orWhere('u.employeeNumber', !isNaN(filter) ? parseInt(filter) : null)
          .orWhere('u.phone', !isNaN(filter) ? parseInt(filter) : null)
          .orWhereIn('u.department', departmentIds)
          .orWhere('u.dateOfBirth', dateSearch)
          .orWhere('u.dateOfJoining', dateSearch);
      });
    }

    if (authUser.role === "user") {
      query = query.andWhere('u.role', 'user');
    }

    query = query.groupBy('u.id', 'd.name');

    if (sortField !== 'undefined' && sortOrder) {
      query = query.orderBy(sortField, sortOrder === -1 ? 'desc' : 'asc');
    }

    const totalCountResult = await query;
    const totalCount = totalCountResult.length;

    if (page && limit) {
      const offset = (page - 1) * limit;
      query = query.offset(offset).limit(limit);
    }

    const users = await query;

    const formattedUsers = users.map((user) => {
      const { password, ...dataWithoutPassword } = user;

      const photoUrl = user.photo ? `${DOMAIN}/images/${user.photo}` : null;
      const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

      return {
        ...dataWithoutPassword,
        avatar,
        department: user.department || null,
        dateOfBirth: formattedDate(user.dateOfBirth),
        dateOfJoining: formattedDate(user.dateOfJoining),
        photo: photoUrl,
      };
    });

    return res.status(200).json({
      error: false,
      message: "Users retrieved successfully.",
      data: formattedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalUsers: totalCount,
      totalEmployee: totalCount,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: true, message: "Server error" });
  }
});

const getUserByBirthDayMonth = asyncHandler(async (req, res) => {
  try {
    const d = new Date();
    let month = d.getMonth() + 1;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.body.filter || month;

    let query = {};
    if (filter) {
      const filterMonth = isNaN(filter) ? month : parseInt(filter);
      query = function () {
        this.whereRaw('MONTH(dateOfBirth) = ?', filterMonth);
      }
    }

    let totalUsers = await knex(USERS).where(query).count('id as count').first();
    totalUsers = totalUsers.count ? totalUsers.count : 0;

    const skip = (page - 1) * limit;

    const users = await knex.select('u.*', 'd.name as department')
      .from(`${USERS} as u`)
      .leftJoin(`${DEPARTMENTS} as d`, 'd.id', 'u.department')
      .where(query)
      .offset(skip)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...dataWithoutPassword } = user;
      return dataWithoutPassword;
    });

    const formattedUsers = usersWithoutPassword.map((user) => {
      const photoUrl = !user.photo ? null : `${DOMAIN}/images/${user.photo}`;
      const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

      return {
        ...user,
        avatar: avatar,
        department: user.department ? user.department : null,
        dateOfBirth: formattedDate(user.dateOfBirth),
        dateOfJoining: formattedDate(user.dateOfJoining),
        photo: photoUrl,
      };
    });

    return res.status(200).json({
      error: false,
      message: "Users retrieved successfully.",
      data: formattedUsers,
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
    let getAllUsers = await knex(USERS).where("role", "user");

    getAllUsers = getAllUsers.map((userData) => {
      const { password, ...dataWithoutPassword } = userData;

      return dataWithoutPassword;
    });

    return res.status(200).json({
      error: false,
      message: "All users retrieved successfully.",
      data: getAllUsers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const userForCredential = asyncHandler(async (req, res) => {
  try {
    const loginUser = req.user.id;

    let getAllUsers = await knex(USERS).where("id", "!=", loginUser);

    getAllUsers = getAllUsers.map((userData) => {
      const { password, ...dataWithoutPassword } = userData;

      return dataWithoutPassword;
    });

    return res.status(200).json({
      error: false,
      message: "All users is retrieved successfully.",
      data: getAllUsers,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    let query = knex
      .select(
        'u.*',
        'd.name as departmentName',
        knex.raw(`
          IFNULL(
            GROUP_CONCAT(
              IF(p.id IS NOT NULL, 
                JSON_OBJECT("id", p.id, "name", p.name), 
                NULL
              )
            ), 
            ''
          ) as projects
        `)
      )
      .from(`${USERS} as u`)
      .leftJoin(`${DEPARTMENTS} as d`, 'd.id', 'u.department')
      .leftJoin(`${USER_PROJECT_RELATION} as up`, 'u.id', 'up.userId')
      .leftJoin(`${PROJECTS} as p`, 'p.id', 'up.projectId')
      .groupBy('u.id')
      .first();

    if (id) {
      query = query.where('u.id', id);
    } else {
      query = query.where('u.id', req.user.id);
    }

    let getProfile = await query;

    getProfile.projects = JSON.parse(`[${getProfile.projects}]`);

    const photoUrl = getProfile?.photo ? `${DOMAIN}/images/${getProfile.photo}` : null;

    const { password, ...dataWithoutPassword } = getProfile;

    return res.status(200).json({
      error: false,
      message: "User profile fetched successfully!",
      data: {
        ...dataWithoutPassword,
        photo: photoUrl,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

const changePasswordController = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, errors: errors.array() });
  }
  try {
    const { id } = req.user;
    const { password } = req.body;

    const hashed = await hashPassword(password);

    const updateDetail = {
      password: hashed,
      updatedAt: new Date()
    }

    await knex(USERS).where("id", id).update(updateDetail);

    res.status(200).send({
      error: false,
      message: "Password Reset Successfully.",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUserProfile,
  getAllUser,
  getUserProfile,
  changePasswordController,
  getUsers,
  getUserByBirthDayMonth,
  loginUserByAdmin,
  userForCredential,
};
