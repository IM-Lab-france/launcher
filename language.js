$(document).ready(function () {
  const translations = {
    fr: {
      new: "Nouvelle section",
      load: "Charger un Bookmark",
      download: "Sauvegarder un Bookmark",
      delete: "Tout effacer",
      infoText: "Entrez une URL pour l'afficher dans cette fenêtre",
      title: "Gestion des signets",
    },
    en: {
      new: "New Section",
      load: "Load Bookmark",
      download: "Download Bookmark",
      delete: "Delete all",
      infoText: "Enter URL to display it in this window.",
      title: "Bookmarks Manager",
    },
  };

  function saveLanguage(language) {
    if (!db) {
      console.error(
        "Base de données non disponible pour sauvegarder la langue."
      );
      return;
    }

    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.put({ id: "app_language", value: language });

    transaction.oncomplete = function () {
      console.log("Langue sauvegardée:", language);
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la sauvegarde de la langue:",
        event.target.errorCode
      );
    };
  }

  function loadDefaultLanguageAndBookmarks() {
    if (!db) {
      console.error(
        "Base de données non disponible pour charger la langue et les signets."
      );
      return;
    }

    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    const requestLang = objectStore.get("app_language");
    requestLang.onsuccess = function () {
      const $languageSelect = $("#languageSelect");
      if (!$languageSelect.length) {
        console.error("Élément 'languageSelect' introuvable dans le DOM.");
        return;
      }

      const language = requestLang.result ? requestLang.result.value : "fr";
      $languageSelect.val(language);
      loadLanguage(language);
    };

    const requestSections = objectStore.getAll();
    requestSections.onsuccess = function (event) {
      bookmarksData.sections = event.target.result.filter(
        (section) => section.id !== "app_language"
      );

      bookmarksData.sections.forEach((section) => {
        section.links = section.links || [];
      });

      renderBookmarks();
    };

    requestSections.onerror = function (event) {
      console.error(
        "Erreur lors de la récupération des sections:",
        event.target.errorCode
      );
    };
  }

  function loadLanguage(language) {
    const elementsToTranslate = {
      new: "new",
      load: "load",
      download: "download",
      delete: "delete",
      infoText: "infoText",
      title: "title",
    };

    $.each(elementsToTranslate, function (key, elementId) {
      const $element = $(`#${elementId}`);
      if ($element.length) {
        $element.text(translations[language][key]);
      } else {
        console.warn(`Élément avec l'ID '${elementId}' introuvable.`);
      }
    });
  }

  const checkLanguageSelect = setInterval(() => {
    const $languageSelect = $("#languageSelect");
    if ($languageSelect.length) {
      clearInterval(checkLanguageSelect);
      $languageSelect.on("change", function () {
        const selectedLanguage = $(this).val();
        loadLanguage(selectedLanguage);
        saveLanguage(selectedLanguage);
      });

      if (db) {
        loadDefaultLanguageAndBookmarks();
      }
    }
  }, 100);

  window.loadLanguage = loadLanguage;
});
