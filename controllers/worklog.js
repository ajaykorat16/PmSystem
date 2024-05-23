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

        const worklog = await knex(WORKLOGS).insert(logObj);

        return res.status(201).json({
            error: false,
            message: "Worklog created successfully.",
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const userGetWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1;
        const userId = req.user.id;
        const { filter } = req.body;

        let query = {};
        let projects = [];
        let dateSearch = null;

        if (filter) {
            function isValidDate(filter) {
                const dateRegex = /^(0?[1-9]|[1-2]\d|3[0-1])-(0?[1-9]|1[0-2])-\d{4}$/;
                return dateRegex.test(filter);
            }

            if (typeof filter === "string" && isValidDate(filter)) {
                dateSearch = filter.split("-").reverse().join("-");
            }

            let searchProjects = await knex(PROJECTS).where('name', 'like', `%${filter}%`)
            if (searchProjects.length !== 0) {
                projects = searchProjects.map((d) => d.id);
            }

            query = function() {
                this.where('w.description', 'like', `%${filter}%`)
                  .orWhereIn('w.project', projects)
                  .orWhereRaw('DATE(w.logDate) = ?', dateSearch);
                };
            }

        const result = await knex(WORKLOGS).where('userId', userId).where(function() {
            this.where('description', 'like', `%${filter}%`)
            .orWhereIn('project', projects)
            .orWhereRaw('DATE(logDate) = ?', dateSearch);
        }).count({ count: '*' });

        const totalWorklogCount = result[0].count;

        const worklog = await knex
            .select('w.*', 'p.name as projectName')
            .from(`${WORKLOGS} as w`)
            .where('w.userId', userId)
            .where(query)
            .innerJoin(`${PROJECTS} as p`, 'w.project', 'p.id')
            .offset((page - 1) * limit)
            .limit(limit)
            .orderBy(sortField, sortOrder === -1 ? "desc" : "asc");

        const formattedWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });

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

        const totalWeekTime = Object.values(dayWiseTotals).reduce((total, dayTime) => {
            return total + dayTime;
        }, 0);

        return res.status(200).json({
            error: false,
            message: "Worklog getting successfully.",
            dayWiseTotals: dayWiseTotals,
            totalWeekTime: totalWeekTime,
            data: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(totalWorklogCount / limit),
            totalWorklog: totalWorklogCount,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

async function generateWorklogQuery(filter) {
    return new Promise(async (resolve, reject) => {
        const query = function() {
            if (filter.project) {
                this.where('name', filter.project)
            }
    
            if (filter.userId) {
                this.where('userId', filter.userId);
            }
    
            if (filter.description) {
                this.where('w.description', 'like', `%${filter.description}%`)
            }
    
            if (filter.logDate) {
                let formattedDate = filter.logDate.split("-").reverse().join("-");
                this.whereRaw('DATE(logDate) = ?', [formattedDate])
            }
        }
        resolve(query);
    });
}

const getAllWorklog = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || -1;
        const filter = req.body.filter;
        const yesterday = moment().subtract(1, 'days').startOf('day');
        let query = {}
        let initialQuery;
        if (typeof filter !== 'undefined') {
            query = await generateWorklogQuery(filter);
        }

        const userIds = await knex(WORKLOGS).select('userId').where('logDate', '>=', yesterday.startOf('day').format('YYYY-MM-DD HH:mm:ss')).andWhere('logDate', '<', yesterday.endOf('day').format('YYYY-MM-DD HH:mm:ss')).groupBy('userId').countDistinct('userId as userCount');
        
        const worklogUserCount = userIds[0] ? userIds[0].userCount : 0;
        
        let totalWorklogCount = await knex.select('w.*', 'p.name as projectName').from(`${WORKLOGS} as w`).where(query).innerJoin(`${PROJECTS} as p`, 'w.project', 'p.id').count('*');
        totalWorklogCount = totalWorklogCount[0]['count(*)'];
        
        const worklog = await knex.select('w.*', 'u.fullName', 'p.name as projectName').from(`${WORKLOGS} as w`).where(query).innerJoin(`${USERS} as u`, 'w.userId','u.id').innerJoin(`${PROJECTS} as p`, 'w.project', 'p.id').offset((page - 1) * limit).limit(limit).orderBy(sortField, sortOrder === -1 ? "desc" : "asc");

        const formattedWorklog = worklog.map((log) => {
            return {
                ...log,
                logDate: formattedDate(log.logDate),
            };
        });

        return res.status(200).json({
            error: false,
            message: "All Worklogs getting successfully.",
            data: formattedWorklog,
            currentPage: page,
            totalPages: Math.ceil(worklogUserCount / limit),
            totalWorklog: totalWorklogCount,
            worklogUserCount
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

const getSingleWorklog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { id } = req.params
        const worklog = await knex.select('w.*', 'u.fullName as username', 'p.name as projectName').from(`${WORKLOGS} as w`).where('w.id', id).innerJoin(`${USERS} as u`, 'w.userId', 'u.id').innerJoin(`${PROJECTS} as p`, 'w.project', 'p.id');
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

        const worklog = await knex(WORKLOGS).where('id', id).first();
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            })
        }

        const updatedFields = {
            project: project || worklog.project,
            description: capitalizeFLetter(description) || worklog.description,
            logDate: logDate || worklog.logDate,
            time: time || worklog.time
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

        const worklog = await knex(WORKLOGS).where('id', id).first();
        if (!worklog) {
            return res.status(404).json({
                error: true,
                message: "Worklog does not exist."
            })
        }

        await knex(WORKLOGS).where('id', id).del();
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