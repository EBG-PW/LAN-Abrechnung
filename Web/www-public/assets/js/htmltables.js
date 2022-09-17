const setColor = (boolean, mode) => {
    if (mode === 'red_green') {
        if (boolean || boolean === "true") {
            return "#00fa00"
        } else {
            return "#fafa00"
        }
    }
}

//This is used in Users.html
function Table_AdminUserDataList() {
    Promise.all([getAdminUserData(), getPermisionGroup()]).then(function (AdminUserData) {
        const AdminUserDataList = AdminUserData[0];
        const PermisionGroup = AdminUserData[1].PermissionGroups;
        for (let i = 0; i < AdminUserDataList.GuestsList_response.length; i++) {
            //Set Flags behind username
            AdminUserDataList.GuestsList_response[i].username = `${AdminUserDataList.GuestsList_response[i].username} ${convertFlags(AdminUserDataList.GuestsList_response[i].lang)}`
            //Convert Cents from API to Euro

            AdminUserDataList.GuestsList_response[i].payed_ammount = CentToEuro(AdminUserDataList.GuestsList_response[i].payed_ammount)
            //Add Button to switch pugs allowed status
            let allowed_state, allowed_state_color;
            if (AdminUserDataList.GuestsList_response[i].allowed_state === null) {
                allowed_state = translate('undefined')
                allowed_state_color = 'color: #ff0000 !important;'
            } else if (AdminUserDataList.GuestsList_response[i].allowed_state === true) {
                allowed_state = true
                allowed_state_color = 'color: #00ff00 !important;'
            } else {
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
            AdminUserDataList.GuestsList_response[i].dropdown_permisionGroup = {
                function: "change_permisionGroup",
                functionVar: AdminUserDataList.GuestsList_response[i].userid,
                id: `change_permisionGroup_${i}`,
                style: 'width: 100%;',
                options: []
            }

            for (const [key, value] of Object.entries(PermisionGroup)) {
                AdminUserDataList.GuestsList_response[i].dropdown_permisionGroup.options.push({
                    tooltip: PermisionGroup[key].description,
                    value: key,
                    text: PermisionGroup[key].name
                })
            }

            AdminUserDataList.GuestsList_response[i].dropdown_permisionGroup.options.sort(function (a) {
                if (a.value === AdminUserDataList.GuestsList_response[i].permission_group) return -1;
                if (a.value !== AdminUserDataList.GuestsList_response[i].permission_group) return 1;
                return 0;
            });
        }

        const OptionsList = {
            KeyButtonList: ['button_chancePlugAllowedState'],
            KeyDropdownList: ['dropdown_permisionGroup']
        }

        //Add Table Format parameter...
        $("#AdminUsersTabelle").html(CustomCreateTable(['username', 'userid', 'payed', 'admin', 'vaccinated', 'payed_ammount', 'pyed_id', 'button_chancePlugAllowedState', 'dropdown_permisionGroup'], OptionsList, AdminUserDataList.GuestsList_response, 'GästeAdminUserTabelle', true))

        let NotPayedUsers = []
        AdminUserDataList.GuestsList_response.map((user, index) => {
            if (!user.payed) {
                user.button_chanceSetPayed = {
                    text: translate('Tabeles.GästeNotPayedTabelle.setPayed'),
                    style: 'color: #00ff00 !important;',
                    function: "setPayed_state",
                    functionVar: user.userid,
                    Convert: false
                }
                NotPayedUsers.push(user)
            }
        });

        const OptionsListNotPayed = {
            KeyButtonList: ['button_chanceSetPayed']
        }
        if (NotPayedUsers.length > 0) {
            $("#NotPayedUsers").html(translate('Tabeles.GästeNotPayedTabelle.headline'))
            $("#NotPayedUsersTabelle").html(CustomCreateTable(['username', 'userid', 'payed', 'payed_ammount', 'pyed_id', 'button_chanceSetPayed'], OptionsListNotPayed, NotPayedUsers, 'GästeNotPayedTabelle', true))
        } else {
            $("#NotPayedUsers").html("")
            $("#NotPayedUsers").removeClass('major')
            $("#NotPayedUsersTabelle").html("")
        }
    });
}

//This is used for index.html
function Table_UserDataList() {
    //Request Userdata for the Usertable
    getUserData().then(function (UserDataList) {
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
    GetShoppingList().then(function (ShoppingListData) {
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
    let TotalCost = 0;
    getAdminUserOrderData(orderid).then(function (getAdminUserOrderData) {
        for (let i = 0; i < getAdminUserOrderData.GetOrder_response.length; i++) {

            //Convert Cents from API to Euro
            TotalCost += getAdminUserOrderData.GetOrder_response[i].price
            getAdminUserOrderData.GetOrder_response[i].price = CentToEuro(getAdminUserOrderData.GetOrder_response[i].price)

            getAdminUserOrderData.GetOrder_response[i].button_SetStatus = {
                text: translate(`Tabeles.AdminUserOrderTabelle.button_SetStatus_text_${getAdminUserOrderData.GetOrder_response[i].status}`),
                style: `color: ${setColor(getAdminUserOrderData.GetOrder_response[i].status, "red_green")} !important;`,
                function: "switch_order_to_shopinglist",
                functionVar: getAdminUserOrderData.GetOrder_response[i].orderkey,
                Convert: false
            }
        }

        const LastSummRow = {
            username: translate('Tabeles.AdminUserOrderTabelle.totale_price'),
            artikel: "",
            amount: "",
            price: CentToEuro(TotalCost),
            status: "",
            button_SetStatus: {
                text: translate('Tabeles.AdminUserOrderTabelle.button_delete_text'),
                style: 'background: transparent;border: none !important;font-size:0;',
                function: "delete_user_order_by_key",
                functionVar: "",
                Convert: false
            }
        }
        getAdminUserOrderData.GetOrder_response.push(LastSummRow)
        //Add Table Format parameter...
        $("#resultOrderList").html(ButtonCreateTable(['username', 'artikel', 'amount', 'price', 'button_SetStatus'], ['button_SetStatus'], getAdminUserOrderData.GetOrder_response, 'AdminUserOrderTabelle', true))
    });
}

//This is used in Bestellungen.html
function Table_UserBestellungList(orderid) {
    getUserOrderData(orderid).then(function (getUserUserOrderData) {
        let TotalCost = 0;
        for (let i = 0; i < getUserUserOrderData.GetOrder_response.length; i++) {
            //Convert Cents from API to Euro
            TotalCost += getUserUserOrderData.GetOrder_response[i].price
            getUserUserOrderData.GetOrder_response[i].price = CentToEuro(getUserUserOrderData.GetOrder_response[i].price)

            if (getUserUserOrderData.GetOrder_response[i].status === true || getUserUserOrderData.GetOrder_response[i].status === "true") {
                getUserUserOrderData.GetOrder_response[i].status = translate('Tabeles.UserUserOrderTabelle.status_text_true')
            } else {
                getUserUserOrderData.GetOrder_response[i].status = translate('Tabeles.UserUserOrderTabelle.status_text_false')
            }

            getUserUserOrderData.GetOrder_response[i].button_delete = {
                text: translate('Tabeles.UserUserOrderTabelle.button_delete_text'),
                style: 'color: #ff0000 !important;',
                function: "delete_user_order_by_key",
                functionVar: getUserUserOrderData.GetOrder_response[i].orderkey,
                Convert: false
            }
        }

        const LastSummRow = {
            username: translate('Tabeles.UserUserOrderTabelle.totale_price'),
            artikel: "",
            amount: "",
            price: CentToEuro(TotalCost),
            status: "",
            button_delete: {
                text: translate('Tabeles.UserUserOrderTabelle.button_delete_text'),
                style: 'background: transparent;border: none !important;font-size:0;',
                function: "delete_user_order_by_key",
                functionVar: "",
                Convert: false
            }
        }
        getUserUserOrderData.GetOrder_response.push(LastSummRow)
        //Add Table Format parameter...
        $("#UserresultOrderList").html(ButtonCreateTable(['username', 'artikel', 'amount', 'price', 'status', 'button_delete'], ['button_delete'], getUserUserOrderData.GetOrder_response, 'UserUserOrderTabelle', true))
    });
}

//This is used in Inventory.html
function Table_InventoryList() {
    //Request Userdata for the Usertable
    let [TotalCost, SoledAmount, InventoryAmount] = [0, 0, 0];

    GetInventory().then(function (InventoryData) {
        for (let i = 0; i < InventoryData.Inventory_response.length; i++) {

            InventoryData.Inventory_response[i].left = InventoryData.Inventory_response[i].amount - InventoryData.Inventory_response[i].bought

            //Calculate some total costs
            if (InventoryData.Inventory_response[i].produktname !== 'Spende') {
                SoledAmount += InventoryData.Inventory_response[i].price * InventoryData.Inventory_response[i].bought
                InventoryAmount += InventoryData.Inventory_response[i].price * InventoryData.Inventory_response[i].left
                TotalCost += InventoryData.Inventory_response[i].price * InventoryData.Inventory_response[i].amount
            }

            InventoryData.Inventory_response[i].price = CentToEuro(InventoryData.Inventory_response[i].price)
        }

        //Add Table Format parameter...
        $("#InventarText").html(`<h3>${translate('InventarSeite.Text', { SoledAmount: CentToEuro(SoledAmount), InventoryAmount: CentToEuro(InventoryAmount), TotalCost: CentToEuro(TotalCost) })}</h3>`)
        $("#InventarTabelle").html(CreateTable(['produktname', 'produktcompany', 'amount', 'bought', 'left', 'price'], InventoryData.Inventory_response, 'InventoryTabelle', true))
    });
}

//This is used in Inventory.html
function Table_DonationList(Translation) {
    GetDonations().then(function (DonationData) {
        let TotalDonated = 0;
        for (let i = 0; i < DonationData.Donation_response.length; i++) {
            TotalDonated += Number(DonationData.Donation_response[i].total_donation)
            DonationData.Donation_response[i].total_donation = CentToEuro(DonationData.Donation_response[i].total_donation)
        }

        //Add Table Format parameter...
        $("#SpendeText").html(`<h3>${translate(Translation, { TotalDonated: CentToEuro(TotalDonated) })}</h3>`)
        $("#SpendeTabelle").html(CreateTable(['username', 'total_donation'], DonationData.Donation_response, 'SpendeTabelle', true))
    });
}

// This is used in Plugs.html
function PlugsManagmentTabelle() {
    GetPlugsTable().then(function (PlugsData) {
        for (let i = 0; i < PlugsData.Data.length; i++) {
            PlugsData.Data[i].input_name = {
                value: PlugsData.Data[i].username,
                style: 'width: 100%;',
                type: 'text',
                function: 'change_plug_userid',
                functionVar: PlugsData.Data[i].plugid,
                id: 'input_userid_' + i,
            }

            PlugsData.Data[i].power_used = (PlugsData.Data[i].power_used).toFixed(3).replace(".", ",") + " kWh"
        }

        const OptionsListNotPayed = {
            KeyInputList: ['input_name']
        }
        //Add Table Format parameter...
        $("#PlugsManagmentTabelle").html(CustomCreateTable(['ipaddr', 'controlername', 'token', 'state', 'allowed_state', 'power_used', 'input_name'], OptionsListNotPayed, PlugsData.Data, 'PlugsManagmentTabelle', true))
    });
}