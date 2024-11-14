$(document).ready(function () {
  window.db = null; // Définir db globalement
  window.bookmarksData = { sections: [] }; // Définir bookmarksData globalement

  function initDB() {
    const request = indexedDB.open("bookmarksDB", 1);

    request.onupgradeneeded = function (event) {
      db = event.target.result;
      const objectStore = db.createObjectStore("sectionsStore", {
        keyPath: "id",
      });
      objectStore.createIndex("title", "title", { unique: false });
      console.log("Structure de la base de données mise à jour");
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      console.log("Base de données initialisée avec succès");
      if (typeof loadDefaultLanguageAndBookmarks === "function") {
        loadDefaultLanguageAndBookmarks();
      }
    };

    request.onerror = function (event) {
      console.error(
        "Erreur lors de l'initialisation de la base de données:",
        event.target.errorCode
      );
    };
  }

  window.initDB = initDB; // Expose initDB globalement

  // Fonction pour sauvegarder les signets sur le serveur

  function saveSection(section) {
    if (!db) {
      console.error(
        "Base de données non disponible pour sauvegarder la section."
      );
      return;
    }

    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.put(section);

    transaction.oncomplete = function () {
      console.log("Section sauvegardée:", section);

      if (window.token) {
        saveBookmarksToServer();
      }
      if (typeof renderBookmarks === "function") {
        renderBookmarks();
      }
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la sauvegarde de la section:",
        event.target.errorCode
      );
    };
  }

  function loadBookmarks() {
    if (!db) {
      console.error("Base de données non disponible pour charger les signets.");
      return;
    }

    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    const request = objectStore.getAll();
    request.onsuccess = function (event) {
      const allData = event.target.result;
      window.bookmarksData.sections = allData.filter(
        (item) => item.id !== "app_language"
      );
      window.bookmarksData.sections.sort(
        (a, b) => (a.position || 0) - (b.position || 0)
      );

      if (typeof renderBookmarks === "function") {
        renderBookmarks();
      }

      const languageData = allData.find((item) => item.id === "app_language");
      const language = languageData ? languageData.value : "fr";
      $("#languageSelect").val(language);
      if (typeof loadLanguage === "function") {
        loadLanguage(language);
      }
    };

    request.onerror = function (event) {
      console.error(
        "Erreur lors du chargement des signets:",
        event.target.errorCode
      );
    };
  }

  function saveData() {
    if (!db) {
      console.error(
        "Base de données non disponible pour sauvegarder les sections."
      );
      return;
    }

    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    window.bookmarksData.sections.forEach((section) => {
      objectStore.put(section);
    });

    transaction.oncomplete = function () {
      console.log("Toutes les sections ont été sauvegardées sans la langue.");
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la sauvegarde des sections:",
        event.target.errorCode
      );
    };
  }

  function deleteAllData() {
    if (!db) {
      console.error(
        "Base de données non disponible pour supprimer les données."
      );
      return;
    }

    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.clear();

    transaction.oncomplete = function () {
      window.bookmarksData.sections = [];
      if (typeof renderBookmarks === "function") {
        renderBookmarks();
      }
      $("#deleteAllModal").modal("hide");
      console.log("Toutes les données ont été supprimées.");
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la suppression des données:",
        event.target.errorCode
      );
    };
  }

  async function loadServerBookmarks() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("Token JWT manquant.");
      return;
    }

    await fetch("getBookmarks.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Mettre à jour les signets dans `bookmarksData` global
          window.bookmarksData.sections = data.bookmarks || [];

          // Stocker les données reçues dans IndexedDB
          saveDataToLocalDB(window.bookmarksData);

          // Appeler `renderBookmarks` pour afficher les signets
          renderBookmarks();
        } else {
          console.error(
            data.message || "Erreur lors du chargement des signets."
          );
        }
      })
      .catch((error) => console.error("Erreur de réseau :", error));
  }

  // Fonction pour sauvegarder les données dans IndexedDB
  function saveDataToLocalDB(sectionsData) {
    if (!db) {
      console.error(
        "Base de données non disponible pour sauvegarder les signets."
      );
      return;
    }

    const sections = sectionsData.bookmarks || []; // Utilise `bookmarks` pour accéder aux sections

    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    // Effacer les anciens signets avant d'ajouter les nouveaux
    objectStore.clear();

    sections.forEach((section) => {
      objectStore.put(section);
    });

    transaction.oncomplete = function () {
      console.log("Signets sauvegardés localement dans IndexedDB.");
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la sauvegarde des signets dans IndexedDB:",
        event.target.errorCode
      );
    };
  }

  // Exposer les fonctions nécessaires globalement
  window.loadServerBookmarks = loadServerBookmarks;
  window.saveSection = saveSection;
  window.deleteAllData = deleteAllData;
  window.loadBookmarks = loadBookmarks;
  window.saveData = saveData;

  initDB();
});
