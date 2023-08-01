require('dotenv').config()
require("./database/db")
require("./routers/cron")
const express = require('express')
const PORT = process.env.PORT
const user = require("./routers/user")
const department = require("./routers/department")
const leaveRecord = require("./routers/leaveRecord")
const leaveManagement = require("./routers/leaveManagement")
const app = express()
var cors = require('cors')
app.use(cors())
app.use(express.json())

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.use("/user", user)
app.use("/department", department)
app.use("/leaves", leaveRecord)
app.use("/leaveManagement", leaveManagement)

app.listen(PORT, () => {
  console.log(`Server running in http://localhost:${PORT}`);
})