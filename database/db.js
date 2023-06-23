const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connected Database!')).catch((error)=>console.log(`error : ${error.message}`));