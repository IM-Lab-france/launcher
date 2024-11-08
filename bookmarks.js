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

function renderBookmarks() {
    $('#bookmarkContainer').empty();
    console.log("Rendu des bookmarks avec sections:", bookmarksData.sections);

    bookmarksData.sections.sort((a, b) => (a.position || 0) - (b.position || 0));
    bookmarksData.sections.forEach((section) => {
        const sectionHtml = `
            <div class="col-lg-4 col-md-6 col-sm-12 mb-4 bookmark-section" id="${section.id}">
                <div class="bookmark-title">${section.title}
                    <span class="edit-icon ml-2 editable" onclick="openEditSectionModal('${section.id}')">✏️</span>
                    <span class="add-link-icon ml-2 editable" onclick="openAddLinkModal('${section.id}')">➕</span>
                    <span class="delete-icon ml-2 editable" onclick="deleteSection('${section.id}')">🗑️</span>
                </div>
                <ul class="list-group" id="links-${section.id}">
                    ${section.links.map((link, index) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center" data-index="${index}" data-parent-id="${link.parentId || ''}">
                            <a href="${link.url}" style="padding-left: ${link.parentId ? '30px' : '0px'};">${link.title}</a>
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

    // Appeler `toggleEditModeDisplay()` pour que les éléments éditables soient affichés ou masqués
    toggleEditModeDisplay();
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