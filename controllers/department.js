const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { capitalizeFLetter } = require("../helper/mail");
const { knex } = require("../database/db");
const { DEPARTMENTS, USERS } = require("../constants/tables");

const createDepartment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;

    const existingDepartment = await knex(DEPARTMENTS).where("name", capitalizeFLetter(name)).first();

    if (existingDepartment) {
      return res.status(400).json({
        error: true,
        message: "Department Already Exists.",
      });
    }

    const departmentName = capitalizeFLetter(name);
    const newDepartment = await knex(DEPARTMENTS).insert({ name: departmentName });

    return res.status(201).send({
      error: false,
      message: "Department created successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const updateDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingDepartment = await knex(DEPARTMENTS).where("id", id).first();

    if (!existingDepartment) {
      return res.status(400).json({
        error: true,
        message: "Department does not exist.",
      });
    }

    const isExists = await knex(DEPARTMENTS).where({ name: capitalizeFLetter(name) }).first();

    if (isExists && isExists.id != id) {
      return res.status(400).json({
        error: true,
        message: "Department Already Exists.",
      });
    }

    const updateDepartment = await knex(DEPARTMENTS).where("id", id).update({ name: capitalizeFLetter(name) });
    
    return res.status(201).json({
      error: false,
      message: "Department updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const deleteDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existingDepartment = await knex(DEPARTMENTS).where("id", id).first();

    if (!existingDepartment) {
      return res.status(400).json({
        error: true,
        message: "Department does not exist",
      });
    }

    await knex(DEPARTMENTS).where("id", id).delete("id", id);

    const users = await knex(USERS).where('department', id);

    if (users.length > 0) {
      await knex(USERS).where("department", id).update({ department: "" });
    }

    return res.status(200).json({
      error: false,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getAllDepartment = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filter = req.query.query || "";
  const sortField = req.query.sortField || "createdAt";
  const sortOrder = parseInt(req.query.sortOrder) || -1;

  try {
    let totalDepartments = await knex("departments").count("id").first();
    totalDepartments = totalDepartments['count(`id`)'];
    const skip = (page - 1) * limit;

    const departments = await knex(DEPARTMENTS)
      .select()
      .where("name", "like", `%${filter}%`)
      .orderBy(sortField, sortOrder === -1 ? "desc" : "asc")
      .offset(skip)
      .limit(limit);

    return res.status(200).json({
      error: false,
      message: "Departments retrieved successfully.",
      data: departments,
      currentPage: page,
      totalPages: Math.ceil(totalDepartments / limit),
      totalDepartments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getDepartmentList = asyncHandler(async (req, res) => {
  try {
    const departments = await knex(DEPARTMENTS);
    return res.status(200).json({
      error: false,
      message: "Departments retrieved successfully.",
      data: departments,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getSingleDepartment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existingDepartment = await knex(DEPARTMENTS).where("id", id).first();

    if (!existingDepartment) {
      return res.status(400).json({
        error: true,
        message: "Department does not exist.",
      });
    }

    return res.status(200).json({
      error: false,
      message: "Single department is getting successfully.",
      data: existingDepartment,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllDepartment,
  getSingleDepartment,
  getDepartmentList,
};
