const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { capitalizeFLetter, formattedDate } = require("../helper/mail");
const { knex } = require("../database/db");
const {  PROJECTS, USER_PROJECT_RELATION, USERS, WORKLOGS } = require("../constants/tables");

const createProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, startDate, developers } = req.body;

    const projectObj = {
      name: capitalizeFLetter(name),
      description: capitalizeFLetter(description),
      startDate: startDate,
    };

    const projectName = await knex(PROJECTS).where("name", projectObj.name).first();
    if (projectName) {
      return res.status(200).json({
        error: true,
        message: "Project has already created.",
      });
    }

    const project = await knex(PROJECTS).insert(projectObj);

    if (developers) {
      for (const developer of developers) {
        await knex(USER_PROJECT_RELATION).insert({ userId: developer.id, projectId: project[0] });
      }
    }

    return res.status(201).json({
      error: false,
      message: "Project created successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const getAllProjects = await knex(PROJECTS);

    const formatteProject = getAllProjects.map((project) => {
      return {
        ...project,
        startDate: formattedDate(project.startDate),
      };
    });

    return res.status(200).json({
      error: false,
      message: "All projects retrieved successfully.",
      data: formatteProject,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server error");
  }
});

const getProjects = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = parseInt(req.query.sortOrder) || -1;
    const { filter } = req.body;
    let query = {};

    if (filter) {
      function isValidDate(filter) {
        const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
        return dateRegex.test(filter);
      }

      let formattedDate = null;
      if (typeof filter === "string" && isValidDate(filter)) {
        formattedDate = filter.split("-").reverse().join("-");
      }

      query = function () {
        this.where(function() {
          this.orWhere("p.name", "like", `%${filter}%`)
              .orWhere("description", "like", `%${filter}%`)
              .orWhereRaw("MONTH(p.startDate) = ?", [isNaN(filter) ? null : parseInt(filter)])
              .orWhereRaw("YEAR(p.startDate) = ?", [isNaN(filter) ? null : parseInt(filter)])
              .orWhere("p.startDate", formattedDate);
        })
        .orWhereExists(function() {
          this.select(knex.raw(1))
              .from(`${USER_PROJECT_RELATION} as up`)
              .innerJoin(`${USERS} as u`, "up.userId", "u.id")
              .whereRaw("up.projectId = p.id")
              .andWhere("u.fullName", "like", `%${filter}%`);
        });
      };
    }

    let totalProjects =  await knex(`${PROJECTS} as p`)
      .leftJoin(`${USER_PROJECT_RELATION} as up`, "p.id", "up.projectId")
      .leftJoin(`${USERS} as u`, "up.userId", "u.id")
      .where(query)
      .countDistinct("p.id as count")
      .first();

    totalProjects = totalProjects.count ? totalProjects.count : 0;

    const skip = (page - 1) * limit;

    const projectsQuery = await knex.select(
        "u.fullName as username", 
        "p.name as projectName",
        "p.id as projectId", 
        "p.startDate",
        'p.description as description',
        knex.raw('GROUP_CONCAT(JSON_OBJECT("id", u.id, "fullName", u.fullName)) as developers')
      )
      .from(`${PROJECTS} as p`)
      .leftJoin(`${USER_PROJECT_RELATION} as up`, "p.id", "up.projectId")
      .leftJoin(`${USERS} as u`, "up.userId", "u.id")
      .where(query)
      .groupBy('p.id')
      .orderBy(`p.${sortField}`, sortOrder === -1 ? "desc" : "asc")
      .offset(skip)
      .limit(limit);    

    const projects = projectsQuery.map(row => {
      return {
        ...row,
        developers: JSON.parse(`[${row.developers}]`)
      };
    });

    const formattedProject = projects.map((project) => {
      return {
        ...project,
        startDate: formattedDate(project.startDate),
      };
    });

    return res.status(200).json({
      error: false,
      message: "Project retrieved successfully.",
      data: formattedProject,
      currentPage: page,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const getUserProjects = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = parseInt(req.query.sortOrder) || -1;
    const userId = req.user.id;
    const { filter } = req.body;

    let query = {};

    if (filter) {
      function isValidDate(filter) {
        const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
        return dateRegex.test(filter);
      }

      let formattedDate = null;
      if (typeof filter === "string" && isValidDate(filter)) {
        formattedDate = filter.split('-').reverse().join('-');
      }
      query = function () {
        this.where("p.name", "like", `%${filter}%`)
        .orWhere("description", "like", `%${filter}%`)
        .orWhereRaw("MONTH(startDate) = ?", [isNaN(filter) ? null : parseInt(filter)])
        .orWhereRaw("YEAR(startDate) = ?", [isNaN(filter) ? null : parseInt(filter)])
        .orWhere("p.startDate", '=', formattedDate)
      };
    }

    let totalProjectsCount = await knex(`${USER_PROJECT_RELATION} as up`)
      .innerJoin(`${USERS} as u`, "up.userId", "u.id")
      .innerJoin(`${PROJECTS} as p`, "up.projectId", "p.id")
      .where('up.userId', userId)
      .where(query)
      .count("p.id as count")
      .first();

    totalProjectsCount = totalProjectsCount ? totalProjectsCount.count : 0;
      const projectsQuery = await knex.select(
        "u.fullName as username", 
        "p.name as projectName",
        "p.id as projectId", 
        "p.startDate",
        'p.description as description',
        knex.raw('GROUP_CONCAT(JSON_OBJECT("id", u.id, "fullName", u.fullName)) as developers')
      )
      .from(`${USER_PROJECT_RELATION} as up`)
      .innerJoin(`${USERS} as u`, "up.userId", "u.id")
      .innerJoin(`${PROJECTS} as p`, "up.projectId", "p.id")
      .where('up.userId', userId)
      .where(query)
      .groupBy('p.id')
      .orderBy(`p.${sortField}`, sortOrder === -1 ? "desc" : "asc")
      .offset((page - 1) * limit)
      .limit(limit);

      const projects = projectsQuery.map(row => {
        return {
          ...row,
          developers: JSON.parse(`[${row.developers}]`)
        };
      });

    const formattedProjects = projects.map((project) => ({
      ...project,
      startDate: formattedDate(project.startDate),
    }));

    return res.status(200).json({
      error: false,
      message: "Projects retrieved successfully.",
      data: formattedProjects,
      currentPage: page,
      totalPages: Math.ceil(totalProjectsCount / limit),
      totalProjects: totalProjectsCount,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const updateProject = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, startDate, developers } = req.body;
    const { id } = req.params;

    const existingProject = await knex(PROJECTS).where("id", id).first();

    if (!existingProject) {
      return res.status(404).json({
        error: true,
        message: "This project does not exist in the database.",
      });
    }

    const projectObj = {
      name: name ? capitalizeFLetter(name) : existingProject.name,
      description: description ? capitalizeFLetter(description) : existingProject.description,
      startDate: startDate || existingProject.startDate,
    };

    await knex(PROJECTS).where("id", id).update({ ...projectObj, updatedAt: new Date() });

    if(developers) {
      await knex(USER_PROJECT_RELATION).where("projectId", id).del();
      for (const developer of developers) {
        await knex(USER_PROJECT_RELATION).insert({ userId: developer, projectId: id, });
      }
    }

    return res.status(200).json({
      error: false,
      message: "Project updated successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const getSingleProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const projectQuery = await knex.select(
        'p.*',
        knex.raw('IFNULL(' +
        'GROUP_CONCAT(' +
          'IF(u.id IS NOT NULL, JSON_OBJECT("id", u.id, "fullName", u.fullName), NULL)' +
        '), "") as developers'),
      )
      .from(`${PROJECTS} as p`)
      .where('p.id', id)
      .leftJoin(`${USER_PROJECT_RELATION} as up`, "p.id", "up.projectId")
      .leftJoin(`${USERS} as u`, "up.userId", "u.id")
      .groupBy('p.id')
      .first();
      
    if (!projectQuery) {
      return res.status(400).json({
        error: true,
        message: "Project doesn't exist.",
      });
    } else {
      projectQuery.developers = JSON.parse(`[${projectQuery.developers}]`);
    }

    return res.status(200).json({
      error: false,
      message: "Single project getting successfully.",
      data: projectQuery,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const delelteProject = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await knex(PROJECTS).where('id', id).first();
    if(!existingProject) {
      return res.status(400).json({
        error: true,
        message: "Project doesn't exist.",
      });
    }
    
    await knex(USER_PROJECT_RELATION).where("projectId", id).del();
    await knex(PROJECTS).where("id", id).del();
    await knex(WORKLOGS).where('project', id).del();
    return res.status(200).json({
      error: false,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const userProjects = asyncHandler(async (req, res) => {
  try {
    const id = req.user.id;
    
    let projects = await knex
      .select("up.*", "u.fullName as username", "p.*")
      .from(`${USER_PROJECT_RELATION} as up`)
      .innerJoin(`${USERS} as u`, "up.userId", "u.id")
      .innerJoin(`${PROJECTS} as p`, "up.projectId", "p.id")
      .where("userId", id);

    return res.status(200).json({
      error: false,
      message: "Projects getting Successfully.",
      data: projects,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = {
  createProject, 
  getAllProjects,
  getProjects, 
  getUserProjects, 
  updateProject, 
  delelteProject,
  getSingleProject,
  userProjects,
};
