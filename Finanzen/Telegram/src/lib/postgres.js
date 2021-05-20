const pg = require('pg');
const util = require('util')

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

pool.query(`CREATE TABLE IF NOT EXISTS guests (
    userid bigint PRIMARY KEY,
    username text,
    passwort text,
    pc boolean DEFAULT False,
    displays_count smallint DEFAULT 1,
    network_cable boolean DEFAULT False,
    vr boolean DEFAULT False,
    expected_arrival timestamp with time zone,
    expected_departure timestamp with time zone,
    payed boolean DEFAULT False,
    pyed_id text,
    admin boolean DEFAULT False,
    vaccinated boolean NOT NULL,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
    if (err) {console.log(err)}
});

/**
 * This function will return all guests
 * @returns Array
 */
 let GetGuests = function() {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM guests', (err, result) => {
        if (err) {reject(err)}
        resolve(result.rows)
      });
    });
  }

/**
 * This function will return a guest by userid
 * @param {number} user_id
 * @returns Array
 */
 let GetGuestsByID = function(user_id) {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM guests WHERE userid = $1'[
        user_id
      ], (err, result) => {
        if (err) {reject(err)}
        resolve(result.rows)
      });
    });
  }

/**
 * This function will check if a user exists
 * @param {number} user_id
 * @returns {boolean}
 */
 let CheckGuestByID = function(user_id) {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM guests WHERE userid = $1'[
        user_id
      ], (err, result) => {
        if (err) {reject(err)}
        if(result.rows.length <= 0){
            resolve(false)
        }else[
            resovle(true)
        ]
      });
    });
  }

/**
 * This function will write a collum and the value of that collum
 * @param {number} User_id
 * @param {String} collum
 * @param {any} value
 * @returns {Promise}
 */
 let WriteCollumByID = function(User_id, collum, value) {
    return new Promise(function(resolve, reject) {
      Data.TeamStats.TeamStatsByProjects[0].Project.map(project => {
        pool.query('INSERT INTO guests ($1) VALUES ($2) WHERE userid = $3',[
            collum, value, User_id
        ], (err, result) => {
          if (err) {reject(err)}
          resolve(result)
        });
      });
    });
  }

let get = {
    Guests: {
        All: GetGuests,
        ByID: GetGuestsByID,
        Check: {
            ByID: CheckGuestByID
        }
    }
}

let write = {
    Guests: {
        CollumByID: WriteCollumByID
    }
}

module.exports = {
    get,
    write
};