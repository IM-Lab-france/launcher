let currentSectionId;
let currentLinkIndex;
let isEditMode = localStorage.getItem("isEditMode") === "true";
console.log(isEditMode);
// Gestion du bouton de bascule pour le mode édition
document.getElementById("editModeToggle").addEventListener("click", function() {
    isEditMode = !isEditMode;
    localStorage.setItem("isEditMode", isEditMode); // Enregistrer l'état dans Local Storage
    toggleEditModeDisplay();
});

function isValidURL(url) {
    const pattern = new RegExp(
        "^(https?:\\/\\/)?" +                      // Protocole facultatif
        "((([\\w-]+\\.)+[\\w-]+)|localhost)" +     // Nom de domaine ou "localhost"
        "(\\:\\d+)?(\\/[-\\w@:%_+.~#?&//=]*)?$",   // Port et chemin facultatifs
        "i"                                        // Ignore la casse
    );
    return !!pattern.test(url);
}

// Fonction pour afficher ou masquer les éléments éditables
function toggleEditModeDisplay() {
    const editableElements = document.querySelectorAll(".editable");
    editableElements.forEach(el => {
        el.style.display = isEditMode ? "inline-block" : "none";
    });

    // Change le texte et l'icône du bouton de bascule
    document.getElementById("editModeToggle").innerHTML = isEditMode 
        ? "Quitter le mode édition 🚪" 
        : "Edition ✏️";
}

// Appeler `toggleEditModeDisplay()` au chargement de la page pour appliquer l'état de `isEditMode`
document.addEventListener("DOMContentLoaded", function() {
    // Initialiser l'état de `isEditMode` à partir de Local Storage
    isEditMode = localStorage.getItem("isEditMode") === "true";

    // Rendre les bookmarks et appliquer le mode édition si nécessaire
    renderBookmarks();
    toggleEditModeDisplay();  // S'assurer que les éléments éditables s'affichent selon `isEditMode`
});

