$(document).ready(function () {
  let currentSectionId;
  let currentLinkIndex;
  let isEditMode = localStorage.getItem("isEditMode") === "true";

  // Gestion du bouton de bascule pour le mode édition
  $("#editModeToggle").on("click", function () {
    isEditMode = !isEditMode;
    localStorage.setItem("isEditMode", isEditMode);
    toggleEditModeDisplay();
  });

  function redirectToWeb() {
    const urlInput = $("#URL").val().trim();
    const url =
      urlInput.startsWith("http://") || urlInput.startsWith("https://")
        ? urlInput
        : `https://${urlInput}`;
    window.location.href = url;
  }

  function showToast(message) {
    const $toast = $("<div>").addClass("toast").text(message);
    $("body").append($toast);

    setTimeout(() => $toast.addClass("visible"), 100);
    setTimeout(() => {
      $toast.removeClass("visible");
      setTimeout(() => $toast.remove(), 300);
    }, 3000);
  }

  function isValidURL(url) {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([\\w-]+\\.)+[\\w-]+)|localhost)" +
        "(\\:\\d+)?(\\/[-\\w@:%_+.~#?&//=]*)?$",
      "i"
    );
    return !!pattern.test(url);
  }

  function toggleEditModeDisplay() {
    $(".editable").each(function () {
      $(this).css("display", isEditMode ? "inline-block" : "none");
    });
    $("#editModeToggle").html(
      isEditMode ? "🚪 Quitter mode édition" : "✏️ Mode édition"
    );
  }

  toggleEditModeDisplay();

  function uploadBookmarks() {
    const fileInput = $("#jsonFileInput")[0];
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        const data = JSON.parse(event.target.result);

        if (data.sections && data.language) {
          window.bookmarksData.sections = data.sections;
          saveData();
          renderBookmarks();

          const transaction = db.transaction("sectionsStore", "readwrite");
          const objectStore = transaction.objectStore("sectionsStore");
          objectStore.put({ id: "language", value: data.language });

          $("#languageSelect").val(data.language);
          loadLanguage(data.language);

          $("#uploadModal").modal("hide");
        } else {
          alert(
            "Fichier JSON invalide. Assurez-vous qu'il contient les champs 'language' et 'sections'."
          );
        }
      };
      reader.readAsText(file);
    } else {
      alert("Veuillez sélectionner un fichier JSON.");
    }
  }

  function downloadBookmarks() {
    const transaction = db.transaction("sectionsStore", "readonly");
    const objectStore = transaction.objectStore("sectionsStore");

    const requestLang = objectStore.get("app_language");
    requestLang.onsuccess = function () {
      const language = requestLang.result ? requestLang.result.value : "fr";

      const sections = window.bookmarksData.sections.map((section) => ({
        id: section.id,
        title: section.title,
        links: section.links || [],
        position: section.position || 0,
      }));

      const exportData = { language: language, sections: sections };

      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = $("<a>")
        .attr({
          href: url,
          download: "bookmarks.json",
        })
        .appendTo("body");
      link[0].click();
      link.remove();

      URL.revokeObjectURL(url);
    };
  }

  function renderBookmarks() {
    $("#bookmarkContainer").empty();

    window.bookmarksData.sections.sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );

    window.bookmarksData.sections.forEach((section) => {
      const sectionHtml = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4 bookmark-section" id="${
              section.id
            }">
                <div class="bookmark-title">${section.title}
                    <span class="edit-icon ml-2 editable" onclick="openEditSectionModal('${
                      section.id
                    }')">✏️</span>
                    <span class="add-link-icon ml-2 editable" onclick="openAddLinkModal('${
                      section.id
                    }')">➕</span>
                    <span class="delete-icon ml-2 editable" onclick="deleteSection('${
                      section.id
                    }')">🗑️</span>
                </div>
                <ul class="list-group sortable-links" id="links-${section.id}">
                    ${section.links
                      .map(
                        (link, index) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}" data-parent-id="${
                          link.parentId || ""
                        }"
                            style="padding-left: ${link.paddingLeft || 0}px;">
                            <div class="d-flex align-items-center">
                                <img src="https://www.google.com/s2/favicons?sz=32&domain=${
                                  new URL(link.url).hostname
                                }" 
                                     alt="favicon" style="width: 16px; height: 16px; margin-right: 5px;" 
                                     onerror="this.style.display='none'">
                                <a href="${
                                  link.url
                                }" style="text-decoration: none;">${
                          link.title
                        }</a>
                            </div>
                            <div>
                                <span class="arrow-icon editable" onclick="moveLeft('${
                                  section.id
                                }', ${index})">⬅️</span>
                                <span class="arrow-icon editable" onclick="moveRight('${
                                  section.id
                                }', ${index})">➡️</span>
                                <span class="edit-icon ml-2 editable" onclick="openEditLinkModal('${
                                  section.id
                                }', ${index})">✏️</span>
                                <span class="delete-icon editable" onclick="deleteLink('${
                                  section.id
                                }', '${link.title}')">🗑️</span>
                            </div>
                        </li>`
                      )
                      .join("")}
                </ul>
            </div>`;
      $("#bookmarkContainer").append(sectionHtml);
    });

    // Initialisation du tri
    $("#bookmarkContainer").sortable({
      handle: ".bookmark-title",
      update: function () {
        const sortedIDs = $("#bookmarkContainer").sortable("toArray");
        window.bookmarksData.sections.sort(
          (a, b) => sortedIDs.indexOf(a.id) - sortedIDs.indexOf(b.id)
        );
        saveSectionOrder();
      },
    });

    $(".sortable-links").sortable({
      connectWith: ".sortable-links",
      update: function (event, ui) {
        const sectionId = $(this).attr("id").replace("links-", "");
        updateLinkOrder(sectionId);
      },
    });

    toggleEditModeDisplay();
  }

  // Expose renderBookmarks globalement

  renderBookmarks();

  // Mettre à jour l'ordre des sections dans la base de données
  function updateSectionOrder() {
    $("#bookmarkContainer .bookmark-section").each(function (index) {
      const sectionId = $(this).attr("id");
      const section = window.bookmarksData.sections.find(
        (s) => s.id === sectionId
      );
      section.position = index;
      saveSection(section);
    });
  }

  function updateLinkOrder(sectionId) {
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );

    const sortedLinks = $(`#links-${sectionId} .list-group-item`)
      .map(function () {
        const index = $(this).data("index");
        return section.links[index];
      })
      .get();

    section.links = sortedLinks;
    saveSection(section);
  }

  // Fonction pour sauvegarder les signets sur le serveur
  async function saveBookmarksToServer() {
    const token = localStorage.getItem("jwtToken"); // Récupérer le jeton JWT
    if (!token) {
      console.error("Token JWT manquant.");
      return;
    }

    await fetch("saveBookmarks.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token, // Envoyer le jeton dans le corps de la requête
        bookmarks: window.bookmarksData.sections, // Inclure les données des signets
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Signets sauvegardés avec succès.");
        } else {
          console.error(
            data.message || "Erreur lors de la sauvegarde des signets."
          );
        }
      })
      .catch((error) => console.error("Erreur de réseau :", error));
  }

  function deleteSection(sectionId) {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.delete(sectionId);

    transaction.oncomplete = function () {
      console.log("Section supprimée:", sectionId);

      // Mettre à jour les sections dans `bookmarksData`
      window.bookmarksData.sections = window.bookmarksData.sections.filter(
        (section) => section.id !== sectionId
      );

      // Charger les signets mis à jour dans l'affichage
      renderBookmarks();

      // Envoyer les signets au serveur
      saveBookmarksToServer();
    };

    transaction.onerror = function (event) {
      console.error(
        "Erreur lors de la suppression de la section:",
        event.target.errorCode
      );
    };
  }

  function submitLink() {
    const sectionId = $("#currentSectionId").val();
    const title = $("#linkTitle").val().trim();
    const url = $("#linkURL").val().trim();

    if (title && isValidURL(url)) {
      const section = window.bookmarksData.sections.find(
        (s) => s.id === sectionId
      );
      if (section) {
        section.links.push({ title, url, parentId: null });
        saveSection(section);
        $("#addLinkModal").modal("hide");
      } else {
        console.error("Section introuvable pour l'ajout du lien.");
      }
    } else {
      alert("Veuillez entrer un nom de lien valide et une URL correcte.");
    }
  }

  function moveRight(sectionId, linkIndex) {
    console.log("moveRight OK : " + linkIndex);
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );

    if (section && section.links[linkIndex]) {
      // Augmente le décalage de 10px
      const currentPadding = section.links[linkIndex].paddingLeft || 0;
      section.links[linkIndex].paddingLeft = currentPadding + 10;

      // Sauvegarde la section pour synchroniser avec le serveur
      saveSection(section);

      // Actualise l'affichage directement sans recharger toute la liste
      const listItem = $(`#links-${sectionId} .list-group-item`).eq(linkIndex);
      listItem.css("padding-left", section.links[linkIndex].paddingLeft + "px");

      console.log(
        `Link at index ${linkIndex} in section ${sectionId} moved right and saved to server.`
      );
    } else {
      console.warn("Lien non trouvé ou index invalide.");
    }
  }

  function moveLeft(sectionId, linkIndex) {
    console.log("moveLeft OK : " + linkIndex);
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );

    if (section && section.links[linkIndex]) {
      // Diminue le décalage de 10px sans passer en-dessous de zéro
      const currentPadding = section.links[linkIndex].paddingLeft || 0;
      section.links[linkIndex].paddingLeft = Math.max(currentPadding - 10, 0);

      // Sauvegarde la section pour synchroniser avec le serveur
      saveSection(section);

      // Actualise l'affichage directement sans recharger toute la liste
      const listItem = $(`#links-${sectionId} .list-group-item`).eq(linkIndex);
      listItem.css("padding-left", section.links[linkIndex].paddingLeft + "px");

      console.log(
        `Link at index ${linkIndex} in section ${sectionId} moved left and saved to server.`
      );
    } else {
      console.warn("Lien non trouvé ou index invalide.");
    }
  }

  function openEditLinkModal(sectionId, linkIndex) {
    currentSectionId = sectionId;
    currentLinkIndex = linkIndex;
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );
    const link = section.links[linkIndex];
    $("#editLinkTitle").val(link.title);
    $("#editLinkURL").val(link.url);
    $("#editLinkModal").modal("show");
  }

  function updateLink() {
    const newTitle = $("#editLinkTitle").val().trim();
    const newUrl = $("#editLinkURL").val().trim();
    if (newTitle && isValidURL(newUrl)) {
      const section = window.bookmarksData.sections.find(
        (s) => s.id === currentSectionId
      );
      section.links[currentLinkIndex].title = newTitle;
      section.links[currentLinkIndex].url = newUrl;
      saveSection(section);
      $("#editLinkModal").modal("hide");
    } else {
      alert("Veuillez entrer un nom et une URL valides.");
    }
  }

  function deleteLink(sectionId, linkTitle) {
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );
    section.links = section.links.filter((link) => link.title !== linkTitle);
    saveSection(section);
  }

  window.deleteSection = deleteSection;
  window.deleteLink = deleteLink;
  window.saveBookmarksToServer = saveBookmarksToServer;
  window.submitLink = submitLink;
  window.renderBookmarks = renderBookmarks;
  window.openEditLinkModal = openEditLinkModal;
  window.updateLink = updateLink;
  window.moveRight = moveRight;
  window.moveLeft = moveLeft;
  window.updateSectionOrder = updateSectionOrder;
  window.redirectToWeb = redirectToWeb;
  window.showToast = showToast;
  window.uploadBookmarks = uploadBookmarks;
  window.downloadBookmarks = downloadBookmarks;
});
