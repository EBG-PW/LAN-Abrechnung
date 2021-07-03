/**
 * Will create the header based on active and persmissions
 * @param {string} active Current HTML
 * @returns {Promise}
 * User: Startseite | Shopping | Strom  
 * Admin: Gäste
 */
function createHeaderLinks(active) {
    var HeaderHTML = "";
        
        if(active.toLowerCase() === "Startseite".toLowerCase()){
            HeaderHTML += `<li><a href="index.html" class="active">Startseite</a></li>`
        }else{
            HeaderHTML += `<li><a href="index.html">Startseite</a></li>`
        }

        if(active.toLowerCase() === "Shopping".toLowerCase()){
            HeaderHTML += `<li><a href="Shopping.html" class="active">Einkaufliste</a></li>`
        }else{
            HeaderHTML += `<li><a href="Shopping.html">Einkaufliste</a></li>`
        }

        if(active.toLowerCase() === "Strom".toLowerCase()){
            HeaderHTML += `<li><a href="Strom.html" class="active">Strom</a></li>`
        }else{
            HeaderHTML += `<li><a href="Strom.html">Strom</a></li>`
        }

        if(localStorage.getItem('Admin')){
            //IF Admin add :D
            if(active.toLowerCase() === "Gäste".toLowerCase()){
                HeaderHTML += `<li><a href="Users.html" class="active">Gäste</a></li>`
            }else{
                HeaderHTML += `<li><a href="Users.html">Gäste</a></li>`
            }
        }

        HeaderHTML += `<li><p id="logout" onclick="logout()">Ausloggen</p></li>`

    $("#LinksList").html(HeaderHTML);
}

/**
 * Will create the wlcome message on top left side
 * @returns {Promise}
 */
 function createHeaderMessage() {
     let SofwareName = "LAN-Manager"
     let HeaderHTML = `${SofwareName}: Willkommen ${localStorage.getItem('Username')}`;

    $("#HeaderWelcome").text(HeaderHTML);
}