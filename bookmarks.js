$(document).ready(function () {
  let currentSectionId;
  let currentLinkIndex;
  let isEditMode = localStorage.getItem("isEditMode") === "true";

  window.favorisData = [];

  // Fonction pour ajouter un favori
  function addFavori(link) {
    if (!window.favorisData.includes(link)) {
      window.favorisData.push(link);
      renderFavoris();
      saveBookmarksToServer();
      adjustSpacerHeight();
    }
  }

  // Fonction pour retirer un favori
  function removeFavori(link) {
    window.favorisData = window.favorisData.filter(
      (fav) => fav.url !== link.url
    );
    renderFavoris();
    saveBookmarksToServer();
    adjustSpacerHeight();
  }

  // Fonction pour afficher les favoris
  function renderFavoris() {
    const favorisBar = document.getElementById("favorisBar");
    favorisBar.innerHTML = ""; // Vide l'affichage des favoris actuels

    window.favorisData.forEach((link, index) => {
      const favoriItem = document.createElement("div");
      favoriItem.className = "favori-item";
      favoriItem.draggable = true;

      favoriItem.onclick = () => {
        window.location.href = link.url;
      };
      favoriItem.style.cursor = "pointer"; // Changer le curseur pour pointer

      favoriItem.title = link.title;

      // Gestion du glisser-déposer pour l'organisation
      favoriItem.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", index);
      });
      favoriItem.addEventListener("drop", (event) => {
        event.preventDefault();
        const draggedIndex = event.dataTransfer.getData("text/plain");
        const [draggedFavori] = window.favorisData.splice(draggedIndex, 1);
        window.favorisData.splice(index, 0, draggedFavori);
        renderFavoris();
        saveBookmarksToServer();
      });
      favoriItem.addEventListener("dragover", (event) =>
        event.preventDefault()
      );

      // Icone de favori (favicon de l'URL)
      const icon = document.createElement("div");
      icon.className = "favori-icon";

      // Ajout de l'icône de suppression en haut de l'image

      const detachIcon = document.createElement("span");
      detachIcon.innerText = "❌";
      detachIcon.className = "detach-icon editable"; // Classe pour positionnement
      detachIcon.onclick = () => removeFavori(link);
      icon.appendChild(detachIcon);

      const favicon = document.createElement("img");
      favicon.src = `https://www.google.com/s2/favicons?sz=32&domain=${
        new URL(link.url).hostname
      }`;
      favicon.alt = link.title;
      favicon.onerror = () => (favicon.style.display = "none"); // Cache l'image si elle ne se charge pas
      icon.appendChild(favicon);

      // Titre du favori avec limite de caractères
      const title = document.createElement("div");
      title.className = "favori-title";
      title.innerText =
        link.title.length > 9 ? link.title.slice(0, 9) + "..." : link.title;

      favoriItem.appendChild(icon);
      favoriItem.appendChild(title);
      favorisBar.appendChild(favoriItem);
    });
  }

  // Fonction pour attacher/détacher un lien dans les favoris
  function toggleFavori(sectionId, linkIndex) {
    const section = window.bookmarksData.sections.find(
      (s) => s.id === sectionId
    );
    const link = section.links[linkIndex];
    if (window.favorisData.find((fav) => fav.url === link.url)) {
      removeFavori(link);
    } else {
      addFavori(link);
    }
  }

  // Gestion du bouton de bascule pour le mode édition
  $("#editModeToggle").on("click", function () {
    isEditMode = !isEditMode;
    localStorage.setItem("isEditMode", isEditMode);
    toggleEditModeDisplay();
  });

  function redirectToWeb() {
    const urlInput = $("#search").val().trim();

    // Vérifie si l'entrée est une URL (avec ou sans 'http'/'https')
    const isUrl =
      urlInput.startsWith("http://") ||
      urlInput.startsWith("https://") ||
      /^[\w-]+\.\w+/.test(urlInput);
    const url = isUrl
      ? urlInput.startsWith("http://") || urlInput.startsWith("https://")
        ? urlInput
        : `https://${urlInput}`
      : `https://www.google.com/search?q=${encodeURIComponent(urlInput)}`; // Remplace 'google.com' par un autre moteur si besoin

    window.location.href = url;
  }

  $("#search").on("keydown", function (event) {
    // Vérifie si la touche pressée est Entrée (code 13)
    if (event.key === "Enter") {
      event.preventDefault(); // Empêche l'action par défaut du formulaire si besoin
      redirectToWeb(); // Appelle la fonction de redirection
    }
  });

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

  function saveSectionOrder() {
    // Mettre à jour la position de chaque section dans bookmarksData
    $("#bookmarkContainer .bookmark-section").each(function (index) {
      const sectionId = $(this).attr("id");
      const section = window.bookmarksData.sections.find(
        (s) => s.id === sectionId
      );
      if (section) {
        section.position = index;
      }
    });

    // Sauvegarder l'ordre des sections sur le serveur
    saveBookmarksToServer();
  }

  function renderBookmarks(
    bookmarksData = {
      bookmarks: window.bookmarksData.sections,
      favoris: window.favorisData,
    }
  ) {
    // Vérification et assignation de la structure correcte
    const sectionsData = bookmarksData.bookmarks
      ? bookmarksData.bookmarks.bookmarks
      : window.bookmarksData.sections;
    const favorisData = bookmarksData.bookmarks
      ? bookmarksData.bookmarks.favoris
      : window.favorisData;

    // Charger les sections et favoris depuis les données passées ou les valeurs globales
    window.bookmarksData.sections = Array.isArray(sectionsData)
      ? sectionsData
      : [];
    window.favorisData = Array.isArray(favorisData) ? favorisData : [];

    // Rendu de la barre de favoris
    renderFavoris();

    // Trier les sections en fonction de leur position
    window.bookmarksData.sections.sort(
      (a, b) => (a.position || 0) - (b.position || 0)
    );
    // Vider le conteneur de bookmarks
    $("#bookmarkContainer").empty();
    // Rendu de chaque section
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
                        }">
    <div class="d-flex align-items-center">
        <img src="https://www.google.com/s2/favicons?sz=32&domain=${
          new URL(link.url).hostname
        }" 
            alt="favicon" style="width: 16px; height: 16px; margin-right: 5px;" 
            onerror="this.style.display='none'">
        <a href="${link.url}" style="text-decoration: none;">${link.title}</a>
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
        <span class="favorite-icon" onclick="toggleFavori('${
          section.id
        }', ${index})">${
                          window.favorisData.find((fav) => fav.url === link.url)
                            ? "🟢"
                            : "⚫"
                        }</span>
    </div>
