const pg = require('pg');
const { log } = require('../../lib/logger');
const permission_groups = require('../../../config/permission_groups');

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

// payed is used in 2 ways, for main guest its if he has payed. If subguest, its if he is allowed to pay (Buffet)
pool.query(`CREATE TABLE IF NOT EXISTS guests (
    userid bigint PRIMARY KEY,
    hauptgast_userid bigint,
    username text UNIQUE,
    passwort text,
    pc boolean DEFAULT False,
    displays_count smallint DEFAULT 0,
    network_cable boolean DEFAULT False,
    vr boolean DEFAULT False,
    expected_arrival timestamp with time zone,
    expected_departure timestamp with time zone,
    accepted_rules timestamp with time zone,
    accepted_legal timestamp with time zone,
    power_plugid smallint,
    payed boolean DEFAULT False,
    pyed_id text,
    payed_ammount bigint,
    lang text,
    admin boolean DEFAULT False,
    permission_group text,
    vaccinated text,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create guests: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS guests_permissions (
  userid bigint,
  permission text,
  read boolean,
  write boolean,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid, permission))`, (err, result) => {
  if (err) { log.error('error', `Table-gen: Error mshc_config ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS tg_users (
    userid bigint PRIMARY KEY,
    language text,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create tg_users: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs (
  plugid serial,
  plugs_controlerid serial,
  ipaddr inet,
  userid bigint UNIQUE references guests(userid),
  state boolean DEFAULT False,
  allowed_state boolean DEFAULT False,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid),
  CONSTRAINT userid_unique UNIQUE (userid),
  CONSTRAINT ipaddr_unique UNIQUE (ipaddr))`, (err, result) => {
  if (err) { log.error(`DB Create plugs: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs_power (
  plugid serial,
  power_start real,
  power_end real,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid))`, (err, result) => {
  if (err) { log.error(`DB Create plugs_power: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs_controler (
  controlerid serial,
  controlername text,
  token text,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (controlername))`, (err, result) => {
  if (err) { log.error(`DB Create plugs_controler: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS regtoken (
  userid bigint,
  username text,
  token text PRIMARY KEY,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create regtoken: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS webtoken (
  userid bigint,
  username text,
  ip INET,
  browser text,
  token text PRIMARY KEY,
  admin boolean DEFAULT False,
  lang text,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create webtoken: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS products (
  produktname text PRIMARY KEY,
  produktcompany text,
  price integer,
  amount integer,
  bought integer DEFAULT 0,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create products: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS shopinglist (
  userid bigint,
  byer_userid bigint,
  produktname text,
  produktcompany text,
  price integer,
  bought integer,
  transaction_id text,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid,time))`, (err, result) => {
  if (err) { log.error(`DB Create shopinglist: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS bestellung (
  url text,
  orderid text,
  timeuntil timestamp with time zone,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (url,time))`, (err, result) => {
  if (err) { log.error(`DB Create bestellung: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS bestellungen (
  userid bigint,
  artikel text,
  amount integer,
  price integer,
  orderid text,
  orderkey text,
  status boolean DEFAULT False,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userid,time))`, (err, result) => {
  if (err) { log.error(`DB Create bestellungen: ${err}`) }
});

/**
 * This function will return all guests
 * @returns Array
 */
let GetGuests = function () {
  return new Promise(function (resolve, reject) {
    pool.query('SELECT guests.userid, hauptgast_userid, guests.username, guests.passwort, guests.pc, guests.displays_count, guests.network_cable, guests.vr, guests.expected_arrival, guests.expected_departure, guests.accepted_rules, guests.accepted_legal, guests.payed, guests.pyed_id, guests.admin, guests.permission_group, guests.vaccinated, guests.time, guests.payed_ammount, guests.lang, plugs.allowed_state FROM guests LEFT JOIN plugs ON guests.userid = plugs.userid', (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will return all guests without sectet stuff
 * @returns Array
 */
let GetGuestsSave = function () {
  return new Promise(function (resolve, reject) {
    pool.query('SELECT userid, username, pc, displays_count, network_cable, vr, expected_arrival, expected_departure, lang FROM guests', (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will return a guest by userid
 * @param {number} user_id
 * @returns {Object}
 */
let GetGuestsByID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will check if a user exists
 * @param {number} user_id
 * @returns {boolean}
 */
let CheckGuestByID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      if (result.rows.length <= 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * This function will return hauptgast id & permission_group if guest is a subguest
 * @param {Number} user_id 
 * @returns 
 */
let GetHauptGuestofguest = function (user_id) {
  return new Promise(function (resolve, reject) {
    // Is das a gute query? :D
    // > VERMUTLICH NED! looooool
    pool.query(`SELECT permission_group, (SELECT hauptgast_userid FROM guests WHERE userid = '${user_id}') FROM guests WHERE userid = (SELECT hauptgast_userid FROM guests WHERE userid = '${user_id}')`, (err, result) => {
      if (err) { reject(err) }
      if (result.rows.length === 1) {
        resolve(result.rows[0]);
      } else {
        resolve(false);
      }
    });
  });
}



/**
 * This function will return all guests by hauptgast
 * @param {Number} user_id 
 * @returns 
 */
let GetSubGuestFromHauptGuest = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT username, lang, userid, expected_arrival, expected_departure, payed, payed_ammount FROM guests WHERE hauptgast_userid = '${user_id}' ORDER BY username ASC`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will check if a user finished registration
 * @param {number} user_id
 * @returns {boolean}
 */
let RegCheckGuestByID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      if (result.rows[0].pyed_id !== null) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * This function will check if a user has payed
 * @param {number} user_id
 * @returns {boolean}
 */
let PayedCheckGuestByID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows[0].payed);
    });
  });
}

/**
 * This function will check if a user had accepted rules & legal
 * @param {number} user_id
 * @returns {boolean}
 */
let CheckGuestRulesByID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      if (typeof result.rows[0].accepted_rules !== 'undefined' && typeof result.rows[0].accepted_legal !== 'undefined') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * This function will check if a user is admin
 * @param {number} user_id
 * @returns {boolean}
 */
let CheckIfAdminbyID = function (user_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT admin FROM guests WHERE userid = '${user_id}'`, (err, result) => {
      if (err) { reject(err) }
      if (result.rows.length === 1) {
        if (result.rows[0].admin === true) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

/**
 * This function will return a list of Admins
 * @returns {Object}
 */
let ListAllAdmin = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM guests WHERE admin = 'true'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will return a list of main guests
 * @returns {Object}
 */
let ListHauptGuest = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT userid, username, payed_ammount FROM guests WHERE hauptgast_userid IS NULL AND payed = true`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
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
let UpdateCollumByID = function (User_id, collum, value) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE guests SET ${collum} = $1 WHERE userid = $2`, [
      value, User_id
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will update a users language
 * @param {String} lang
 * @param {Number} userid
 * @returns {Promise}
 */
let UpdateUserLang = function (lang, userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE guests SET lang = $1 WHERE userid = $2`, [
      lang, userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result)
    });
  });
}

/**
 * This function will write new user to DB
 * @param {number} User_id
 * @param {String} username
 * @param {string} lang
 * @returns {Promise}
 */
let WriteNewUser = function (User_id, username, lang) {
  return new Promise(function (resolve, reject) {
    pool.query('INSERT INTO guests (userid, username, lang) VALUES ($1,$2,$3) ON CONFLICT (userid) DO UPDATE SET username=$2', [
      User_id, username, lang
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will write new sub user to DB
 * @param {number} User_id
 * @param {number} HauptGuest_id
 * @param {String} username
 * @param {string} lang
 * @returns {Promise}
 */
let WriteNewSubUser = function (User_id, HauptGuest_id, username, lang) {
  return new Promise(function (resolve, reject) {
    pool.query('INSERT INTO guests (userid, hauptgast_userid, username, lang) VALUES ($1,$2,$3,$4) ON CONFLICT (userid) DO UPDATE SET username=$3', [
      User_id, HauptGuest_id, username, lang
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will write a new token into regtoken db
 * @param {number} User_id
 * @param {String} username
 * @param {String} token
 * @returns {Promise}
 */
let WriteNewRegToken = function (User_id, username, token) {
  return new Promise(function (resolve, reject) {
    pool.query('INSERT INTO regtoken (userid, username, token) VALUES ($1,$2,$3)', [
      User_id, username, token
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get the data of a token
 * @param {String} Token
 * @returns {Promise}
 */
let GetRegTokenByToken = function (Token) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM regtoken WHERE token = '${Token}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will delete a token
 * @param {String} Token
 * @returns {Promise}
 */
let DelRegTokenByToken = function (Token) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM regtoken WHERE token = '${Token}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to send messages to the TelegramApp
 * @param {String} id
 * @param {String} targetapp
 * @param {object} message
 * @returns {Promise}
 */
let PostNewMessage = function (targetapp, id, message) {
  return new Promise(function (resolve, reject) {
    pool.query('INSERT INTO innersync (targetapp, id, message, chatid, type) VALUES ($1,$2,$3,$4,$5)', [
      targetapp, id, message.text, message.chatid, message.type
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to delete the message send command
 * @param {String} ID
 * @returns {Promise}
 */
let DelNewMessage = function (ID) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM innersync WHERE id = '${ID}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get all messages to prosses
 * @returns {Promise}
 */
let GetNewMessages = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM innersync`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add or update a product
 * @param {object} Product
 * @returns {Promise}
 */
let AddProduct = function (Product) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO products(produktname, produktcompany, price, amount) VALUES ($1,$2,$3,$4) ON CONFLICT (produktname) DO UPDATE SET produktcompany=$2, price=$3, amount=$4, time=now()`, [
      Product.Name, Product.Hersteller, Product.Preis, Product.Menge
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will query products with the like parameter
 * @param {string} query
 * @returns {Promise}
 */
let LookLikeProduct = function (query) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM products WHERE LOWER(produktname) LIKE LOWER('%${query}%')`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will return all about a product
 * @param {string} produktname
 * @returns {Promise}
 */
let GetProduct = function (produktname) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM products WHERE produktname = '${produktname}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will return all products
 * @param {string} cull
 * @returns {Promise}
 */
let GetAllProduct = function (cull) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM products ORDER BY ${cull}`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will write a collum and the value of that collum
 * @param {string} produktname
 * @param {number} old_bought
 * @param {number} new_bought
 * @returns {Promise}
 */
let UpdateProductByName = function (produktname, old_bought, new_bought) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE products SET bought = $1 WHERE produktname = $2 AND bought = $3`, [
      new_bought, produktname, old_bought
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get all bough items of a user
 * @param {number} userid
 * @param {string} collum
 * @returns {Promise}
 */
let GetAllBoughItemsByUser = function (userid, collum) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, shopinglist.userid, shopinglist.produktname, shopinglist.produktcompany, shopinglist.price, shopinglist.bought, shopinglist.byer_userid, shopinglist.transaction_id FROM shopinglist INNER JOIN guests ON shopinglist.byer_userid = guests.userid WHERE shopinglist.${collum} = '${userid}' ORDER BY shopinglist.time DESC`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get all bough items of a user
 * @param {number} userid 
 * @returns 
 */
let GetTotalShoppingListSpendByUser = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT SUM(price*bought) FROM shopinglist WHERE byer_userid = $1  AND produktcompany != 'Order'`, [userid], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add a bought product to shopinglist
 * @param {number} userid
 * @param {string} byer_userid
 * @param {object} product
 * @param {string} transaction_id
 * @returns {Promise}
 */
let NewItemBought = function (userid, byer_userid, product, transaction_id) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO shopinglist(userid, byer_userid, produktname, produktcompany, price, bought, transaction_id) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      userid, byer_userid, product.produktname, product.produktcompany, product.price, product.bought, transaction_id
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add a bought product to webtokens
 * @param {number} userid
 * @param {string} username
 * @param {string} ip
 * @param {string} browser
 * @param {string} token
 * @param {boolean} admin
 * @param {string} lang
 * @returns {Promise}
 */
let AddWebToken = function (userid, username, ip, browser, token, admin, lang) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO webtoken(userid, username, ip, browser, token, admin, lang) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      userid, username, ip, browser, token, admin, lang
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to get a token from the DB
 * @param {String} token
 * @returns {Promise}
 */
let GetWebToken = function (token) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM webtoken WHERE token = '${token}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to delete a webtoken
 * @param {String} token
 * @returns {Promise}
 */
let DelWebToken = function (token) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM webtoken WHERE token = '${token}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will update a users language in webtokens
 * @param {String} lang
 * @param {Number} userid
 * @returns {Promise}
 */
let UpdateUserLangWebToken = function (lang, userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE webtoken SET lang = $1 WHERE userid = $2`, [
      lang, userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result)
    });
  });
}

/**
 * This function is used toggle the allowed state in the plugs table
 * @param {number} userid
 * @returns {Promise}
 */
let PlugsToggleAllowedState = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE plugs SET allowed_state = NOT allowed_state WHERE userid = '${userid}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

let ToggleSubUserPayedAllowedState = function (hauptgast_userid, userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE guests SET payed = NOT payed WHERE hauptgast_userid = $1 AND userid = $2`,[
      hauptgast_userid, userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

let SetSubUserPayedAmount = function (hauptgast_userid, userid, payed_amount) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE guests SET payed_ammount = $1 WHERE hauptgast_userid = $2 AND userid = $3`,[
      payed_amount, hauptgast_userid, userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to get the KWH used by a user
 * @param {number} userid
 * @returns {Promise}
 */
let GetKWHbyUserID = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT plugs_power.plugid, plugs_power.power_start, COALESCE(plugs_power.power_end,0) - COALESCE(plugs_power.power_start,0) AS power_used FROM plugs_power INNER JOIN plugs ON plugs_power.plugid = plugs.plugid WHERE plugs.userid = $1`, [
      userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add a new order
 * @param {string} url
 * @param {string} orderid
 * @param {string} timeuntil
 * @returns {Promise}
 */
let AddOrder = function (url, orderid, timeuntil) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO bestellung(url, orderid, timeuntil) VALUES ($1,$2,$3)`, [
      url, orderid, timeuntil
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add a new orderd article
 * @param {number} userid
 * @param {string} artikel
 * @param {number} amount
 * @param {number} price
 * @param {string} orderid
 * @param {string} orderkey
 * @returns {Promise}
 */
let AddOrderArticle = function (userid, artikel, amount, price, orderid, orderkey) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO bestellungen(userid, artikel, amount, price, orderid, orderkey) VALUES ($1,$2,$3,$4,$5,$6)`, [
      userid, artikel, amount, price, orderid, orderkey
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get Order Data by ID 
 * @param {string} OrderID
 * @returns {Promise}
 */
let GetOrderByID = function (OrderID) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM bestellung WHERE orderid = $1`, [
      OrderID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get Order Data by ID 
 * @param {string} OrderID
 * @returns {Promise}
 */
let GetOrderByIDList = function (OrderID) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, bestellungen.userid, bestellungen.artikel, bestellungen.amount, bestellungen.price, bestellungen.orderid, bestellungen.orderkey, bestellungen.status FROM bestellungen INNER JOIN guests ON bestellungen.userid = guests.userid WHERE orderid = $1`, [
      OrderID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}



/**
 * This function will get Order Data by ID and user
 * @param {string} OrderID
 * @param {number} UserID
 * @returns {Promise}
 */
let GetOrderByIDForUser = function (OrderID, UserID) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT * FROM bestellung WHERE orderid = $1 AND userid = $2`, [
      OrderID, UserID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will delete Order Data by Order_key
 * @param {string} Key
 * @param {number} UserID
 * @returns {Promise}
 */
let DelOrderByKey = function (Key, UserID) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM bestellungen WHERE orderkey = $1 AND userid = $2`, [
      Key, UserID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get Order Data by Order_key
 * @param {string} Key
 * @returns {Promise}
 */
let GetOrderByKey = function (Key) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, bestellungen.userid, bestellungen.artikel, bestellungen.amount, bestellungen.price, bestellungen.orderid, bestellungen.orderkey, bestellungen.status FROM bestellungen INNER JOIN guests ON bestellungen.userid = guests.userid WHERE orderkey = $1`, [
      Key
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get Order Data by Order_key and UserID
 * @param {string} OrderID
 * @param {number} UserID
 * @returns {Promise}
 */
let GetOrderByOrderIDandUserID = function (OrderID, UserID) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, bestellungen.userid, bestellungen.artikel, bestellungen.amount, bestellungen.price, bestellungen.orderid, bestellungen.orderkey, bestellungen.status FROM bestellungen INNER JOIN guests ON bestellungen.userid = guests.userid WHERE bestellungen.orderid = $1 AND bestellungen.userid = $2`, [
      OrderID, UserID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}


/**
 * This function is used toggle the order state by key
 * @param {string} Key
 * @returns {Promise}
 */
let OrderToggleState = function (Key) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE bestellungen SET status = NOT status WHERE orderkey = '${Key}'`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used toggle the order state by key
 * @param {string} Key
 * @param {boolean} State
 * @returns {Promise}
 */
let OrderSwitchState = function (Key, State) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE bestellungen SET status = $1 WHERE orderkey = $2`, [
      State, Key
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                              Plugs - Managment                                |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * This function will add or update a plugcontroler
 * @param {String} controlername
 * @param {String} token
 * @returns {Promise}
 */
let AddPlugControler = function (controlername, token) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO plugs_controler(controlername, token) VALUES ($1,$2) ON CONFLICT (controlername) DO UPDATE SET token=$2, time=now()`, [
      controlername, token
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will add or update a plug
 * @param {String} IP
 * @param {String} plugs_controler
 * @returns {Promise}
 */
let AddPlug = function (IP, plugs_controler) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO plugs(ipaddr, plugs_controlerid) VALUES ($1, $2) ON CONFLICT (ipaddr) DO UPDATE SET ipaddr=$1, time=now()`, [
      IP, plugs_controler
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get all plugs from the database
 * @returns {Promise}
 */
let GetPlugs = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT plugs.plugid, plugs.ipaddr, plugs_controler.controlername, plugs_controler.token, plugs.state, plugs.allowed_state, plugs.userid, COALESCE(plugs_power.power_end,0) - COALESCE(plugs_power.power_start,0) AS power_used, guests.username FROM plugs 
                INNER JOIN plugs_controler ON plugs_controlerid = controlerid 
                LEFT JOIN guests ON plugs.userid = guests.userid 
                LEFT JOIN plugs_power ON plugs.plugid = plugs_power.plugid
                ORDER BY plugid ASC`, (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/**
 * This function will link a plug to a user based on username
 * @param {String} username
 * @param {Number} plugid
 * @returns {Promise}
 */
let SetUserIDForPlug = function (PlugID, UserName) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE plugs SET userid = CASE
                WHEN EXISTS (SELECT userid FROM guests WHERE username = $1 AND hauptgast_userid IS NULL) 
                THEN (SELECT userid FROM guests WHERE username = $1)
                ELSE 0
                END WHERE plugid = $2`, [
      UserName, PlugID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will unlink a plug from a user
 * @param {Number} plugid
 * @returns {Promise}
 */
let DelUserIDForPlug = function (PlugID) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE plugs SET userid = null WHERE plugid = $1`, [
      PlugID
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will get all transactions from a user and groups them by article
 * @param {Number} userid
 * @returns {Promise}
 */
let GetGuestShoppinglistGrouped = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT produktname, SUM(price) AS price_sum, SUM(bought) AS bough, (SUM(price)/SUM(bought)) AS price_per_item 
    FROM shopinglist 
    WHERE userid = $1
    GROUP BY produktname`, [
      userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result.rows);
    });
  });
}

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                             Inventory - Managment                             |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * Returns all products from products table as array
 * @returns {Promise}
 */
let GetInvetory = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT *, (bought*10/amount) AS Factor FROM products ORDER BY Factor DESC`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * Returns all Donations from the ordertable as array
 * @returns {Promise}
 */
let GetDonation = function () {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, SUM(bought*price) AS total_donation FROM shopinglist INNER JOIN guests ON shopinglist.userid = guests.userid WHERE produktname = 'Spende' GROUP BY guests.username ORDER BY SUM(bought*price) DESC`, (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                            TG_Language - Managment                            |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * This function is used to add a new user or edit an existing one to TG language DB
 * @param {number} UserID
 * @param {string} Language
 * @returns {Promise}
 */
let SetTGLanguage = function (UserID, Language) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO tg_users(userid, language) VALUES ($1,$2) ON CONFLICT (userid) DO UPDATE SET language = $2`, [
      UserID, Language
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to get the language of a user from TG language DB
 * @param {number} UserID
 * @returns {Promise}
 */
let GetTGLanguage = function (UserID) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT language FROM tg_users WHERE userid = $1`, [
      UserID
    ], (err, result) => {
      if (err) { reject(err) }
      if (result.rows.length > 0) {
        resolve(result.rows[0].language);
      } else {
        resolve(process.env.Fallback_Language || 'en');
      }
    });
  });
}

/*
    |-------------------------------------------------------------------------------|
    |                                                                               |
    |                            Permissions - Managment                            |
    |                                                                               |
    |-------------------------------------------------------------------------------|
*/

/**
 * This function will add a given permission to a user
 * @param {Number} userid
 * @param {string} permission
 * @param {boolean} read
 * @param {boolean} write
 * @returns {Promise}
 */
const AddPermissionToUser = function (userid, permission, read, write) {
  return new Promise(function (resolve, reject) {
    pool.query(`INSERT INTO guests_permissions(userid, permission, read, write) VALUES ($1,$2,$3,$4)`, [
      userid, permission, read, write
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to get a list of permissions of a user
 * @param {Number} userid
 * @returns {Promise}
 */
const GetPermissionFromUser = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT permission, read, write FROM guests_permissions WHERE userid = $1`, [
      userid
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to remove a permission from a user
 * @param {Number} userid
 * @param {String} permission
 * @returns {Promise}
 */
const DelPermissionFromUser = function (userid, permission) {
  return new Promise(function (resolve, reject) {
    pool.query(`DELETE FROM guests_permissions WHERE userid = $1 AND permission = $2`, [
      userid, permission
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function is used to update r/w of a permission of a user
 * @param {Number} userid
 * @param {String} permission
 * @param {boolean} read
 * @param {boolean} write
 * @returns {Promise}
 */
const UpdatePermissionFromUser = function (userid, permission, read, write) {
  return new Promise(function (resolve, reject) {
    pool.query(`UPDATE mshc_user_permissions SET read = $3, write = $4 WHERE userid = $1 AND permission = $2`, [
      userid, permission, read, write
    ], (err, result) => {
      if (err) { reject(err) }
      resolve(result);
    });
  });
}

/**
 * This function will set a given permission to a user and remove all other permissions
 * @param {Number} userid
 * @param {string} permission_group
 * @returns {Promise}
 */
const SetPermissionGroupToUser = function (userid, permission_group) {
  return new Promise(function (resolve, reject) {
    if (permission_group in permission_groups) {
      let result_list = [];
      pool.query(`DELETE FROM guests_permissions WHERE userid = $1`, [
        userid
      ], (err, result) => {
        if (err) { reject(err) }
        for (const permission in permission_groups[permission_group].permissions) {
          pool.query(`INSERT INTO guests_permissions(userid, permission, read, write) VALUES ($1,$2,$3,$4)`, [
            userid, permission, permission_groups[permission_group].permissions[permission].read, permission_groups[permission_group].permissions[permission].write
          ], (err, result) => {
            if (err) { reject(err) }
            result_list.push(result);
          });
        };
        pool.query(`UPDATE guests SET permission_group = $2 WHERE userid = $1`, [
          userid, permission_group
        ], (err, result) => {
          if (err) { reject(err) }
          result_list.push(result);
          resolve(result_list);
        });
      });
    } else {
      reject(new Error('Permission group not found'));
    }
  });
}

let get = {
  Guests: {
    All: GetGuests,
    AllSave: GetGuestsSave,
    Admins: ListAllAdmin,
    GetMySubguests: GetSubGuestFromHauptGuest,
    ShopingSpend: GetTotalShoppingListSpendByUser,
    ByID: GetGuestsByID,
    Main: ListHauptGuest,
    Check: {
      ByID: CheckGuestByID,
      Admin: CheckIfAdminbyID,
      Rules: CheckGuestRulesByID,
      Reg: RegCheckGuestByID,
      Payed: PayedCheckGuestByID,
      HauptGuest: GetHauptGuestofguest
    }
  },
  Permissions: {
    Get: GetPermissionFromUser,
  },
  RegToken: {
    ByToken: GetRegTokenByToken
  },
  Inventory: {
    GetAll: GetInvetory,
    GetDonations: GetDonation,
    GetGroupedTransactions: GetGuestShoppinglistGrouped
  },
  Products: {
    LikeGet: LookLikeProduct,
    Get: GetProduct,
    GetAll: GetAllProduct
  },
  shopinglist: {
    Get: GetAllBoughItemsByUser
  },
  webtokens: {
    Get: GetWebToken
  },
  plugs: {
    GetAll: GetPlugs,
    power: {
      kwh: GetKWHbyUserID
    }
  },
  order: {
    GetOrder: GetOrderByID,
    GetOrderList: GetOrderByIDList,
    GetOderForUser: GetOrderByIDForUser,
    GetByKey: GetOrderByKey,
    GetOrderByOrderID: GetOrderByOrderIDandUserID
  },
  tglang: {
    Get: GetTGLanguage,
  }
}

let write = {
  Guests: {
    UpdateCollumByID: UpdateCollumByID,
    NewUser: WriteNewUser,
    NewSubUser: WriteNewSubUser,
    updatelang: UpdateUserLang,
    ToggleSubUserPayedAllowedState: ToggleSubUserPayedAllowedState,
    SetSubUserPayedAmount: SetSubUserPayedAmount,
  },
  Permissions: {
    Add: AddPermissionToUser,
    Update: UpdatePermissionFromUser,
    SetGroup: SetPermissionGroupToUser
  },
  RegToken: {
    NewToken: WriteNewRegToken
  },
  Products: {
    Add: AddProduct,
    UpdateBought: UpdateProductByName
  },
  shopinglist: {
    Buy: NewItemBought
  },
  webtoken: {
    Add: AddWebToken,
    UpdateLang: UpdateUserLangWebToken
  },
  plugs: {
    toggle_allowed_state: PlugsToggleAllowedState,
    addControler: AddPlugControler,
    addPlug: AddPlug,
    addUserToPlug: SetUserIDForPlug,
    delUserToPlug: DelUserIDForPlug
  },
  order: {
    AddOrder: AddOrder,
    AddOrderArticle: AddOrderArticle,
    ToggleState: OrderToggleState,
    SwitchState: OrderSwitchState
  },
  tglang: {
    Set: SetTGLanguage
  }
}

let del = {
  Permissions: {
    FromUser: DelPermissionFromUser
  },
  RegToken: {
    DeleteToken: DelRegTokenByToken
  },
  webtoken: {
    Del: DelWebToken
  },
  order: {
    ByKey: DelOrderByKey
  }
}

let message = {
  PostNew: PostNewMessage,
  Delete: DelNewMessage,
  GetAll: GetNewMessages
}

module.exports = {
  get,
  write,
  del,
  message
};