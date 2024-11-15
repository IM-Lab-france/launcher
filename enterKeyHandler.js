$(document).ready(function () {
  // Ajoute un événement keydown à toutes les modales
  $(".modal").on("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Empêche le comportement par défaut
      const modalId = $(this).attr("id");
      handleEnterKey(modalId);
    }
  });

  // Fonction pour gérer les actions en fonction de la modal
  function handleEnterKey(modalId) {
    switch (modalId) {
      case "authModal":
        login(); // Connexion
        break;
      case "signupModal":
        signup(); // Création de compte
        break;
      case "addLinkModal":
        submitLink(); // Ajout de lien
        break;
      case "addSectionModal":
        submitSection(); // Ajout de section
        break;
      case "editLinkModal":
        updateLink(); // Modification de lien
        break;
      case "editSectionModal":
        updateSectionTitle(); // Modification de section
        break;
      case "deleteAllModal":
        deleteAllData(); // Suppression de toutes les données
        break;
      default:
        console.warn(`Aucune action définie pour la modal ${modalId}`);
    }
  }
});
