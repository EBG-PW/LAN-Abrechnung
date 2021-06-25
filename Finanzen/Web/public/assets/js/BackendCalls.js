/**
 * Will get Userdata from the backend
 * @returns {Promise}
 */
 function getUserData() {
    return new Promise(function(resolve, reject) {
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        if (localStorage.getItem("Token") !== null) {
            var posting = $.post(`${baseUrl}api/v1/user/getuser`,{
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