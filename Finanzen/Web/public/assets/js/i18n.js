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
          
        }
      },
      en: {
        Header: {
          Links: {
            Startseite: "Main",
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