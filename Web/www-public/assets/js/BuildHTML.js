/**
 * Will create the header based on active and persmissions
 * @param {string} active Current HTML
 * @returns {Promise}
 * User: Startseite | Shopping | Strom  
 * Admin: Gäste | Bestellungen
 */
function createHeaderLinks(active) {
    var HeaderHTML = "";
        
        if(active.toLowerCase() === "Startseite".toLowerCase()){
            HeaderHTML += `<li><a href="/" class="active">${translate('Header.Links.Startseite')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="/">${translate('Header.Links.Startseite')}</a></li>`
        }

        if(active.toLowerCase() === "Shopping".toLowerCase()){
            HeaderHTML += `<li><a href="Shopping" class="active">${translate('Header.Links.Einkaufliste')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="Shopping">${translate('Header.Links.Einkaufliste')}</a></li>`
        }

        if(active.toLowerCase() === "Strom".toLowerCase()){
            HeaderHTML += `<li><a href="Strom" class="active">${translate('Header.Links.Strom')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="Strom">${translate('Header.Links.Strom')}</a></li>`
        }

        if(active.toLowerCase() === "UserBestellungen".toLowerCase()){
            HeaderHTML += `<li><a href="UserBestellungen" class="active">${translate('Header.Links.UserBestellungen')}</a></li>`
        }else{
            HeaderHTML += `<li><a href="UserBestellungen">${translate('Header.Links.UserBestellungen')}</a></li>`
        }
        
        if(localStorage.getItem('Permissions_Read').split(",").includes("admin_user")){
            //IF Admin add :D
            if(active.toLowerCase() === "Gäste".toLowerCase()){
                HeaderHTML += `<li><a style="color: rgb(255, 99, 132) !important;" href="Users" class="active">${translate('Header.Links.Gäste')}</a></li>`
            }else{
                HeaderHTML += `<li><a style="color: rgb(255, 99, 132) !important;" href="Users">${translate('Header.Links.Gäste')}</a></li>`
            }
        }

        if(localStorage.getItem('Permissions_Read').split(",").includes("admin_bestellungen")){
            //IF Admin add :D
            if(active.toLowerCase() === "Bestellungen".toLowerCase()){
                HeaderHTML += `<li><a style="color: rgb(255, 99, 132) !important;" href="Bestellungen" class="active">${translate('Header.Links.Bestellungen')}</a></li>`
            }else{
                HeaderHTML += `<li><a style="color: rgb(255, 99, 132) !important;" href="Bestellungen">${translate('Header.Links.Bestellungen')}</a></li>`
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

/**
 * This function will convert cents to Euro ISO 
 * @param {string} value
 * @returns {string}
 */
 function CentToEuro(value){
    var euro = value / 100;
    return euro.toLocaleString("de-De", {style:"currency", currency:"EUR"});
}