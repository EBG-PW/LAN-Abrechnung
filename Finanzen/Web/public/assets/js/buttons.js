/**
 * Will send a logout request to destroy the current token
 * @returns {Promise}
 */
 function logout() {
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        if (localStorage.getItem("Token") !== null) {
            var posting = $.post(`${baseUrl}api/v1/login/logout`,{
              Token: localStorage.getItem("Token")
            });
            posting.done(function(result) {
                setTimeout(function(){ window.location.replace(`${baseUrl}api/v1/login/login`); }, 100);
                localStorage.removeItem('Admin');
                localStorage.removeItem('Browser');
                localStorage.removeItem('ip');
                localStorage.removeItem('Language');
                localStorage.removeItem('Time');
                localStorage.removeItem('Token');
                localStorage.removeItem('UserID');
                localStorage.removeItem('Username');
            })
            posting.fail(function(err) {
              if(err.status === 401){
                console.log(err)
              }else if(err.status === 500){
                console.log(err)
              }
            });
        }
}

/**
 * Will send a logout request to destroy the current token
 * @returns {Promise}
 */
function toggle_allowed_state(userid){
    const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        if (localStorage.getItem("Token") !== null) {
            var posting = $.get(`${baseUrl}api/v1/strom/PlugsToggleAllowedState`,{
              Token: localStorage.getItem("Token"),
              UserID: userid
            });
            posting.done(function(result) {
                Table_AdminUserDataList()
            })
            posting.fail(function(err) {
              if(err.status === 401){
                console.log(err)
              }else if(err.status === 500){
                console.log(err)
                alert(translate('Buttons.toggle_allowed_state.no_chance'))
              }
            });
        }
}