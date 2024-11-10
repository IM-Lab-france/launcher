$(document).ready(function () {
  const translations = {
    fr: {
      new: "Nouvelle section",
      load: "Charger un Bookmark",
      download: "Sauvegarder un Bookmark",
      delete: "Tout effacer",
      infoText: "Entrez une URL pour l'afficher dans cette fenêtre",
      title: "Gestion des signets",
      editModeOn: "Mode Édition",
      editModeOff: "Quitter Édition",
      login: "Connexion",
      logout: "Déconnexion",
    },
    en: {
      new: "New Section",
      load: "Load Bookmark",
      download: "Download Bookmark",
      delete: "Delete all",
      infoText: "Enter URL to display it in this window.",
      title: "Bookmarks Manager",
      editModeOn: "Edit Mode",
      editModeOff: "Exit Edit Mode",
      login: "Login",
      logout: "Logout",
    },
  };

  const jwtToken = localStorage.getItem("jwtToken");

  // Récupérer la langue de l'utilisateur au chargement de la page
  function loadUserLanguage() {
    $.ajax({
      url: "getLanguage.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ token: jwtToken }),
      success: function (response) {
        if (response.success) {
          const language = response.language || "fr";
          loadLanguage(language);
          $("#selectedFlag").attr(
            "src",
            `img/${language === "fr" ? "french" : "english"}-flag.png`
          );
        } else {
          console.warn(response.message);
          loadLanguage("fr"); // Langue par défaut si aucune préférence n'est trouvée
        }
      },
      error: function () {
        console.error("Erreur lors de la récupération de la langue.");
        loadLanguage("fr"); // Langue par défaut en cas d'erreur
      },
    });
  }

  // Sauvegarder la langue de l'utilisateur dans la base de données
  function saveLanguage(language) {
    $.ajax({
      url: "saveLanguage.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ token: jwtToken, language }),
      success: function (response) {
        if (response.success) {
          console.log("Langue sauvegardée:", language);
        } else {
          console.warn(response.message);
        }
      },
      error: function () {
        console.error("Erreur lors de la sauvegarde de la langue.");
      },
    });
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
      const language = requestLang.result ? requestLang.result.value : "fr";
      loadLanguage(language);
      $("#selectedFlag").attr(
        "src",
        `img/${language === "fr" ? "french" : "english"}-flag.png`
      );
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

  function loadLanguage(language) {
    const elementsToTranslate = {
      new: "new",
      load: "load",
      download: "download",
      delete: "delete",
      infoText: "infoText",
      title: "title",
    };

    const isEditMode = $("#editModeToggle").hasClass("active"); // Suppose un état actif pour l'édition
    const isLoggedIn = $("#authLink").data("loggedIn"); // Suppose un attribut pour l'état de connexion

    elementsToTranslate.editModeToggle = isEditMode
      ? "editModeOff"
      : "editModeOn";
    elementsToTranslate.authLink = isLoggedIn ? "logout" : "login";

    $.each(elementsToTranslate, function (key, translationKey) {
      const $element = $(`#${key}`);
      if ($element.length) {
        let icon = "";

        if (translationKey === "login" || translationKey === "logout") {
          icon = isLoggedIn ? "🔓" : "🔒";
        } else if (
          translationKey === "editModeOn" ||
          translationKey === "editModeOff"
        ) {
          icon = isEditMode ? "✅" : "✏️";
        }

        $element.html(`${icon} ${translations[language][translationKey]}`);
      } else {
        console.warn(`Élément avec l'ID '${key}' introuvable.`);
      }
    });
  }

  // Gestion du changement de langue via le sélecteur personnalisé
  $("#languageSelect").on("click", function () {
    $(this).find(".options").toggle();
  });

  $("#languageSelect .option").on("click", function () {
    const selectedLanguage = $(this).data("lang");
    $("#selectedFlag").attr(
      "src",
      `img/${selectedLanguage === "fr" ? "french" : "english"}-flag.png`
    );
    loadLanguage(selectedLanguage);
    saveLanguage(selectedLanguage);
    $(this).closest(".options").hide(); // Ferme le menu après avoir sélectionné une langue
  });

  $("#languageSelect").on("focusout", function () {
    $(this).find(".options").hide();
  });

  // Charger les signets et la langue de l'utilisateur si disponibles
  if (db) {
    loadDefaultLanguageAndBookmarks();
  }

  // Charger la langue de l'utilisateur lors de l'initialisation
  loadUserLanguage();

  window.loadLanguage = loadLanguage;
});
