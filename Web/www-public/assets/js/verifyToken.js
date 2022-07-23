/**
 * This will check the current saved Token (if exists) if its valid
 * @returns {Promise}
 */
function CheckTokenValidity(){
  return new Promise(function(resolve, reject) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
    if (localStorage.getItem("Token") !== null) {
      //Token was found, now validate it and if valid forward to /public
      const posting = $.ajax({
        url: `${baseUrl}api/v1/check`,
        type: "POST",
        contentType: "application/json; charset=utf-8",
        headers: { Authorization: "Bearer " + localStorage.getItem("Token") }
      });
      posting.done(function(result) {
        resolve(result.TokenData)
      })
      posting.fail(function(err) {
        if(err.status === 401){
          window.location.replace(`${baseUrl}api/v1/login/login`);
        }
      });
    }else{
      window.location.replace(`${baseUrl}api/v1/login/login`);
    }
  });
}

/**
 * This will wirte all Token data to localstorrage to be used in all funktions
 * @param {object} TokenData Token Object
 */
function writeTokenDataToLocalStorrage(TokenData){
  localStorage.setItem('Username', TokenData.username);
  localStorage.setItem('UserID', TokenData.userid);
  localStorage.setItem('ip', TokenData.ip);
  localStorage.setItem('Browser', TokenData.browser);
  localStorage.setItem('Admin', TokenData.admin);
  localStorage.setItem('Time', TokenData.time);
  localStorage.setItem('Language', TokenData.lang);
}