const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOSTNAME,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  }
});

module.exports = { knex }