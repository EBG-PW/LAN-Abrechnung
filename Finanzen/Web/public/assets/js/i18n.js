const i18n = new I18n({
    fallback: 'de',
    languages: {
      de: {
        Header: {
          Links: {
            Startseite: "Startseite",
            Einkaufliste: "Einkaufliste",
            Strom: "Strom",
            Gäste: "Gäste",
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
        GästeSeite: {
          
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
          ShoppinglistTabelle: {
            userid: "NutzerID",
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