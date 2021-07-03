const i18n = new I18n({
    fallback: 'en',
    languages: {
      en: {
        title: 'This is the title in English',
        description: 'This is the description in English',
      },
      de: {
        title: 'Das ist der Titel auf Deutsch',
        description: 'Dies ist die Beschreibung auf Deutsch',
      },
    }
});

/**
 * Will translate a key value to the language of the token
 * @param {string} Key Current HTML
 * @returns {string} Stransladed String
 * User: Startseite | Shopping | Strom  
 * Admin: Gäste
 */
function i18ntranslate(Key){
    return i18n.translate(localStorage.getItem('Language'), Key);
}