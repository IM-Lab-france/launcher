$(document).ready(function () {
  let translations = {};

  // Charger les traductions depuis un fichier JSON
  function loadTranslations() {
    return $.ajax({
      url: "translations.json",
      dataType: "json",
      success: function (data) {
        translations = data;
        populateLanguageOptions(); // Charger dynamiquement les options de langue
      },
      error: function () {
        console.error("Erreur lors du chargement des traductions.");
      },
    });
  }

  const jwtToken = localStorage.getItem("jwtToken");

  // Détecter la langue du navigateur et définir la langue par défaut
  function getBrowserLanguage() {
    const browserLang = navigator.language.slice(0, 2); // Extraire le code de langue (ex: "fr")
    return translations[browserLang] ? browserLang : "en"; // Retourne "en" si la langue du navigateur n'existe pas
  }

  // Charger la langue de l'utilisateur depuis le serveur ou appliquer la langue du navigateur par défaut
  function loadUserLanguage() {
    $.ajax({
      url: "getLanguage.php",
      type: "POST",
      data: JSON.stringify({ token: jwtToken }),
      contentType: "application/json",
      dataType: "json",
      success: function (response) {
        const language = response.language || getBrowserLanguage();
        loadLanguage(language);
        $("#selectedFlag").attr("src", `img/${language}-flag.png`);
      },
      error: function () {
        console.error("Erreur lors de la récupération de la langue.");
        const defaultLanguage = getBrowserLanguage();
        loadLanguage(defaultLanguage); // Définit la langue par défaut du navigateur
        $("#selectedFlag").attr("src", `img/${defaultLanguage}-flag.png`);
      },
    });
  }

  // Sauvegarder la langue de l'utilisateur sur le serveur
  function saveLanguage(language) {
    $.ajax({
      url: "saveLanguage.php",
      type: "POST",
      data: JSON.stringify({ language, token: jwtToken }),
      contentType: "application/json",
      success: function () {
        console.log("Langue sauvegardée:", language);
      },
      error: function () {
        console.error("Erreur lors de la sauvegarde de la langue.");
      },
    });
  }

  // Récupérer l'image du drapeau correspondant
  function getFlagImage(language) {
    return `${language}-flag.png`;
  }

  // Charger les options de langue dynamiquement dans le sélecteur de langue
  function populateLanguageOptions() {
    const languageSelect = $("#languageSelect .options");
    languageSelect.empty(); // Vider les options existantes

    // Trier les langues par ordre alphabétique, avec la langue du navigateur en premier
    const sortedLanguages = Object.keys(translations).sort((a, b) => {
      const browserLanguage = getBrowserLanguage();
      if (a === browserLanguage) return -1; // Place la langue du navigateur en premier
      if (b === browserLanguage) return 1;
      return translations[a].languageName.localeCompare(
        translations[b].languageName
      );
    });

    sortedLanguages.forEach((langCode) => {
      const flagImg = `img/${getFlagImage(langCode)}`;
      const langOption = `
        <div class="option" data-lang="${langCode}">
          <img src="${flagImg}" alt="${langCode}" class="flag"> ${translations[langCode].languageName}
        </div>`;
      languageSelect.append(langOption);
    });

    // Ajouter le gestionnaire d'événements pour chaque option de langue
    $(".option").on("click", function () {
      const selectedLanguage = $(this).data("lang");
      $("#selectedFlag").attr("src", `img/${getFlagImage(selectedLanguage)}`);
      loadLanguage(selectedLanguage);
      saveLanguage(selectedLanguage);
      languageSelect.hide(); // Fermer le menu après sélection
    });
  }

  // Charger les signets et la langue par défaut dans IndexedDB
  function loadDefaultLanguageAndBookmarks() {
    if (!db) {
      console.error("Base de données non disponible.");
      return;
    }

    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    const requestLang = objectStore.get("app_language");
    requestLang.onsuccess = function () {
      const language = requestLang.result ? requestLang.result.value : "fr";
      loadLanguage(language);
      $("#selectedFlag").attr("src", `img/${getFlagImage(language)}`);
    };

    const requestSections = objectStore.getAll();
    requestSections.onsuccess = function (event) {
      bookmarksData.sections = event.target.result.filter(
        (section) => section.id !== "app_language"
      );
      bookmarksData.sections.forEach(
        (section) => (section.links = section.links || [])
      );
      renderBookmarks();
    };

    requestSections.onerror = function (event) {
      console.error(
        "Erreur lors de la récupération des sections:",
        event.target.errorCode
      );
    };
  }

  // Appliquer les traductions en fonction de la langue et de l'état de connexion
  function loadLanguage(language) {
    const elementsToTranslate = {
      new: "new",
      delete: "delete",
      infoText: "infoText",
      title: "title",
      editModeToggle: $("#editModeToggle").hasClass("active")
        ? "editModeOff"
        : "editModeOn",
      authLink: jwtToken ? "logout" : "login", // Utiliser le jeton pour déterminer l'état de connexion
    };

    $.each(elementsToTranslate, function (key, translationKey) {
      const $element = $(`#${key}`);
      if ($element.length) {
        let icon = "";

        if (translationKey === "login" || translationKey === "logout") {
          icon = jwtToken ? "🔓" : "🔒"; // Afficher Déconnexion si authentifié
        } else if (
          translationKey === "editModeOn" ||
          translationKey === "editModeOff"
        ) {
          icon = $("#editModeToggle").hasClass("active") ? "✅" : "✏️";
        }

        $element.html(`${icon} ${translations[language][translationKey]}`);
      } else {
        console.warn(`Élément avec l'ID '${key}' introuvable.`);
      }
    });
  }

  // Gestion du changement de langue via le sélecteur
  $("#languageSelect").on("click", function () {
    $(this).find(".options").toggle();
  });

  $("#languageSelect").on("focusout", function () {
    $(this).find(".options").hide();
  });

  // Charger les traductions, signets et langue de l'utilisateur
  loadTranslations().then(() => {
    loadUserLanguage();
    if (db) loadDefaultLanguageAndBookmarks();
  });

  window.loadLanguage = loadLanguage;
});
