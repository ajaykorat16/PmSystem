const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const { capitalizeFLetter } = require("../helper/mail");
const { knex } = require("../database/db");
const { CREDENTIALS, USER_CREDENTIAL_RELATION, USERS } = require("../constants/tables");

const createCredential = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, users } = req.body;
    const createdBy = req.user.id;

    const credentialObj = {
      title: capitalizeFLetter(title),
      description: capitalizeFLetter(description),
      createdBy,
    };

    const credential = await knex(CREDENTIALS).insert(credentialObj);
    if (users.length > 0) {
      for (const user of users) {
        await knex(USER_CREDENTIAL_RELATION).insert({ userId: user, credentialId: credential[0], });
      }
    }
    return res.status(201).json({
      error: false,
      message: "Credential created successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const getCredential = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || -1;
    const { filter } = req.body;
    const userId = req.user.id;

    query = function () {
      this.where("uc.userId", userId).orWhere("c.createdBy", userId);
    };

    let totalCredentialCount = await knex
        .select("uc.*", "u.fullName as username", "c.*")
        .from(`${USER_CREDENTIAL_RELATION} as uc`)
        .innerJoin(`${USERS} as u`, "uc.userId", "u.id")
        .innerJoin(`${CREDENTIALS} as c`, "uc.credentialId", "c.id")
        .where(query)
        .count("u.id")
        .first();
    totalCredentialCount = totalCredentialCount["count(`u`.`id`)"];

    const credential = await knex
      .select("uc.*", "u.fullName as username", "c.*")
      .from(`${USER_CREDENTIAL_RELATION} as uc`)
      .innerJoin(`${USERS} as u`, "uc.userId", "u.id")
      .innerJoin(`${CREDENTIALS} as c`, "uc.credentialId", "c.id")
      .where("c.createdBy", userId)
      .orWhere("uc.userId", userId)
      .orWhere("c.title", "like", `%${filter}%`)
      .orWhere("c.description", "like", `%${filter}%`)
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(sortField, sortOrder === -1 ? "desc" : "asc");

    return res.status(201).json({
      error: false,
      message: "Credential is getting successfully.",
      data: credential,
      currentPage: page,
      totalPages: Math.ceil(totalCredentialCount / limit),
      totalCredential: totalCredentialCount,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const getSingleCredential = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await knex(CREDENTIALS)
      .where(`${CREDENTIALS}.id`, id)
      .innerJoin(`${USER_CREDENTIAL_RELATION}`, `${CREDENTIALS}.id`, `${USER_CREDENTIAL_RELATION}.credentialId`)
      .innerJoin(`${USERS}`, `${USER_CREDENTIAL_RELATION}.userId`, `${USERS}.id`);

    const createdBy = await knex(CREDENTIALS)
      .where(`createdBy`, credential[0].createdBy)
      .innerJoin(`${USERS} as createdBy`, `${CREDENTIALS}.createdBy`, `createdBy.id`)
      .first();

    const transformedCreatedBy = {
      id: createdBy.id,
      name: createdBy.fullName,
      photo: createdBy.photo,
    };

    const transformedData = {
      id: credential[0].id,
      title: credential[0].title,
      description: credential[0].description,
      createdBy: transformedCreatedBy,
      createdAt: credential[0].createdAt,
      updatedAt: credential[0].updatedAt,
      credentialId: credential[0].credentialId,
      users: credential.map((item) => {
        const { id, userId, fullName, photo } = item;
        return { id, userId, fullName, photo };
      }),
    };

    const createdByPhotoUrl = transformedData.createdBy.photo ? `${DOMAIN}/images/${transformedData.createdBy.photo}` : null;

    return res.status(200).json({
      error: false,
      message: "Single credential is getting successfully.",
      data: {
        ...transformedData,
        users: transformedData.users.map((user) => ({
          ...user,
          photo: user.photo ? `${DOMAIN}/images/${user.photo}` : null,
        })),
      },
      createdBy: {
        ...transformedCreatedBy,
        photo: createdByPhotoUrl,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const updateCredential = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, users } = req.body;
    const { id } = req.params;

    const existingCredential = await knex(CREDENTIALS).where('id', id).first();
    if (!existingCredential) {
      return res.status(404).json({
        error: true,
        message: "This credential is not existing in the database.",
      });
    }

    const credentialObj = {
      title: title ? capitalizeFLetter(title) : existingCredential.title,
      description: description ? capitalizeFLetter(description) : existingCredential.description,
    };

      
    if (existingCredential.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        error: true,
        message: "You are not authorized to Update this credential.",
      });
    }
      
    if (users && Array.isArray(users)) {
      await knex(USER_CREDENTIAL_RELATION).where('credentialId', id).del();
      for (const user of users) {
        await knex(USER_CREDENTIAL_RELATION).insert({ userId: user.id, credentialId: id });
      }
    }

    await knex(CREDENTIALS).where('id', id).update({ ...credentialObj, updatedAt: new Date() });

    return res.status(200).json({
      error: false,
      message: "Credential updated successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

const deleteCredential = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingCredential = await knex(CREDENTIALS).where("id", id).first();

    if (!existingCredential) {
      return res.status(404).json({
        error: true,
        message: "This credential does not exist in the database.",
      });
    }

    if (existingCredential.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        error: true,
        message: "You are not authorized to delete this credential.",
      });
    }

    await knex(USER_CREDENTIAL_RELATION).where("credentialId", id).del();
    await knex(CREDENTIALS).where("id", id).del();

    return res.status(200).json({
      error: false,
      message: "Credential deleted successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = {
  createCredential,
  getCredential,
  getSingleCredential,
  updateCredential, 
  deleteCredential,
};