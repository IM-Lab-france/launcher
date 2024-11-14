function toggleBurgerMenu() {
  $("#burgerMenuContent").toggle();
}

function toggleEditMode() {
  $("#editModeToggle").click();
  $("#burgerMenuContent").hide(); // Masquer le menu burger après clic
}

function toggleActions() {
  $(".editable").toggle();
  $("#burgerMenuContent").hide(); // Masquer le menu burger après clic
}

// Ferme le menu burger si un clic est fait en dehors de celui-ci
$(document).click(function (event) {
  if (!$(event.target).closest(".burger-menu, .burger-menu-content").length) {
    $("#burgerMenuContent").hide();
  }
});

// Ferme le menu burger quand on clique sur un lien dans le menu
$("#burgerMenuContent a").click(function () {
  $("#burgerMenuContent").hide();
});

// Détecter Windows et afficher le lien de téléchargement de launcher.exe si sur PC Windows
$(document).ready(function () {
  const isWindows = navigator.userAgent.includes("Windows");
  const downloadLink = $("#downloadLauncherLink");

  if (isWindows) {
    downloadLink.show(); // Affiche le lien pour Windows
  }
});
