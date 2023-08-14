require('dotenv').config()
require("./database/db")
require("./routers/cron")
const express = require('express')
const PORT = process.env.PORT
const user = require("./routers/user")
const department = require("./routers/department")
const leaveRecord = require("./routers/leaveRecord")
const leaveManagement = require("./routers/leaveManagement")
const projects = require("./routers/projects")
const worklog = require("./routers/worklog")

const app = express()
var cors = require('cors')
app.use(cors())
app.use(express.json())

app.use("/user", user)
app.use("/department", department)
app.use("/leaves", leaveRecord)
app.use("/leaveManagement", leaveManagement)
app.use("/projects", projects)
app.use("/worklog", worklog)


app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
})