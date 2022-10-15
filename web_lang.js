const en = {
    Header: {
      Links: {
        Startseite: "Startpage",
        Einkaufliste: "Shoppinglist",
        Strom: "Electricity",
        UserBestellungen: "Orders",
        Inventar: "Inventory",
        Gäste: "Guests",
        Plugs: "Plugs",
        Bestellungen: "Orders",
        Ausloggen: "Logout"
      },
      Willkommen: "Welcome"
    },
    Startseite: {
      Guthaben: "Your remaining balance is {{restguthaben}}",
      Text: "Your start balance is {{guthaben}}, from which you will be deducted {{essenkosten}} for food and {{stromkosten}} for used energy.",
      DontationText: "Special thanks to the people listed below, they donated {{TotalDonated}}.",
    },
    Shoppingseite: {
      Text: "Your total expenses on Buffet, Drinks and Orders are {{total}}."
    },
    Stromseite: {
      Text: "Your energy consumption is {{totalkwh}}kWh. This costs you {{totalkostenkwh}}"
    },
    UserBestellungenseite: {
      Text: "",
      Form: {
        orderid: "Order ID",
        FormName: "Add Article",
        article: "Exact Article Name + Extras",
        price: "Price",
        Submit: "Add",
        Success: "Add successful!",
        Errors: {
          PriceNumber: "Price must be a number",
          PriceNull: "Price must be filled",
          ArticleNull: "Article must be filled",
          OrderidNull: "Order ID must be filled",
          TomManyRequests: "Too many requests, please try again later!",
          OutOfTime: "Unfortunately the time period for this order has expired!"
        }
      }
    },
    GästeSeite: {

    },
    InventarSeite: {
      Text: "The inventory has a total value of {{TotalCost}}, {{SoledAmount}} for food and the current value is {{InventoryAmount}}.",
      DontationText: "Total ammount of donations are {{TotalDonated}}."
    },
    Bestellungen: {
      Text: "Create a new order",
      Form: {
        FormNameOrderList: "Orders of the user",
        orderid: "Order ID",
        FormName: "New Order",
        EssenListe: "Link to the menu",
        Zeit: "Time for order in minutes",
        Submit: "New Order",
        SubmitOrderList: "Show Orders",
        Result: "New Order successfully created"
      }
    },
    Tabeles: {
      StartSeiteUserTabelle: {
        username: "Username",
        pc: "PC",
        displays_count: "Monitors",
        network_cable: "LAN-Cable",
        vr: "VR",
        expected_arrival: "Arrival",
        expected_departure: "Departure"
      },
      GästeAdminUserTabelle: {
        username: "Username",
        userid: "UserID",
        payed: "Payed",
        admin: "TG Admin",
        vaccinated: "Vaccinated",
        payed_ammount: "Payment",
        pyed_id: "Payment ID",
        button_chancePlugAllowedState: "Plug Allowed",
        dropdown_permisionGroup: "Permission Group",
      },
      GästeNotPayedTabelle: {
        username: "Username",
        userid: "UserID",
        payed: "Payed",
        payed_ammount: "Payment",
        pyed_id: "Payment ID",
        button_chanceSetPayed: "Payed",
        setPayed: "Has payed",
        headline: "Users who have not payed yet"
      },
      AdminUserOrderTabelle: {
        username: "Username",
        artikel: "Article",
        amount: "Amount",
        price: "Price",
        totale_price: "Total price:",
        button_SetPrice: "Change Price",
        button_SetStatus: "Ordered?",
        button_SetStatus_text_true: "Orderd",
        button_SetStatus_text_false: "Order",
      },
      PlugsManagmentTabelle: {
        input_name: "Username",
        allowed_state: "Plug Allowed",
        ipaddr: "IP-Address",
        controlername: "Location Name",
        token: "Location Token",
        power_used: "Power used",
        state:  "State",
      },
      UserUserOrderTabelle: {
        username: "Username",
        artikel: "Article",
        amount: "Amount",
        totale_price: "Total price:",
        price: "Price",
        status: "Status",
        status_text_true: "Ordered",
        status_text_false: "Not ordered",
        button_delete: "Delete",
        button_delete_text: "X"
      },
      ShoppinglistTabelle: {
        username: "Username",
        byer_userid: "ID of the buyer",
        produktname: "Product Name",
        produktcompany: "Manufacturer",
        bought: "Amount",
        price: "Price"
      },
      InventoryTabelle: {
        produktname: "Article",
        produktcompany: "Manufacturer",
        amount: "Amount",
        bought: "Bought",
        left: "Available",
        price: "Price"
      },
      SpendeTabelle: {
        username: "Donor",
        total_donation: "Donation"
      }
    },
    Tage: {
      Long: {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
      },
      Short: {
        0: "SO",
        1: "MO",
        2: "DI",
        3: "MI",
        4: "DO",
        5: "FR",
        6: "SA"
      }
    },
    undefined: "Undefined",
    Buttons: {
      toggle_allowed_state: {
        no_chance: "Error: This user probably has no plug"
      },
      delete_user_order_by_key: {
        notime: "The time period for this order has expired!"
      }
    }
}