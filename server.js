require('dotenv').config()
require("./database/db")
require("./routers/cron")
const express = require('express')
const path = require('path')
const PORT = process.env.PORT
const user = require("./routers/user")
const department = require("./routers/department")
const leaveRecord = require("./routers/leaveRecord")
const leaveManagement = require("./routers/leaveManagement")
const projects = require("./routers/projects")
const worklog = require("./routers/worklog")
const credential = require("./routers/credentials")

const app = express()
var cors = require('cors')
app.use(cors())

const corsOptions = { origin: "*" }
app.use(express.static(path.join(__dirname, "/client/build")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

app.use(cors(corsOptions))
app.use(express.json())

app.use("/user", user)
app.use("/department", department)
app.use("/leaves", leaveRecord)
app.use("/leaveManagement", leaveManagement)
app.use("/projects", projects)
app.use("/worklog", worklog)
app.use("/credential", credential)


app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
})