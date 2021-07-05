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
            HeaderHTML += `<li><a href="index.html" class="active">${translate('Header.Links.Startseite')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="index.html">${translate('Header.Links.Startseite')}</a></li>`
        }

        if(active.toLowerCase() === "Shopping".toLowerCase()){
            HeaderHTML += `<li><a href="Shopping.html" class="active">${translate('Header.Links.Einkaufliste')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="Shopping.html">${translate('Header.Links.Einkaufliste')}</a></li>`
        }

        if(active.toLowerCase() === "Strom".toLowerCase()){
            HeaderHTML += `<li><a href="Strom.html" class="active">${translate('Header.Links.Strom')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="Strom.html">${translate('Header.Links.Strom')}</a></li>`
        }

        if(localStorage.getItem('Admin')){
            //IF Admin add :D
            if(active.toLowerCase() === "Gäste".toLowerCase()){
                HeaderHTML += `<li><a href="Users.html" class="active">${translate('Header.Links.Gäste')}</a></li>`
            }else{
                HeaderHTML += `<li><a href="Users.html">${translate('Header.Links.Gäste')}</a></li>`
            }
        }

        HeaderHTML += `<li><p id="logout" onclick="logout()">${translate('Header.Links.Ausloggen')}</p></li>`

    $("#LinksList").html(HeaderHTML);
}

/**
 * Will create the wlcome message on top left side
 * @returns {Promise}
 */
 function createHeaderMessage() {
     let SofwareName = "LAN-Manager" //Chance this if your event has a diffrent Name
     let HeaderHTML = `${SofwareName}: ${translate('Header.Willkommen')} ${localStorage.getItem('Username')}`;

    $("#HeaderWelcome").text(HeaderHTML);
}

/**
 * Will create the web title
 * @returns {Promise}
 */
 function createSiteTitle() {
    let SofwareName = "LAN-Manager" //Chance this if your event has a diffrent Name
    let HeaderHTML = `${SofwareName}: ${localStorage.getItem('Username')}`;

   $("#SideTile").text(HeaderHTML);
}