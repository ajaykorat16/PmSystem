const asyncHandler = require('express-async-handler');
const moment = require('moment');
const { validationResult } = require('express-validator');
const { capitalizeFLetter, formattedDate } = require("../helper/mail");
const { knex } = require('../database/db');
const { WORKLOGS, PROJECTS, USERS } = require("../constants/tables");

const createWorkLog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { project, description, logDate, time } = req.body;
        const userId = req.user.id

        const logObj = {
            userId,
            project,
            description: capitalizeFLetter(description),
            logDate: logDate,
            time
        };

        await knex('worklogs').insert(logObj);

        return res.status(201).json({
            error: false,
            message: "Worklog created successfully.",
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const userGetWorklog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let { sortField, sortOrder, page, limit, filter } = req.query;
    const userId = req.user.id;

    sortField = sortField || 'createdAt';
    sortOrder = parseInt(sortOrder) || -1;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    try {
        let dateSearch = null;
        let projects = [];

        if (filter) {
            const isValidDate = (filter) => {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            };

            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = filter.split("-").reverse().join("-");
            }

            const searchProjects = await knex('projects').where('name', 'like', `%${filter}%`);
            if (searchProjects.length) {
                projects = searchProjects.map((d) => d.id);
            }
        }

        const totalWorklogCountResult = await knex('worklogs as w')
            .count('w.id as count')
            .innerJoin('projects as p', 'w.project', 'p.id')
            .where('w.userId', userId)
            .first();

        const totalWorklogCount = totalWorklogCountResult.count || 0;

        let query = knex('worklogs as w')
            .select('w.*', 'p.name as projectName')
            .innerJoin('projects as p', 'w.project', 'p.id')
            .where('w.userId', userId);

        if (filter) {
            query = query.where(function () {
                this.where('w.description', 'like', `%${filter}%`)
                    .orWhereIn('w.project', projects);

                if (dateSearch) {
                    this.orWhereRaw('DATE(w.logDate) = ?', [dateSearch]);
                }
            });
        }

        const offset = (page - 1) * limit;
        query = query.offset(offset).limit(limit).orderBy(sortField, sortOrder === -1 ? "desc" : "asc");

        const worklog = await query;

        const formattedWorklog = worklog.map((log) => ({
            ...log,
            logDate: formattedDate(log.logDate),
        }));

        const currentWeekStart = moment().startOf('week');
        const dayWiseTotals = {};

        formattedWorklog.forEach((log) => {
            const logDate = moment(log.logDate, "DD-MM-YYYY");
            if (logDate.isBetween(currentWeekStart, moment(), undefined, '[]')) {
                const day = logDate.format("dddd");
                if (!dayWiseTotals[day]) {
                    dayWiseTotals[day] = 0;
                }
                dayWiseTotals[day] += log.time;
            }
        });

        const totalWeekTime = Object.values(dayWiseTotals).reduce((total, dayTime) => total + dayTime, 0);

        return res.status(200).json({
            error: false,
            message: "Worklog retrieved successfully.",
            dayWiseTotals,
            totalWeekTime,
            data: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
        });

    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).send('Server error');
    }
};

const getAllWorklog = async (req, res) => {
    let { sortField, sortOrder, page, limit } = req.query;
    let { filter } = req.body

    filter = filter || {};
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;
    sortOrder = parseInt(sortOrder) || -1;
    sortField = sortField || 'createdAt';

    try {
        let countQuery = knex('worklogs')
            .count('* as totalCount')
            .innerJoin('users as u', 'worklogs.userId', 'u.id')
            .innerJoin('projects as p', 'worklogs.project', 'p.id');

        if (filter.project) {
            countQuery = countQuery.where('p.id', filter.project);
        }

        if (filter.userId) {
            countQuery = countQuery.where('worklogs.userId', filter.userId);
        }

        if (filter.description) {
            countQuery = countQuery.where('worklogs.description', 'like', `%${filter.description}%`);
        }

        if (filter.logDate) {
            let formattedDate = moment(filter.logDate).format('YYYY-MM-DD');
            countQuery = countQuery.whereRaw('DATE(worklogs.logDate) = ?', [formattedDate]);
        }

        const totalCountResult = await countQuery.first();
        const totalWorklogCount = totalCountResult.totalCount || 0;

        let query = knex('worklogs')
            .select('worklogs.*', 'u.fullName', 'p.name as projectName')
            .innerJoin('users as u', 'worklogs.userId', 'u.id')
            .innerJoin('projects as p', 'worklogs.project', 'p.id');

        if (filter.project) {
            query = query.where('p.id', filter.project);
        }

        if (filter.userId) {
            query = query.where('worklogs.userId', filter.userId);
        }

        if (filter.description) {
            query = query.where('worklogs.description', 'like', `%${filter.description}%`);
        }

        if (filter.logDate) {
            let formattedDate = moment(filter.logDate).format('YYYY-MM-DD');
            query = query.whereRaw('DATE(worklogs.logDate) = ?', [formattedDate]);
        }

        query = query.orderBy(sortField, sortOrder === -1 ? 'desc' : 'asc');
        const offset = (page - 1) * limit;
        query = query.offset(offset).limit(limit);

        const worklog = await query;

        const formattedWorklog = worklog.map((log) => ({
            ...log,
            logDate: formattedDate(log.logDate),
        }));

        return res.status(200).json({
            error: false,
            message: "All Worklogs retrieved successfully.",
            data: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
        });

    } catch (error) {
        console.error("Server error:", error.message);
        return res.status(500).send('Server error');
    }
};


const getSingleWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params

        const worklog = await knex
            .select('w.*', 'u.fullName as username', 'p.name as projectName')
            .from(`worklogs as w`)
            .where('w.id', id)
            .innerJoin(`users as u`, 'w.userId', 'u.id')
            .innerJoin(`projects as p`, 'w.project', 'p.id');

        return res.status(200).json({
            error: false,
            message: "Single worklog getting successfully.",
            data: worklog
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const updateWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params
        const { project, description, logDate, time } = req.body;

        const worklog = await knex('worklogs').where('id', id).first();
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            })
        }

        const updatedFields = {
            project,
            description: capitalizeFLetter(description),
            logDate,
            time
        }

        await knex(WORKLOGS).where('id', id).update({ ...updatedFields, updatedAt: new Date() });
        return res.status(200).json({
            error: false,
            message: "Worklog updated successfully.",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const deleteWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params

        const worklog = await knex('worklogs').where('id', id).first();
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            })
        }

        await knex('worklogs').where('id', id).del();
        return res.status(200).json({
            error: false,
            message: "Worklog deleted successfully.",
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


module.exports = { createWorkLog, userGetWorklog, getAllWorklog, getSingleWorklog, updateWorklog, deleteWorklog }