function uploadBookmarks() {
    const fileInput = document.getElementById('jsonFileInput');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = JSON.parse(event.target.result);

            // Validation de la structure
            if (data.sections && data.language) {
                bookmarksData.sections = data.sections;

                // Sauvegarder les sections
                saveData();
                renderBookmarks();

                // Enregistrer la langue dans la base de données
                const transaction = db.transaction("sectionsStore", "readwrite");
                const objectStore = transaction.objectStore("sectionsStore");
                objectStore.put({ id: "language", value: data.language });

                // Appliquer la langue importée
                document.getElementById('languageSelect').value = data.language;
                loadLanguage(data.language);

                $('#uploadModal').modal('hide');
            } else {
                alert("Fichier JSON invalide. Assurez-vous qu'il contient les champs 'language' et 'sections'.");
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

    // Récupérer la langue
    const requestLang = objectStore.get("app_language");
    requestLang.onsuccess = function() {
        const language = requestLang.result ? requestLang.result.value : "fr";

        // Préparer les sections pour l'export
        const sections = bookmarksData.sections.map(section => ({
            id: section.id,
            title: section.title,
            links: section.links || [],
            position: section.position || 0
        }));

        // Exporter avec la langue et les sections séparées
        const exportData = { language: language, sections: sections };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'bookmarks.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };
}




// Rendre les liens dans chaque section réordonnables
bookmarksData.sections.forEach((section) => {
    $(`#links-${section.id}`).sortable({
        update: function(event, ui) {
            const sortedLinks = $(`#links-${section.id} .list-group-item`).map((_, el) => ({
                index: $(el).data("index"),
                parentId: $(el).data("parent-id")
            })).get();

            // Réorganiser les liens en tenant compte des sous-URL
            section.links = sortedLinks.map(item => {
                const link = section.links[item.index];
                link.parentId = item.parentId || null;
                return link;
            });
            
            saveSection(section);
        }
    });
});

function renderBookmarks() {
    $('#bookmarkContainer').empty();
  
  // Tri des sections avant affichage pour garantir l'ordre
  bookmarksData.sections.sort((a, b) => (a.position || 0) - (b.position || 0));

  // Rendu de chaque section sans ajout non voulu
  bookmarksData.sections.forEach((section) => {
    const sectionHtml = `
      <div class="col-lg-4 col-md-6 col-sm-12 mb-4 bookmark-section" id="${section.id}">
        <div class="bookmark-title">${section.title}
          <span class="edit-icon ml-2 editable" onclick="openEditSectionModal('${section.id}')">✏️</span>
          <span class="add-link-icon ml-2 editable" onclick="openAddLinkModal('${section.id}')">➕</span>
          <span class="delete-icon ml-2 editable" onclick="deleteSection('${section.id}')">🗑️</span>
        </div>
        <ul class="list-group  sortable-links" id="links-${section.id}">
          ${section.links.map((link, index) => `
            <li class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}" data-parent-id="${link.parentId || ''}">

            <div class="d-flex align-items-center" style="padding-left: ${link.parentId ? '30px' : '0px'};">
            <img src="https://www.google.com/s2/favicons?sz=32&domain=${new URL(link.url).hostname}" 
                 alt="favicon" style="width: 16px; height: 16px; margin-right: 5px;" 
                 onerror="this.style.display='none'">
            <a href="${link.url}" style="text-decoration: none;">${link.title}</a>
          </div>
              <div>
                <span class="arrow-icon editable" onclick="moveLeft('${section.id}', ${index})">⬅️</span>
                <span class="arrow-icon editable" onclick="moveRight('${section.id}', ${index})">➡️</span>
                <span class="edit-icon ml-2 editable" onclick="openEditLinkModal('${section.id}', ${index})">✏️</span>
                <span class="delete-icon editable" onclick="deleteLink('${section.id}', '${link.title}')">🗑️</span>
              </div>
            </li>`).join('')}
        </ul>
      </div>`;
    $('#bookmarkContainer').append(sectionHtml);
  });

    // Rendre les sections réordonnables et sauvegarder leur ordre
    $('#bookmarkContainer').sortable({
        handle: ".bookmark-title",
        update: function(event, ui) {
          const sortedIDs = $('#bookmarkContainer').sortable('toArray');
          bookmarksData.sections.sort((a, b) => sortedIDs.indexOf(a.id) - sortedIDs.indexOf(b.id));
          
          // Sauvegarder l'ordre des sections triées
          saveSectionOrder();
        }
      });

    // Rendre les liens dans chaque section réordonnables
    // Rendre les liens dans chaque section réordonnables
    $('.sortable-links').sortable({
        connectWith: '.sortable-links', // Permet le déplacement entre listes
        update: function(event, ui) {
            const sectionId = $(this).attr('id').replace('links-', '');
            updateLinkOrder(sectionId);
        }
    });

    toggleEditModeDisplay(); // Assure que les éléments éditables sont visibles selon le mode
}

// Mettre à jour l'ordre des sections dans la base de données
function updateSectionOrder() {
    $('#bookmarkContainer .bookmark-section').each(function(index) {
        const sectionId = $(this).attr('id');
        const section = bookmarksData.sections.find(s => s.id === sectionId);
        section.position = index; // Mettre à jour la position

        saveSection(section); // Sauvegarde en base de données
    });
}

// Mettre à jour l'ordre des liens dans une section
function updateLinkOrder(sectionId) {
    const section = bookmarksData.sections.find(s => s.id === sectionId);

    const sortedLinks = $(`#links-${sectionId} .list-group-item`).map(function() {
        const index = $(this).data('index');
        return section.links[index];
    }).get();

    section.links = sortedLinks; // Met à jour l'ordre des liens
    saveSection(section);
}

function saveSectionOrder() {
    bookmarksData.sections.forEach((section, index) => {
      // Mise à jour de la position sans créer de nouvelle section
      section.position = index;
      saveSection(section);
    });
  }

function deleteSection(sectionId) {
    const transaction = db.transaction("sectionsStore", "readwrite");
    const objectStore = transaction.objectStore("sectionsStore");

    objectStore.delete(sectionId);

    transaction.oncomplete = function() {
        console.log("Section supprimée:", sectionId);
        loadBookmarks();
    };

    transaction.onerror = function(event) {
        console.error("Erreur lors de la suppression de la section:", event.target.errorCode);
    };
}

function submitLink() {
    const sectionId = $('#currentSectionId').val();
    const title = $('#linkTitle').val().trim();
    const url = $('#linkURL').val().trim();

    if (title && isValidURL(url)) {
        const section = bookmarksData.sections.find(s => s.id === sectionId);
        if (section) {
            section.links.push({ title, url, parentId: null });
            saveSection(section);
            $('#addLinkModal').modal('hide');
        } else {
            console.error("Section introuvable pour l'ajout du lien.");
        }
    } else {
        alert("Veuillez entrer un nom de lien valide et une URL correcte.");
    }
}

// Gérer le déplacement vers la droite (rendre l'URL enfant)
function moveRight(sectionId, linkIndex) {
    const section = bookmarksData.sections.find(s => s.id === sectionId);
    if (linkIndex > 0) { // S'assurer qu'il y a un lien au-dessus pour devenir parent
      section.links[linkIndex].parentId = section.links[linkIndex - 1].title; // Définit le lien au-dessus comme parent
      saveSection(section);
    }
  }
  
  // Gérer le déplacement vers la gauche (ramener l'URL à la racine)
  function moveLeft(sectionId, linkIndex) {
    const section = bookmarksData.sections.find(s => s.id === sectionId);
    section.links[linkIndex].parentId = null; // Supprimer le parentId pour ramener l'URL à la racine
    saveSection(section);
  }

  function openEditLinkModal(sectionId, linkIndex) {
    currentSectionId = sectionId;
    currentLinkIndex = linkIndex;
    const section = bookmarksData.sections.find(s => s.id === sectionId);
    const link = section.links[linkIndex];
    $('#editLinkTitle').val(link.title);
    $('#editLinkURL').val(link.url);
    $('#editLinkModal').modal('show');
  }
  
  function updateLink() {
    const newTitle = $('#editLinkTitle').val().trim();
    const newUrl = $('#editLinkURL').val().trim();
    if (newTitle && isValidURL(newUrl)) {
      const section = bookmarksData.sections.find(s => s.id === currentSectionId);
      section.links[currentLinkIndex].title = newTitle;
      section.links[currentLinkIndex].url = newUrl;
      saveSection(section);
      $('#editLinkModal').modal('hide');
    } else {
      alert("Veuillez entrer un nom et une URL valides.");
    }
  }

  function deleteLink(sectionId, linkTitle) {
    const section = bookmarksData.sections.find(s => s.id === sectionId);
    section.links = section.links.filter(link => link.title !== linkTitle);
    saveSection(section);
  }