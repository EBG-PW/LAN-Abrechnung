const i18n = new I18n({
  fallback: 'de',
  languages: {
    de: {
      Header: {
        Links: {
          Startseite: "Startseite",
          Einkaufliste: "Einkaufliste",
          Strom: "Strom",
          UserBestellungen: "Bestellung",
          SubUserManager: "Gast-Verwaltung",
          Inventar: "Inventar",
          Gäste: "Gäste",
          Plugs: "Steckdosen",
          Bestellungen: "Bestellungen",
          Ausloggen: "Ausloggen"
        },
        Willkommen: "Willkommen"
      },
      Startseite: {
        Guthaben: "Dein Restguthaben beträgt {{restguthaben}}",
        Text: "Dein Startguthaben beträgt {{guthaben}}, davon werden dir {{essenkosten}} für Essen abgezogen und {{stromkosten}} für verbrauchte Energie.",
        DontationText: "Großes Dankeschön an die gelisteten Gäste, diese haben insgesamt {{TotalDonated}} gespendet."
      },
      Shoppingseite: {
        Text: "Deine gesamten Ausgaben auf Buffet, Getränke und Bestellungen belaufen sich auf {{total}}."
      },
      Stromseite: {
        Text: "Dein Energieverbrauch bisher sind {{totalkwh}}kWh. Das kostet dich {{totalkostenkwh}}"
      },
      UserBestellungenseite: {
        Text: "",
        Form: {
          orderid: "Bestellungs ID",
          FormName: "Artikel Bestellen",
          article: "Genauer Artikel Name + Extras",
          price: "Einzelpreis",
          Submit: "Hinzufügen",
          Success: "Hinzufügen erfolgreich!",
          Errors: {
            PriceNumber: "Preis muss eine Nummer sein",
            PriceNull: "Preis muss angegeben werden",
            ArticleNull: "Artikel muss angegeben werden",
            OrderidNull: "Bestellungs ID muss ausgefüllt sein",
            TomManyRequests: "Zu viele Anfrage, bitte versuchen Sie es später erneut!",
            OutOfTime: "Leider ist der Bestellzeitraum abgelaufen!"
          }
        }
      },
      GästeSeite: {

      },
      InventarSeite: {
        Text: "Das gesamte Inventar hat einen Gesamtwert von {{TotalCost}}, es wurden {{SoledAmount}} für Essen und der aktuelle Wert ist {{InventoryAmount}}.",
        DontationText: "Die gesamte Spende beträgt {{TotalDonated}}.",
      },
      Bestellungen: {
        Text: "Erstelle eine neue Bestellung",
        Form: {
          FormNameOrderList: "Bestellungen der Nutzer",
          orderid: "Bestellungs ID",
          FormName: "Neue Bestellung",
          EssenListe: "Link zur Speisekarte",
          Zeit: "Zeit für bestellung in Minuten",
          Submit: "Neue Bestellung",
          SubmitOrderList: "Zeige Bestellungen",
          Result: "Neue Bestellung erfolgreich angelegt"
        }
      },
      Tabeles: {
        StartSeiteUserTabelle: {
          username: "Nutzername",
          pc: "PC",
          bouncycastle: "Hüpfburg",
          displays_count: "Monitore",
          network_cable: "LAN-Kabel",
          vr: "VR",
          expected_arrival: "Ankuft",
          expected_departure: "Abfahrt"
        },
        GästeAdminUserTabelle: {
          username: "Nutzername",
          userid: "NutzerID",
          bouncycastle: "Hüpfburg",
          payed: "Gezahlt",
          admin: "TG Admin",
          payed_ammount: "Zahlung",
          pyed_id: "Zahlungs ID",
          button_chancePlugAllowedState: "Steckdose Erlauben",
          dropdown_permisionGroup: "Berechtigungs Gruppe",
        },
        GästeNotPayedTabelle: {
          username: "Nutzername",
          userid: "NutzerID",
          payed: "Gezahlt",
          payed_ammount: "Zahlung",
          pyed_id: "Zahlungs ID",
          button_chanceSetPayed: "Zahlung Erfolgreich",
          setPayed: "Hat gezahlt",
          headline: "Gäste die noch nicht gezahlt haben"
        },
        AdminUserOrderTabelle: {
          username: "Nutzername",
          artikel: "Artikel",
          amount: "Anzahl",
          price: "Preis",
          totale_price: "Gesamtpreis:",
          button_SetPrice: "Ändere Preis",
          button_SetStatus: "Bestellt?",
          button_SetStatus_text_true: "Wurde bestellt",
          button_SetStatus_text_false: "Bestellen",
        },
        SubUserManagerTabelle: {
          username: "Nutzername",
          expected_arrival: "Ankuft",
          expected_departure: "Abfahrt",
          button_toggle_payment: "Zahlung",
          payed_amount_input: "Budget",
          button_states: {
            true: "Erlaubt",
            false: "Verboten"
          }
        },
        PlugsManagmentTabelle: {
          input_name: "Nutzername",
          allowed_state: "Benutzung Erlaubt",
          ipaddr: "IP Adresse",
          controlername: "Location Name",
          token: "Location Token",
          power_used: "Verbrauch",
          state:  "Status",
        },
        UserUserOrderTabelle: {
          username: "Nutzername",
          artikel: "Artikel",
          amount: "Anzahl",
          price: "Preis",
          totale_price: "Gesamtpreis:",
          status: "Status",
          status_text_true: "Wurde bestellt",
          status_text_false: "Nicht bestellt",
          button_delete: "Löschen",
          button_delete_text: "X"
        },
        ShoppinglistTabelle: {
          username: "Nutzername",
          byer_userid: "ID des Käufers",
          produktname: "Produkt Name",
          produktcompany: "Hersteller",
          bought: "Anzahl",
          price: "Preis"
        },
        InventoryTabelle: {
          produktname: "Artikel",
          produktcompany: "Hersteller",
          amount: "Anzahl",
          bought: "Gekauft",
          left: "Verbleibend",
          price: "Preis"
        },
        SpendeTabelle: {
          username: "Spender",
          total_donation: "Spende"
        }
      },
      Tage: {
        Long: {
          0: "Sonntag",
          1: "Montag",
          2: "Dienstag",
          3: "Mittwoch",
          4: "Donnerstag",
          5: "Freitag",
          6: "Samstag"
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
      undefined: "Undefiniert",
      Buttons: {
        toggle_allowed_state: {
          no_chance: "Fehler: Dieser Nutzer hat vermutlich keine Steckdose",
          toggle_error: "Fehler: Konnte den Status nicht ändern",
          setAmountError: "Fehler: Konnte den Betrag nicht ändern",
        },
        delete_user_order_by_key: {
          notime: "Die Bearbeitsungszeit für diese Bestellunge ist bereits Abgelaufen"
        }
      }
    },
    en: {
      Header: {
        Links: {
          Startseite: "Startpage",
          Einkaufliste: "Shoppinglist",
          Strom: "Electricity",
          UserBestellungen: "Orders",
          SubUserManager: "Guest-Manager",
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
          bouncycastle: "Bouncy Castle",
          displays_count: "Monitors",
          network_cable: "LAN-Cable",
          vr: "VR",
          expected_arrival: "Arrival",
          expected_departure: "Departure"
        },
        GästeAdminUserTabelle: {
          username: "Username",
          userid: "UserID",
          bouncycastle: "Bouncy Castle",
          payed: "Payed",
          admin: "TG Admin",
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
        SubUserManagerTabelle: {
          username: "Username",
          expected_arrival: "Arrival",
          expected_departure: "Departure",
          button_toggle_payment: "Payment",
          payed_amount_input: "Budget",
          button_states: {
            true: "Allowed",
            false: "Forbidden"
          }
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
          no_chance: "Error: This user probably has no plug",
          toggle_error: "Error: Could not change the state",
          setAmountError: "Error: Could not set the amount",
        },
        delete_user_order_by_key: {
          notime: "The time period for this order has expired!"
        }
      }
    }
  }
});

/**
 * Will translate a key value to the language of the token
 * @param {string} Key Object Key to translate
 * @param {object} Variables
 * @returns {string} Transladed String
 */
function translate(Key, Variables) {
  if (Variables) {
    return i18n.translate(localStorage.getItem('Language'), Key, Variables);
  } else {
    return i18n.translate(localStorage.getItem('Language'), Key);
  }
}

function convertFlags(lang_string) {

  const cdn_base= "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";
  let flagChar;
  
  if (lang_string === "de") {
    flagChar = "1f1e9-1f1ea" // 🇩🇪 
  } else if (lang_string === "en") {
    flagChar = "1f1ec-1f1e7"; // 🇬🇧
  } else if (lang_string === "ua") {
   flagChar = "1f1fa-1f1e6"; // 🇺🇦
  } else if (lang_string === "it") {
    flagChar = "1f1ee-1f1f9" // 🇮🇹
  } else {
    return lang_string;
  }

  return `<img width="18" height="14" src="${cdn_base}/${flagChar}.png">`;
}

//Gets triggerd by the language selector, will update the Language in Client and send API Request
console.log("Language Selector");
function chanceLanguageEvent() {
  if (localStorage.getItem('Token') !== null) {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";

    const exportjson = JSON.stringify({
      lang: $("#countries").val()
    })

    const posting = $.ajax({
      url: `${baseUrl}api/v1/user/setLang`,
      type: 'POST',
      contentType: "application/json; charset=utf-8",
      headers: { "Authorization": 'Bearer ' + localStorage.getItem('Token') },
      data: exportjson,
      success: function (data) {
        localStorage.setItem('Language', $("#countries").val());
        location.reload();
      },
      error: function (err) {
        alert("Language Error")
      }
    });
  }
  localStorage.setItem('Language', $("#countries").val());
}

//Set Footer language selection to current language
$("#countries").val(localStorage.getItem('Language'))