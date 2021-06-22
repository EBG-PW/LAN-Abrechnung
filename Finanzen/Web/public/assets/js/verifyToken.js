function CheckTokenValidity(){
  const getUrl = window.location;
  const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
  if (localStorage.getItem("Token") !== null) {
    //Token was found, now validate it and if valid forward to /public
    var posting = $.post(`${baseUrl}api/v1/check`,{
      Token: localStorage.getItem("Token")
    });
    posting.done(function(result) {
      return result
    })
    posting.fail(function(err) {
			if(err.status === 401){
        window.location.replace(`${baseUrl}api/v1/login/login`);
      }
		});
  }else{
    window.location.replace(`${baseUrl}api/v1/login/login`);
  }
}