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
const GetControlers = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM plugs_controler ORDER BY controlername ASC `, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                                 Plugs - Managment                             |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * This function will return all plugs of the database.
 * @returns {Promise}
 */
const GetPlugs = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT plugid, userid FROM plugs `, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will return all plugs of a controler from the database.
 * @param {Number} controler_id
 * @returns {Promise}
 */
 const GetPlugsByControlerID = function (controlerid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT plugid, ipaddr, allowed_state FROM plugs WHERE plugs_controlerid = $1`,[
      controlerid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

const Controler = {
  GetAll: GetControlers,
}

const Plugs = {
  GetByControlerID: GetPlugsByControlerID,
  GetAll: GetPlugs,
}

module.exports = {
  Controler,
  Plugs
}