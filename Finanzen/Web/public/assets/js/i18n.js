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
            Gäste: "Gäste",
            Bestellungen: "Bestellungen",
            Ausloggen: "Ausloggen"
          },
          Willkommen: "Willkommen"
        },
        Startseite: {
          Guthaben: "Dein Restguthaben beträgt {{restguthaben}}",
          Text: "Dein Startguthaben beträgt {{guthaben}}, davon werden dir {{essenkosten}} für Essen abgezogen und {{stromkosten}} für verbrauchte Energie."
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
            Succsess: "Hinzufügen erfolgreich!",
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
            displays_count: "Monitore",
            network_cable: "LAN-Kabel",
            vr: "VR",
            expected_arrival: "Ankuft",
            expected_departure: "Abfahrt"
          },
          GästeAdminUserTabelle: {
            username: "Nutzername",
            userid: "NutzerID",
            payed: "Gezahlt",
            admin: "Admin",
            vaccinated: "Geimpft",
            payed_ammount: "Zahlung",
            pyed_id: "Zahlungs ID",
            button_chancePlugAllowedState: "Steckdose Erlauben"
          },
          AdminUserOrderTabelle: {
            username: "Nutzername",
            artikel: "Artikel",
            amount: "Anzahl",
            price: "Preis",
            button_SetPrice: "Ändere Preis",
            button_SetStatus: "Bestellt?",
            button_SetStatus_text: "Wurde bestellt"
          },
          UserUserOrderTabelle: {
            username: "Nutzername",
            artikel: "Artikel",
            amount: "Anzahl",
            price: "Preis",
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
            no_chance: "Fehler: Dieser Nutzer hat vermutlich keine Steckdose"
          },
          delete_user_order_by_key: {
            notime: "Die Bearbeitsungszeit für diese Bestellunge ist bereits Abgelaufen"
          }
        }
      },
      en: {
        Header: {
          Links: {
            Startseite: "Mainpadge",
            Einkaufliste: "Shoppingcart",
            Strom: "Power",
            Gäste: "Guests",
            Ausloggen: "Logout"
          },
          Willkommen: "Wellcome"
        },
        Startseite: {
          
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
function translate(Key, Variables){
  if(Variables){
    return i18n.translate(localStorage.getItem('Language'), Key, Variables);
  }else{
    return i18n.translate(localStorage.getItem('Language'), Key);
  }
}

function convertFlags(lang_string){
  if(lang_string === "de"){
    return "🇩🇪";
  }else if(lang_string === "en"){
    return "🇬🇧";
  }else if(lang_string === "ua"){
    return "🇺🇦";
  }else if(lang_string === "it"){
    return "🇮🇹";
  }else{
    return lang_string
  }
}