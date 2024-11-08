const translations = {
    "fr": {
        "new": "Nouvelle section",
        "load": "Charger un Bookmark",
        "download": "Sauvegarder un Bookmark",
        "delete": "Tout effacer",
        "infoText": "Entrez un numéro Jira au format XXXX-1234 pour ouvrir la page correspondante.<br>Sinon, vous serez redirigé vers une recherche avec votre entrée."
    },
    "en": {
        "new": "New Section",
        "load": "Load Bookmark",
        "download": "Download Bookmark",
        "delete": "Delete all",
        "infoText": "Enter a Jira number in the format XXXX-1234 to open the corresponding page.<br>Otherwise, you will be redirected to a search with your input."
    }
};

function saveLanguage(language) {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    // Enregistrez la langue avec un identifiant unique
    objectStore.put({ id: "app_language", value: language });
}

function loadDefaultLanguageAndBookmarks() {
    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    // Récupérer la langue par défaut
    const requestLang = objectStore.get("app_language");
    requestLang.onsuccess = function() {
        const language = requestLang.result ? requestLang.result.value : "fr";
        document.getElementById('languageSelect').value = language;
        loadLanguage(language); // Charger la langue par défaut
    };

    // Récupérer les sections
    const requestSections = objectStore.getAll();
    requestSections.onsuccess = function(event) {
        bookmarksData.sections = event.target.result.filter(section => section.id !== "app_language");

        // S'assurer que chaque section a un tableau `links`
        bookmarksData.sections.forEach(section => {
            section.links = section.links || [];
        });

        renderBookmarks();
    };
}

function loadLanguage(language) {
    document.getElementById('new').innerText = translations[language].new;
    document.getElementById('load').innerText = translations[language].load;
    document.getElementById('download').innerText = translations[language].download;
    document.getElementById('delete').innerText = translations[language].delete;
    document.getElementById('infoText').innerText = translations[language].infoText;
}

document.getElementById('languageSelect').addEventListener('change', (event) => {
    const selectedLanguage = event.target.value;
    loadLanguage(selectedLanguage);

    // Enregistrez la langue sans l'ajouter aux sections
    saveLanguage(selectedLanguage);
});
