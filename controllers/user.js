const fs = require("fs");
const { validationResult } = require("express-validator");
const { formattedDate, capitalizeFLetter, decodeBase64Image, } = require("../helper/mail");
const asyncHandler = require("express-async-handler");
const mimeTypes = require("mime-types");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { knex } = require("../database/db");
const { LEAVEMANAGEMENTS, USERS, WORKLOGS, PROJECTS, CREDENTIALS, LEAVES, DEPARTMENTS, USER_PROJECT_RELATION, USER_CREDENTIAL_RELATION } = require("../constants/tables");
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

    if ( doj.getFullYear() === currentYear && doj.getMonth() === currentMonth && doj.getDate() <= 15 ) {
      await knex(LEAVEMANAGEMENTS).where("user", newUser[0]).insert({ monthly: currentDate, leave: 1.5 });

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

    const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
      expiresIn: "365 days",
    });
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

    const token = jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
      expiresIn: "365 days",
    });
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
    const { employeeNumber, firstname, lastname, email, phone, address, dateOfBirth, department, dateOfJoining, projects, photo, } = req.fields;
    
    const { id } = req.params;
    let user;
    if (id) {
      user = await knex(USERS).where("id", id).first();
    } else {
      user = await knex(USERS).where("id", req.user.id).first();
    }

    if(phone) {
      const existingPhone = await knex(USERS).where("phone", phone).whereNot("id", user.id).first();
      
      if (existingPhone) {
        return res.status(200).json({
          error: true,
          message: "Phone Number should be unique.",
        });
      }
    }
    
    if(employeeNumber) {
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
    };

    if (photo) {
      const decodedImg = decodeBase64Image(photo);
      const imageBuffer = decodedImg.data;
      const type = decodedImg.type;
      const extension = mimeTypes.extension(type) || 'png';
      const fileName = `${updatedFields.employeeNumber}.${extension}`;

      const uploadPath = "./uploads/images/"
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }

      try {
        fs.writeFileSync(uploadPath + fileName, imageBuffer, 'utf8');
        updatedFields.photo = fileName;
      } catch (err) {
        console.error("Image upload error", err);
      }
    }

    await knex(USERS).where("id", user.id).update({ ...updatedFields, updatedAt: new Date() });

    let userProjects;
    try {
      userProjects = JSON.parse(projects);
    } catch (error) {
      userProjects = []
    }

    if(projects) {
      if(userProjects.length > 0) {
        await knex(USER_PROJECT_RELATION).where('userId', user.id).del();
        for (const projectId of userProjects) {
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
    console.log(error.message);
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = parseInt(req.query.sortOrder) || -1;
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
        dateSearch = filter.split('-').reverse().join('-');
      } else {
        dateSearch = null;
      }

      let department = [];
      let searchDepartment = await knex(DEPARTMENTS).select().where('name', 'like', `%${filter}%`);

      if (searchDepartment.length !== 0) {
        department = searchDepartment.map((d) => {
          return d.id;
        });
      }

      query = function() {
        this
        .orWhere('firstname', 'like', `%${filter}%`)
        .orWhereRaw('YEAR(dateOfBirth) = ?', isNaN(filter) ? null : filter)
        .orWhereRaw('MONTH(dateOfJoining) = ?', isNaN(filter) ? null : filter)
        .orWhereRaw('YEAR(dateOfJoining) = ?', isNaN(filter) ? null : filter)
        .orWhereRaw('MONTH(dateOfBirth) = ?', isNaN(filter) ? null : filter)
        .orWhere('lastname', 'like', `%${filter}%`)
        .orWhere('fullName', 'like', `%${filter}%`)
        .orWhere('employeeNumber', isNaN(filter) ? null : parseInt(filter))
        .orWhere('phone', isNaN(filter) ? null : parseInt(filter))
        .orWhereIn('department', department)
        .orWhere('dateOfBirth', dateSearch)
        .orWhere('dateOfJoining', dateSearch)
      }
    }

    const skip = (page - 1) * limit;
    let totalEmployee = await knex(USERS).where("role", "user").count({ count: "*" });
    totalEmployee = totalEmployee[0].count;

    let totalUsers;
    let users;
    if (authUser.role === "user") {
      totalUsers = await knex(USERS).where('role', 'user').where(query).count({ count: '*' }).first();
      totalUsers = totalUsers.count;
      users = await knex.select('u.*', 'd.name as department')
        .from(`${USERS} as u`)
        .where('role', 'user')
        .where(query)
        .leftJoin(`${DEPARTMENTS} as d`, 'u.department', 'd.id')
        .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
        .offset(skip)
        .limit(limit);
    } else {
      totalUsers = await knex(USERS).where(query).count({ count: '*' }).first();
      totalUsers = totalUsers.count;
      users = await knex.select('u.*', 'd.name as department')
        .from(`${USERS} as u`)
        .where(query)
        .leftJoin(`${DEPARTMENTS} as d`, 'u.department', 'd.id')
        .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
        .offset(skip)
        .limit(limit);
    }

    const usersWithoutPassword = users.map((user) => {
      const { password, ...dataWithoutPassword } = user;
      return dataWithoutPassword;
    })

    const formattedUsers = usersWithoutPassword.map((user) => {
      const photoUrl = !user.photo ? null : `${DOMAIN}/images/${user.photo}`
      const avatar = user.firstname.charAt(0) + user.lastname.charAt(0);

      return {
        ...user,
        avatar: avatar,
        department: user?.department || null,
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
      totalEmployee,
    });
  } catch (error) {
    console.log(error.message);
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

    let query = {};
    if (filter) {
      const filterMonth = isNaN(filter) ? month : parseInt(filter);
      query = function() {
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
    let getAllUsers = await knex(USERS).where("role", "user").select("*");
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
    let getAllUsers = await knex(USERS)
      .where("id", "!=", loginUser)
      .select("*");
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

    let getProfile = knex.select(
        'up.*', 
        'u.*', 
        'd.name as departmentName',
        knex.raw('IFNULL(GROUP_CONCAT(IF(p.id IS NOT NULL, JSON_OBJECT("id", p.id, "name", p.name), NULL)), "") as projects')
      )
      .from(`${USERS} as u`)
      .leftJoin(`${DEPARTMENTS} as d`, 'd.id', 'u.department')
      .leftJoin(`${USER_PROJECT_RELATION} as up`, 'u.id', 'up.userId')
      .leftJoin(`${PROJECTS} as p`, 'p.id', 'up.projectId')
      .groupBy('u.id')
      .first();

    if (id) {
      getProfile = await getProfile.where('u.id', id)
    } else {
      getProfile = await getProfile.where('u.id', req.user.id)
    }
    
    getProfile.projects = JSON.parse(`[${getProfile.projects}]`);
    
    const photoUrl = !getProfile?.photo ? null : `${DOMAIN}/images/${getProfile?.photo}`;
    const { password, ...dataWithoutPassword } = getProfile;
    
    return res.status(200).json({
      error: false,
      message: "Users get profile successfully!!",
      data: {
        ...dataWithoutPassword,
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
    const user = req.user.id;
    const { password } = req.body;

    const hashed = await hashPassword(password);
    await knex(USERS).where("id", user).update({ password: hashed, updatedAt: new Date() });
    res.status(200).send({
      error: false,
      message: "Password Reset Successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      error: true,
      message: "Something went wrong",
      error,
    });
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
