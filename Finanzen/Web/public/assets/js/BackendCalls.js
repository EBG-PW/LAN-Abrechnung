/**
 * Will get Userdata for logged in user
 * @returns {Promise}
 */
 function getMYData() {
  return new Promise(function(resolve, reject) {
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
      if (localStorage.getItem("Token") !== null) {
          var posting = $.get(`${baseUrl}api/v1/user/user`,{
            Token: localStorage.getItem("Token")
          });
          posting.done(function(result) {
            resolve(result)
          })
          posting.fail(function(err) {
            if(err.status === 401){
              resolve(err.status)
            }else if(err.status === 500){
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
    return new Promise(function(resolve, reject) {
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        if (localStorage.getItem("Token") !== null) {
            var posting = $.get(`${baseUrl}api/v1/user/userlist`,{
              Token: localStorage.getItem("Token")
            });
            posting.done(function(result) {
              resolve(result)
            })
            posting.fail(function(err) {
              if(err.status === 401){
                resolve(err.status)
              }else if(err.status === 500){
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
  return new Promise(function(resolve, reject) {
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
      if (localStorage.getItem("Token") !== null) {
          var posting = $.get(`${baseUrl}api/v1/user/adminuserlist`,{
            Token: localStorage.getItem("Token")
          });
          posting.done(function(result) {
            resolve(result)
          })
          posting.fail(function(err) {
            if(err.status === 401){
              resolve(err.status)
            }else if(err.status === 500){
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
  return new Promise(function(resolve, reject) {
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
      if (localStorage.getItem("Token") !== null) {
          var posting = $.get(`${baseUrl}api/v1/finanzen/shoppinglist`,{
            Token: localStorage.getItem("Token")
          });
          posting.done(function(result) {
            resolve(result)
          })
          posting.fail(function(err) {
            if(err.status === 401){
              resolve(err.status)
            }else if(err.status === 500){
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
  return new Promise(function(resolve, reject) {
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
      if (localStorage.getItem("Token") !== null) {
          var posting = $.get(`${baseUrl}api/v1/finanzen/gettotalspend`,{
            Token: localStorage.getItem("Token")
          });
          posting.done(function(result) {
            resolve(result)
          })
          posting.fail(function(err) {
            if(err.status === 401){
              resolve(err.status)
            }else if(err.status === 500){
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
  return new Promise(function(resolve, reject) {
      const getUrl = window.location;
      const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
      if (localStorage.getItem("Token") !== null) {
          var posting = $.get(`${baseUrl}api/v1/strom/UserKWH`,{
            Token: localStorage.getItem("Token")
          });
          posting.done(function(result) {
            resolve(result)
          })
          posting.fail(function(err) {
            if(err.status === 401){
              resolve(err.status)
            }else if(err.status === 500){
                resolve(err.status)
            }
          });
      }
  });
}
