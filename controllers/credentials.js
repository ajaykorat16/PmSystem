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
        await knex(USER_CREDENTIAL_RELATION).insert({
          userId: user.id,
          credentialId: credential[0],
        });
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
    const sortOrder = parseInt(req.query.sortOrder) || -1;
    const filter = req.query.filter || '';
    const userId = req.user.id;

    query = function () {
      this.where("uc.userId", userId).orWhere("c.createdBy", userId);
    };

    let filterQuery = {};
    if (filter) {
      filterQuery = function () {
        this.where("c.title", "like", `%${filter}%`)
          .orWhere("c.description", "like", `%${filter}%`);
      }
    }

    let totalCredentialCount = await knex(`${CREDENTIALS} as c`)
      .leftJoin(`${USER_CREDENTIAL_RELATION} as uc`, "uc.credentialId", "c.id")
      .leftJoin(`${USERS} as u`, "uc.userId", "u.id")
      .where(function () {
        this.where("c.createdBy", userId)
          .orWhere("uc.userId", userId);
      })
      .andWhere(filterQuery)
      .countDistinct('c.id as count')
      .first();

    totalCredentialCount = totalCredentialCount.count ? totalCredentialCount.count : 0;

    const credential = await knex
      .select("uc.*", "u.fullName as username", "c.id as credentialId", "c.title", "c.description", "c.createdBy", "c.createdAt", 'c.updatedAt')
      .from(`${CREDENTIALS} as c`)
      .leftJoin(`${USER_CREDENTIAL_RELATION} as uc`, "uc.credentialId", "c.id")
      .leftJoin(`${USERS} as u`, "uc.userId", "u.id")
      .where(function () {
        this.where("c.createdBy", userId)
          .orWhere("uc.userId", userId);
      })
      .andWhere(filterQuery)
      .groupBy('c.id')
      .offset((page - 1) * limit)
      .limit(limit)
      .orderBy(`c.${sortField}`, sortOrder === -1 ? "desc" : "asc");

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

    const credential = await knex.select(
      'c.*',
      'c.id as credentialId', 'uc.*',
      knex.raw('IFNULL(GROUP_CONCAT(IF(u.id IS NOT NULL, JSON_OBJECT("id", u.id, "fullName", u.fullName, "photo", u.photo), NULL)), "") as users')
    )
      .from(`${CREDENTIALS} as c`)
      .where(`c.id`, id)
      .leftJoin(`${USER_CREDENTIAL_RELATION} as uc`, `c.id`, `uc.credentialId`)
      .leftJoin(`${USERS} as u`, `uc.userId`, `u.id`).first();

    credential.users = JSON.parse(`[${credential.users}]`);

    const createdBy = await knex(CREDENTIALS)
      .where(`createdBy`, credential.createdBy)
      .innerJoin(`${USERS} as u`, `${CREDENTIALS}.createdBy`, `u.id`)
      .first();

    const transformedCreatedBy = {
      id: createdBy.id,
      name: createdBy.fullName,
      photo: createdBy.photo ? `${DOMAIN}/images/${createdBy.photo}` : null,
    };

    const transformedData = {
      id: credential.id,
      title: credential.title,
      description: credential.description,
      createdBy: transformedCreatedBy,
      createdAt: credential.createdAt,
      updatedAt: credential.updatedAt,
      credentialId: credential.credentialId,
      users: credential.users,
    };

    return res.status(200).json({
      error: false,
      message: "Single credential is getting successfully.",
      data: {
        ...transformedData,
        users: transformedData.users.map((user) => ({
          ...user,
          photo: user.photo ? `${DOMAIN}/images/${user.photo}` : null,
        })),
      }
    });
  } catch (error) {
    console.error(error);
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
        await knex(USER_CREDENTIAL_RELATION).insert({ userId: user, credentialId: id });
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
