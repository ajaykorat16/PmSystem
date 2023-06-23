require('dotenv').config()
const express = require('express')
require("./database/db")
const PORT = process.env.PORT
const user = require("./routers/user")
const app = express()

app.use(express.json())

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.use("/user", user)

app.listen(PORT, ()=>{
    console.log(`Server running in http://localhost:${PORT}`);
})