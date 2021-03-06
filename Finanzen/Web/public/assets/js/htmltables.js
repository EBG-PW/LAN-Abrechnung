//This is used in Users.html
function Table_AdminUserDataList() {
    getAdminUserData().then(function(AdminUserDataList) {
        for (let i = 0; i < AdminUserDataList.GuestsList_response.length; i++) {
            //Set Flags behind username
            AdminUserDataList.GuestsList_response[i].username = `${AdminUserDataList.GuestsList_response[i].username} ${convertFlags(AdminUserDataList.GuestsList_response[i].lang)}`
            //Convert Cents from API to Euro
            
            AdminUserDataList.GuestsList_response[i].payed_ammount = CentToEuro(AdminUserDataList.GuestsList_response[i].payed_ammount)
            //Add Button to switch pugs allowed status
            let allowed_state, allowed_state_color;
            if(AdminUserDataList.GuestsList_response[i].allowed_state === null){
                allowed_state = translate('undefined')
                allowed_state_color = 'color: #ff0000 !important;'
            }else if(AdminUserDataList.GuestsList_response[i].allowed_state === true){
                allowed_state = true
                allowed_state_color = 'color: #00ff00 !important;'
            }else{
                allowed_state = false
                allowed_state_color = 'color: #ffff00 !important;'
            }
            AdminUserDataList.GuestsList_response[i].button_chancePlugAllowedState = {
                text: allowed_state,
                style: allowed_state_color,
                function: "toggle_allowed_state",
                functionVar: AdminUserDataList.GuestsList_response[i].userid,
                Convert: false
            }
        } 
        //Add Table Format parameter...
        $("#AdminUsersTabelle").html(ButtonCreateTable(['username', 'userid', 'payed', 'admin', 'vaccinated', 'payed_ammount', 'pyed_id', 'button_chancePlugAllowedState'], ['button_chancePlugAllowedState'], AdminUserDataList.GuestsList_response, 'GästeAdminUserTabelle', true))
    });
}

//This is used for index.html
function Table_UserDataList() {
    //Request Userdata for the Usertable
    getUserData().then(function(UserDataList) {
        for (let i = 0; i < UserDataList.GuestsList_response.length; i++) {
            //Set Flags behind username
            UserDataList.GuestsList_response[i].username = `${UserDataList.GuestsList_response[i].username} ${convertFlags(UserDataList.GuestsList_response[i].lang)}`
        }
        //Add Table FOrmat parameter...
        $("#StartSeitenTabelle").html(CreateTable(['username', 'pc', 'displays_count', 'network_cable', 'vr', 'expected_arrival', 'expected_departure'], UserDataList.GuestsList_response, 'StartSeiteUserTabelle', true))
    });
}

//This is used for Shopping.html
function Table_ShoppingListTable() {
    //Request Userdata for the Usertable
    GetShoppingList().then(function(ShoppingListData) {
        for (let i = 0; i < ShoppingListData.ShoppingList_response.length; i++) {
            ShoppingListData.ShoppingList_response[i].price = CentToEuro(ShoppingListData.ShoppingList_response[i].price)
            ShoppingListData.ShoppingList_response[i].byerid = ShoppingListData.ShoppingList_response[i].byer_userid
        }
        //Add Table Format parameter...
        //'byerid', geht nicht weil... Keine Ahung. Hoffentlich gehts mit anderer Query von Geo die den Usernamen gibt lol
        $("#ShoppingTabelle").html(CreateTable(['username', 'produktname', 'produktcompany', 'bought', 'price'], ShoppingListData.ShoppingList_response, 'ShoppinglistTabelle', true))
    });
}

//This is used in Bestellungen.html
function Table_BestellungList(orderid) {
    getAdminUserOrderData(orderid).then(function(getAdminUserOrderData) {
        for (let i = 0; i < getAdminUserOrderData.GetOrder_response.length; i++) {

            //Convert Cents from API to Euro
            getAdminUserOrderData.GetOrder_response[i].price = CentToEuro(getAdminUserOrderData.GetOrder_response[i].price)
            
            getAdminUserOrderData.GetOrder_response[i].button_SetStatus = {
                text: translate('Tabeles.AdminUserOrderTabelle.button_SetStatus_text'),
                style: 'color: #fafa00 !important;',
                function: "switch_order_to_shopinglist",
                functionVar: getAdminUserOrderData.GetOrder_response[i].key,
                Convert: false
            }
        } 
        //Add Table Format parameter...
        $("#resultOrderList").html(ButtonCreateTable(['username', 'artikel', 'amount', 'price', 'button_SetStatus'], ['button_SetStatus'], getAdminUserOrderData.GetOrder_response, 'AdminUserOrderTabelle', true))
    });
}

//This is used in Bestellungen.html
function Table_UserBestellungList(orderid) {
    getUserOrderData(orderid).then(function(getUserUserOrderData) {
        for (let i = 0; i < getUserUserOrderData.GetOrder_response.length; i++) {

            //Convert Cents from API to Euro
            getUserUserOrderData.GetOrder_response[i].price = CentToEuro(getUserUserOrderData.GetOrder_response[i].price)

            if(getUserUserOrderData.GetOrder_response[i].status === true || getUserUserOrderData.GetOrder_response[i].status === "true"){
                getUserUserOrderData.GetOrder_response[i].status = translate('Tabeles.UserUserOrderTabelle.status_text_true')
            }else{
                getUserUserOrderData.GetOrder_response[i].status = translate('Tabeles.UserUserOrderTabelle.status_text_false')
            }
            
            getUserUserOrderData.GetOrder_response[i].button_delete = {
                text: translate('Tabeles.UserUserOrderTabelle.button_delete_text'),
                style: 'color: #ff0000 !important;',
                function: "delete_user_order_by_key",
                functionVar: getUserUserOrderData.GetOrder_response[i].key,
                Convert: false
            }
        } 
        //Add Table Format parameter...
        $("#UserresultOrderList").html(ButtonCreateTable(['username', 'artikel', 'amount', 'price', 'status', 'button_delete'], ['button_delete'], getUserUserOrderData.GetOrder_response, 'UserUserOrderTabelle', true))
    });
}