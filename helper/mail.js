const nodemailer = require('nodemailer');
const Users = require("../models/userModel")
var fs = require("fs");
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

const sendMailForLeaveStatus = async (user, status) => {
    try {
        const { fullName, email } = user
        fs.readFile('./templates/email_leaveResponse.html', 'utf8', async function (err, content) {
            if (err) {
                console.log("Mail.sendLeaveRequest [ERROR: " + err + " ]");
            } else {
                let body = content;
                const adminUser = await Users.findOne({ role: 'admin' }).select("-photo");
                body = body.replace('{userName}', fullName)
                body = body.replace('{status}', status)
                body = body.replace('{adminName}', adminUser.fullName)

                const mailOptions = {
                    from: process.env.MAIL_FROM_EMAIL,
                    to: email,
                    subject: "Leave Status",
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
                const { reason, startDate, endDate, type, userId, totalDays } = data;
                
                const adminUser = await Users.findOne({ role: 'admin' }).select("-photo");
                const employee = await Users.findOne({ _id: userId }).select("-photo").populate('department');

                body = body.replace('{adminName}', adminUser.fullName)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{department}', employee.department.name)
                body = body.replace('{startDate}', startDate.toISOString().split('T')[0])
                body = body.replace('{endDate}', endDate.toISOString().split('T')[0])
                body = body.replace('{reason}', reason)
                body = body.replace('{totalDays}', totalDays)
                body = body.replace('{userName}', employee.fullName)
                body = body.replace('{phoneNumber}', employee.phone)

                const mailOptions = {
                    from: process.env.MAIL_FROM_EMAIL,
                    to: "ajaykorat16@gmail.com",
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

module.exports = { sendMailForLeaveStatus, sendMailForLeaveRequest }
