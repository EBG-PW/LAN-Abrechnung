const pg = require('pg');
const { log } = require('../../lib/logger');

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

pool.query(`CREATE TABLE IF NOT EXISTS guests (
    userid bigint PRIMARY KEY,
    hauptgast_userid bigint,
    username text,
    passwort text,
    pc boolean DEFAULT False,
    displays_count smallint DEFAULT 1,
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
  if (err) { logger('error', `Table-gen: Error mshc_config ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS tg_users (
    userid bigint PRIMARY KEY,
    language text,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`, (err, result) => {
  if (err) { log.error(`DB Create tg_users: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs (
  plugid serial,
  ipaddr inet,
  userid bigint,
  state boolean DEFAULT False,
  allowed_state boolean DEFAULT False,
  energy_now double precision,
  voltage_now double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid),
  CONSTRAINT userid_unique UNIQUE (userid),
  CONSTRAINT ipaddr_unique UNIQUE (ipaddr),
  CONSTRAINT plugid_fk FOREIGN KEY(userid)
  REFERENCES guests(userid)
  ON UPDATE CASCADE
  ON DELETE CASCADE
  NOT VALID)`, (err, result) => {
  if (err) { log.error(`DB Create plugs: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS plugs_history (
  plugid smallint,
  energy double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid,time),
  CONSTRAINT plugid_fk FOREIGN KEY(plugid) REFERENCES plugs(plugid))`, (err, result) => {
  if (err) { log.error(`DB Create plugs_history: ${err}`) }
});

pool.query(`CREATE TABLE IF NOT EXISTS power_history (
  plugid smallint,
  energy_now double precision,
  voltage_now double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (plugid,time),
  CONSTRAINT plugid_fk FOREIGN KEY(plugid) REFERENCES plugs(plugid))`, (err, result) => {
  if (err) { log.error(`DB Create power_history: ${err}`) }
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
  byer_userid text,
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
    pool.query('SELECT guests.userid, guests.username, guests.passwort, guests.pc, guests.displays_count, guests.network_cable, guests.vr, guests.expected_arrival, guests.expected_departure, guests.accepted_rules, guests.accepted_legal, guests.payed, guests.pyed_id, guests.admin, guests.vaccinated, guests.time, guests.payed_ammount, guests.lang, plugs.allowed_state FROM guests LEFT JOIN plugs ON guests.userid = plugs.userid', (err, result) => {
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
 * @returns {Promise}
 */
let GetAllBoughItemsByUser = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, shopinglist.userid, shopinglist.produktname, shopinglist.produktcompany, shopinglist.price, shopinglist.bought, shopinglist.byer_userid, shopinglist.transaction_id FROM shopinglist INNER JOIN guests ON shopinglist.userid = guests.userid WHERE shopinglist.userid = '${userid}' ORDER BY shopinglist.time DESC`, (err, result) => {
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

/**
 * This function is used to get the KWH used by a user
 * @param {number} userid
 * @returns {Promise}
 */
let GetKWHbyUserID = function (userid) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT Distinct plugid,(first_value(energy) over (partition by plugid order by time desc) - first_value(energy) over (partition by plugid order by time asc) ) as diff from plugs_history WHERE plugid = (SELECT plugid FROM plugs WHERE userid = '${userid}')`, (err, result) => {
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
 * @param {boolean} status
 * @returns {Promise}
 */
let GetOrderByIDList = function (OrderID, status) {
  return new Promise(function (resolve, reject) {
    pool.query(`SELECT guests.username, bestellungen.userid, bestellungen.artikel, bestellungen.amount, bestellungen.price, bestellungen.orderid, bestellungen.orderkey, bestellungen.status FROM bestellungen INNER JOIN guests ON bestellungen.userid = guests.userid WHERE orderid = $1 AND status = $2`, [
      OrderID, status
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

let get = {
  Guests: {
    All: GetGuests,
    AllSave: GetGuestsSave,
    Admins: ListAllAdmin,
    ByID: GetGuestsByID,
    Check: {
      ByID: CheckGuestByID,
      Admin: CheckIfAdminbyID,
      Rules: CheckGuestRulesByID,
      Reg: RegCheckGuestByID,
      Payed: PayedCheckGuestByID
    }
  },
  Permissions: {
    Get: GetPermissionFromUser,
  },
  RegToken: {
    ByToken: GetRegTokenByToken
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
    updatelang: UpdateUserLang
  },
  Permissions: {
    Add: AddPermissionToUser,
    Update: UpdatePermissionFromUser,
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
    toggle_allowed_state: PlugsToggleAllowedState
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