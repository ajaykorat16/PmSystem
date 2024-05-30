const { knex } = require('../database/db');
const { USERS, DEPARTMENTS } = require('../constants/tables');
var fs = require("fs");
const momentTimezone = require('moment-timezone')
const moment = require('moment')
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

const parseIndianDate = (date, input = 'ddd MMM DD YYYY HH:mm:ss Z+HHmm', format = 'YYYY-MM-DD') => {
    const utcDateTime = momentTimezone(date, input).tz('UTC');
    const indianDateTime = utcDateTime.clone().tz('Asia/Kolkata');
    return indianDateTime.format(format);
};

const formattedDate = (date) => {
    return moment(date).format('DD-MM-YYYY')
}

const parsedDate = (date, format = 'YYYY-MM-DD') => {
    const indianDateTime = momentTimezone(date, 'YYYY-MM-DD').tz('Asia/Kolkata');
    return indianDateTime.format(format);
};

function capitalizeFLetter(string) {
    if (typeof string !== 'undefined') {
        return string[0].toUpperCase() + string.slice(1);
    } else {
        return "-"
    }
}

function formatteDayType(dayType) {
    switch (dayType) {
        case "single":
            return "Single Day";
        case "multiple":
            return "Multiple Day";
        case "first_half":
            return "First Half";
        case "second_half":
            return "Second Half";
        default:
            return "-";
    }
}

function parsedDayType(dayType) {
    switch (dayType) {
        case "Single Day":
            return "single";
        case "Multiple Day":
            return "multiple";
        case "First Half":
            return "first_half";
        case "Second Half":
            return "second_half";
        default:
            return "single";
    }
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (!matches || matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = Buffer.from(matches[2], 'base64');

    return response;
}

const sendMailForLeaveStatus = async (data, reasonForLeaveReject) => {
    try {
        fs.readFile('./templates/email_leaveResponse.html', 'utf8', async function (err, content) {
            if (err) {
                console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
            } else {
                let body = content;
                const { startDate, endDate, reason, totalDays, status, leaveType, leaveDayType, userId } = data

                const adminUser = await knex(USERS).where({ email: process.env.ADMIN_EMAIL }).first();

                const employee = await knex.select(
                    'u.*',
                    knex.raw(`IFNULL(GROUP_CONCAT(IF(d.id IS NOT NULL, JSON_OBJECT('id', d.id,'name', d.name), NULL)), '') as department`)
                )
                .from(`${USERS} as u`)
                .where('u.id', userId)
                .leftJoin(`${DEPARTMENTS} as d`, 'd.id', 'u.department')
                .first();
                employee.department = employee.department ? JSON.parse(`${employee.department}`) : null;

                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{department}', employee?.department?.name ? employee.department.name : ' - ')
                body = body.replace('{reason}', capitalizeFLetter(reason))
                body = body.replace('{leaveType}', capitalizeFLetter(leaveType))
                body = body.replace('{leaveDayType}', formatteDayType(leaveDayType))
                body = body.replace('{startDate}', formattedDate(startDate))
                body = body.replace('{endDate}', formattedDate(endDate))
                body = body.replace('{totalDays}', totalDays)
                body = body.replace('{reasonForLeaveReject}', capitalizeFLetter(reasonForLeaveReject))
                body = body.replace('{status}', capitalizeFLetter(status))
                body = body.replace('{adminName}', adminUser.fullName)

                const mailOptions = {
                    from: `"Kriva Technolabs" <${process.env.MAIL_FROM_EMAIL}>`,
                    to: employee.email,
                    subject: "Your Leave Request Update",
                    html: body
                };

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log("Mail.sendEmail [ERROR: " + err + "]");
                        return { error: true, message: err };
                    }
                    console.log("Mail.sendEmail [SUCCESS]");
                    return { error: false, message: "Email sent successfully!" };
                });
            }
        })
    } catch (error) {
        console.error("Error sending email:", error);
        return { status: false, message: "Failed to send email." };
    }
};

const sendMailForLeaveRequest = async (data) => {
    try {
        fs.readFile('./templates/email_leaveRequest.html', 'utf8', async function (err, content) {
            if (err) {
                console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
            } else {
                let body = content;
                const { reason, startDate, endDate, userId, totalDays, leaveType, leaveDayType } = data;

                const adminUser = await knex(USERS).where({ email: process.env.ADMIN_EMAIL }).first();

                const employee = await knex.select(
                    'u.*',
                    knex.raw(`IFNULL(GROUP_CONCAT(IF(d.id IS NOT NULL, JSON_OBJECT('id', d.id,'name', d.name), NULL)), '') as department`)
                )
                .from(`${USERS} as u`)
                .where('u.id', userId)
                .leftJoin(`${DEPARTMENTS} as d`, 'd.id', 'u.department')
                .first();
                employee.department = employee.department ? JSON.parse(`${employee.department}`) : null;

                body = body.replace('{adminName}', adminUser.fullName)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{department}', employee?.department?.name ? employee.department.name : ' - ')
                body = body.replace('{leaveType}', capitalizeFLetter(leaveType))
                body = body.replace('{leaveDayType}', formatteDayType(leaveDayType))
                body = body.replace('{startDate}', formattedDate(startDate))
                body = body.replace('{endDate}', formattedDate(endDate))
                body = body.replace('{reason}', reason)
                body = body.replace('{totalDays}', totalDays)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{phoneNumber}', employee.phone)

                const mailOptions = {
                    from: `"Kriva Technolabs" <${process.env.MAIL_FROM_EMAIL}>`,
                    to: adminUser.email,
                    subject: "Leave Request",
                    html: body
                };

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.log("Mail.sendEmail [ERROR: " + err + "]");
                        return { error: true, message: err };
                    }
                    console.log("Mail.sendEmail [SUCCESS]");
                    return { error: false, message: "Email sent successfully!" };
                });
            }
        })
    } catch (error) {
        console.error("Error sending email:", error);
        return { status: false, message: "Failed to send email." };
    }
};

module.exports = { sendMailForLeaveStatus, sendMailForLeaveRequest, formattedDate, capitalizeFLetter, parsedDate, parseIndianDate, formatteDayType, parsedDayType, decodeBase64Image }
