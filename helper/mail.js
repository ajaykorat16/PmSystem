const nodemailer = require('nodemailer');
const Users = require("../models/userModel")
var fs = require("fs");
const moment = require('moment');
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

const formattedDate = (date) => {
    return moment(date).format('DD-MM-YYYY')
}

function capitalizeFLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

const sendMailForLeaveStatus = async (data, reasonForLeaveReject) => {
    try {
        fs.readFile('./templates/email_leaveResponse.html', 'utf8', async function (err, content) {
            if (err) {
                console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
            } else {
                let body = content;
                const { startDate, endDate, reason, totalDays, status, type, userId } = data
                
                const adminUser = await Users.findOne({ role: 'admin' }).select("-photo");
                const employee = await Users.findOne({ _id: userId }).select("-photo").populate('department');

                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{department}', employee.department.name)
                body = body.replace('{reason}', reason)
                body = body.replace('{leaveType}', type)
                body = body.replace('{startDate}', formattedDate(startDate))
                body = body.replace('{endDate}', formattedDate(endDate))
                body = body.replace('{totalDays}', totalDays)
                body = body.replace('{reasonForLeaveReject}', reasonForLeaveReject)
                body = body.replace('{status}', capitalizeFLetter(status))
                body = body.replace('{adminName}', adminUser.fullName)

                const mailOptions = {
                    from: process.env.MAIL_FROM_EMAIL,
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
                const { reason, startDate, endDate, userId, totalDays } = data;

                const adminUser = await Users.findOne({ role: 'admin' }).select("-photo");
                const employee = await Users.findOne({ _id: userId }).select("-photo").populate('department');

                body = body.replace('{adminName}', adminUser.fullName)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{department}', employee.department.name)
                body = body.replace('{startDate}', formattedDate(startDate))
                body = body.replace('{endDate}', formattedDate(endDate))
                body = body.replace('{reason}', reason)
                body = body.replace('{totalDays}', totalDays)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{phoneNumber}', employee.phone)

                const mailOptions = {
                    from: process.env.MAIL_FROM_EMAIL,
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

module.exports = { sendMailForLeaveStatus, sendMailForLeaveRequest, formattedDate, capitalizeFLetter }
