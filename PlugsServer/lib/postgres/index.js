const pg = require('pg');
//const { log } = require('../../../Web/lib/logger');

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                            PlugsControler - Managment                         |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * This function will return all plug controlers from the database.
 * @returns {Promise}
 */
const GetControlers = function (controlername, token) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM public.plugs_controler ORDER BY controlername ASC `, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

const Controler = {
  GetAll: GetControlers,
}

module.exports = {
  Controler,
}