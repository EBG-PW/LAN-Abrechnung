const { func } = require("joi");

/**
 * Will get Userdata for logged in user
 * @returns {Promise}
 */
function getMYData() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/user/user`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get Userdata from the backend
 * @returns {Promise}
 */
function getUserData() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/user/userlist`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get Userdata from the backend
 * @returns {Promise}
 */
function getAdminUserData() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/user/adminuserlist`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get PermisionGroups from the backend
 * @returns {Promise}
 */
 function getPermisionGroup() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/user/PermisionGroup`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get UserOrders from the backend
 * @param {string} OrderID
 * @returns {Promise}
 */
function getAdminUserOrderData(OrderID) {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/bestellungen/getUserOrders`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
        data: { orderid: OrderID }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get UserOrdersForSelfUser from the backend
 * @param {string} OrderID
 * @returns {Promise}
 */
function getUserOrderData(OrderID) {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/bestellungen/getUserOrdersForToken`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
        data: { orderid: OrderID }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get shoppinghistory of the user
 * @returns {Promise}
 */
function GetShoppingList() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/finanzen/shoppinglist`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get total spend of user
 * @returns {Promise}
 */
function GetTotalSpend() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/finanzen/gettotalspend`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

/**
 * Will get total kwh of a user
 * @returns {Promise}
 */
function GeTotalKWH() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/strom/UserKWH`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

function GetInventory() {
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/inventory/inventory`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

function GetDonations(){
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/inventory/donations`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

function GetPlugsTable(){
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/strom/allPlugs`,
        type: "GET",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function (result) {
        resolve(result)
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}

function change_plug_userid(plugid, id){
  return new Promise(function (resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      const posting = $.ajax({
        url: `${baseUrl}api/v1/strom/setPlugUser`,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") },
        data: JSON.stringify({plugid: plugid, username: $("#"+id).val() || "null"})
      });
      posting.done(function (result) {
        resolve(result)
        PlugsManagmentTabelle()
      })
      posting.fail(function (err) {
        if (err.status === 401) {
          resolve(err.status)
        } else if (err.status === 500) {
          resolve(err.status)
        }
      });
    }
  });
}