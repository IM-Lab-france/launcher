let db;
let bookmarksData = { sections: [] };

function initDB() {
    const request = indexedDB.open("bookmarksDB", 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore("sectionsStore", { keyPath: "id" });
        objectStore.createIndex("title", "title", { unique: false });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log("Base de données initialisée avec succès");

        // Charger la langue par défaut une fois que db est prête
        loadDefaultLanguageAndBookmarks();
    };

    request.onerror = function(event) {
        console.error("Erreur lors de l'initialisation de la base de données:", event.target.errorCode);
    };
}

function saveSection(section) {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");
  
    objectStore.put(section);
  
    transaction.oncomplete = function() {
      console.log("Section sauvegardée:", section);
      loadBookmarks();
    };
  
    transaction.onerror = function(event) {
      console.error("Erreur lors de la sauvegarde de la section:", event.target.errorCode);
    };
}

function loadBookmarks() {
    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    const request = objectStore.getAll();
    request.onsuccess = function(event) {
        const allData = event.target.result;

        // Filtrer pour n'inclure que les sections, en excluant l'enregistrement de langue
        bookmarksData.sections = allData.filter(item => item.id !== "app_language");

        // Trier les sections par position
        bookmarksData.sections.sort((a, b) => (a.position || 0) - (b.position || 0));

        renderBookmarks();

        // Charger la langue
        const languageData = allData.find(item => item.id === "app_language");
        const language = languageData ? languageData.value : "fr"; // Français par défaut
        document.getElementById('languageSelect').value = language;
        loadLanguage(language); // Appliquer la langue à l'interface
    };
}

function saveData() {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    // Sauvegarder uniquement les sections, sans inclure l'enregistrement de langue
    bookmarksData.sections.forEach(section => {
        objectStore.put(section);
    });

    transaction.oncomplete = function() {
        console.log("Toutes les sections ont été sauvegardées sans la langue.");
    };

    transaction.onerror = function(event) {
        console.error("Erreur lors de la sauvegarde des sections:", event.target.errorCode);
    };
}

function deleteAllData() {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.clear();

    transaction.oncomplete = function() {
        bookmarksData.sections = [];
        renderBookmarks();
        $('#deleteAllModal').modal('hide');
        console.log("Toutes les données ont été supprimées.");
    };

    transaction.onerror = function(event) {
        console.error("Erreur lors de la suppression des données:", event.target.errorCode);
    };
}

// Appeler initDB lors du chargement de la page
document.addEventListener("DOMContentLoaded", initDB);
