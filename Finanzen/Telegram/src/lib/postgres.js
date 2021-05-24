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
    vaccinated text,
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
 * @returns {Object}}
 */
 let GetGuestsByID = function(user_id) {
    return new Promise(function(resolve, reject) {
      pool.query(`SELECT * FROM guests WHERE userid = ${user_id}`, (err, result) => {
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
      pool.query(`SELECT * FROM guests WHERE userid = ${user_id}`, (err, result) => {
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
 let UpdateCollumByID = function(User_id, collum, value) {
    return new Promise(function(resolve, reject) {
      pool.query(`UPDATE guests SET ${collum} = $1 WHERE userid = $2`,[
      value, User_id
      ], (err, result) => {
        if (err) {reject(err)}
        resolve(result)
      });
    });
  }

/**
 * This function will write new user to DB
 * @param {number} User_id
 * @param {String} username
 * @returns {Promise}
 */
 let WriteNewUser = function(User_id, username) {
  return new Promise(function(resolve, reject) {
    pool.query('INSERT INTO guests (userid, username) VALUES ($1,$2) ON CONFLICT (userid) DO UPDATE SET username=$2',[
      User_id, username
    ], (err, result) => {
      if (err) {reject(err)}
      resolve(result)
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
        UpdateCollumByID: UpdateCollumByID,
        NewUser: WriteNewUser
    }
}

module.exports = {
    get,
    write
};