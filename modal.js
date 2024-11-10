$(document).ready(function() {
    function openAddLinkModal(sectionId) {
        $('#currentSectionId').val(sectionId);
        $('#linkTitle').val('');
        $('#linkURL').val('');
        $('#addLinkModal').modal('show');
    }

    function openAddSectionModal() {
        $('#sectionTitle').val('');
        $('#addSectionModal').modal('show');
    }

    function openUploadModal() {
        $('#uploadModal').modal('show');
    }

    function openDeleteAllModal() {
        $('#deleteAllModal').modal('show');
    }

    function submitSection() {
        const title = $('#sectionTitle').val().trim();
        if (title) {
            const id = `section-${Date.now()}`;
            const newSection = { id, title, links: [], position: bookmarksData.sections.length };
            bookmarksData.sections.push(newSection);
            saveSection(newSection);
            $('#addSectionModal').modal('hide');
        } else {
            alert("Veuillez entrer un nom de section valide.");
        }
    }

    function openEditSectionModal(sectionId) {
        currentSectionId = sectionId;
        const section = bookmarksData.sections.find(s => s.id === sectionId);
        $('#editSectionTitle').val(section.title);
        $('#editSectionModal').modal('show');
    }

    function updateSectionTitle() {
        const newTitle = $('#editSectionTitle').val().trim();
        if (newTitle) {
            const section = bookmarksData.sections.find(s => s.id === currentSectionId);
            section.title = newTitle;
            saveSection(section);
            $('#editSectionModal').modal('hide');
        } else {
            alert("Veuillez entrer un nom de section valide.");
        }
    }

    function showInfoText() {
        $('#infoText').css("display", "block");
    }

    function hideInfoText() {
        $('#infoText').css("display", "none");
    }

    // Exposer les fonctions globalement si elles sont utilisées ailleurs
    window.openAddLinkModal = openAddLinkModal;
    window.openAddSectionModal = openAddSectionModal;
    window.openUploadModal = openUploadModal;
    window.openDeleteAllModal = openDeleteAllModal;
    window.submitSection = submitSection;
    window.openEditSectionModal = openEditSectionModal;
    window.updateSectionTitle = updateSectionTitle;
    window.showInfoText = showInfoText;
    window.hideInfoText = hideInfoText;
});