</li>`
                      )
                      .join("")}

                </ul>
            </div>`;
      $("#bookmarkContainer").append(sectionHtml);
    });

    // Initialisation du tri pour les sections et les liens
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
    adjustSpacerHeight();
  }

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
    console.log(
      "Données des signets avant envoi au serveur:",
      window.bookmarksData.sections
    );
    if (!token) {
      console.error("Token JWT manquant.");
      return;
    }

    // Inclure les favoris dans les données des signets
    const bookmarksDataWithFavoris = {
      bookmarks: window.bookmarksData.sections,
      favoris: window.favorisData, // Ajouter les favoris
    };

    await fetch("saveBookmarks.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token, // Envoyer le jeton dans le corps de la requête
        bookmarks: bookmarksDataWithFavoris, // Inclure les données des signets
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("Signets sauvegardés avec succès.");
          loadServerBookmarks();
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

  function adjustSpacerHeight() {
    const favorisBar = document.getElementById("favorisBar");
    const spacer = document.getElementById("spacer");
    spacer.style.height = `${favorisBar.offsetHeight + 15}px`;
  }

  renderFavoris(); // Afficher les favoris au chargement
  renderBookmarks();
  toggleEditModeDisplay();
  adjustSpacerHeight();

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

  window.toggleFavori = toggleFavori;
});
