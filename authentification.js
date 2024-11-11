$(document).ready(function () {
  window.token = localStorage.getItem("jwtToken") || null;
  let username = localStorage.getItem("username") || null;
  window.accountCreated = false; // Indicateur pour suivre la création de compte

  // Affiche le message de bienvenue pour l'utilisateur connecté
  function displayWelcomeMessage(username) {
    const $welcomeMessage = $("#userGreeting");
    if ($welcomeMessage.length) {
      $welcomeMessage.html(`🧑‍💻 ${username}`);
      $welcomeMessage.show();
    }
  }

  // Fonction pour afficher ou masquer la modale de connexion
  function toggleAuthModal() {
    if (window.token) {
      logout();
    } else {
      $("#authModal").modal("show");
    }
  }

  // Vérifie et met à jour l'interface utilisateur en fonction de l'état de connexion
  function updateAuthUI() {
    const userGreeting = document.getElementById("userGreeting");
    const authLink = document.getElementById("authLink");

    if (window.token) {
      const payload = JSON.parse(atob(window.token.split(".")[1]));
      username = payload.username;

      userGreeting.style.display = "inline";
      userGreeting.textContent = `🧑‍💻 ${username}`;
      authLink.innerHTML = "🔓 Déconnexion";
      authLink.onclick = logout;
      enableEditMode();
    } else {
      userGreeting.style.display = "none";
      authLink.innerHTML = "🔒 Connexion";
      authLink.onclick = toggleAuthModal;
      disableEditMode();
    }
  }

  // Active le mode édition et affiche les boutons d'édition
  function enableEditMode() {
    $("#editModeToggle").show(); // Affiche le bouton de mode édition
    $(".editable").show(); // Affiche les éléments marqués pour le mode édition
    $("body").addClass("edit-mode"); // Ajoute une classe pour indiquer que le mode édition est actif
  }

  // Désactive le mode édition et masque les boutons d'édition
  function disableEditMode() {
    $("#editModeToggle").hide(); // Cache le bouton de mode édition
    $(".editable").hide(); // Cache les éléments marqués pour le mode édition
    $("body").removeClass("edit-mode"); // Retire la classe mode édition
  }

  // Vérifie la validité du jeton au chargement de la page et affiche un log
  function checkTokenValidity() {
    if (!window.token) {
      console.log("Aucun jeton trouvé dans le stockage local.");
      return;
    }

    fetch("validate_token.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: window.token }),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          username = result.username;
          localStorage.setItem("username", username);
          console.log("Jeton valide. Utilisateur authentifié :", username);
          displayWelcomeMessage(username);
          updateAuthUI();
          loadServerBookmarks();
        } else {
          console.log("Jeton invalide ou expiré :", result.message);
          logout();
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la validation du jeton :", error);
        logout();
      });
  }

  async function login() {
    const username = $("#username").val();
    const password = $("#password").val();

    const response = await fetch("login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (result.success) {
      window.token = result.token;
      localStorage.setItem("jwtToken", window.token);
      localStorage.setItem("username", username);
      $("#authModal").modal("hide");
      updateAuthUI();
      displayWelcomeMessage(username);
      loadServerBookmarks();
    } else {
      showToast("Identifiants incorrects.", "error");
    }
  }

  // Fonction pour se déconnecter
  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("isEditMode"); // Supprime le mode édition
    window.token = null;
    isEditMode = false; // Assure que le mode édition est désactivé
    disableEditMode(); // Désactive le mode édition visuellement

    location.reload();
  }

  function openSignupModal() {
    $("#authModal").modal("hide");
    $("#signupModal").modal("show");
  }

  async function signup() {
    const username = $("#signupUsername").val();
    const password = $("#signupPassword").val();
    const confirmPassword = $("#confirmPassword").val();

    if (password !== confirmPassword) {
      showToast("Les mots de passe ne correspondent pas.", "error");
      return;
    }

    const response = await fetch("signup.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (result.success) {
      showToast(
        "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
        "success"
      );
      $("#signupModal").modal("hide");
      window.accountCreated = true; // Indique qu'un compte a été créé
      $("#authModal").modal("show");
    } else {
      showToast(
        result.message || "Erreur lors de la création du compte.",
        "error"
      );
    }
  }

  function showToast(message, type = "success") {
    const $toast = $("<div>").addClass(`toast ${type}`).text(message);
    $("body").append($toast);

    setTimeout(() => $toast.addClass("visible"), 100);
    setTimeout(() => {
      $toast.removeClass("visible");
      setTimeout(() => $toast.remove(), 300);
    }, 3000);
  }

  // Expose les fonctions nécessaires globalement
  window.toggleAuthModal = toggleAuthModal;
  window.login = login;
  window.logout = logout;
  window.openSignupModal = openSignupModal;
  window.signup = signup;

  const token = localStorage.getItem("jwtToken");

  // Si aucun utilisateur n'est connecté, afficher la modale de connexion
  if (!token) {
    $("#authModal").modal("show"); // Affiche la modale de connexion
  }

  // Appel de la vérification du jeton lors du chargement de la page
  checkTokenValidity();
  updateAuthUI();

  // Affiche la modale de connexion si la modale de création de compte est fermée sans action
  $("#signupModal").on("hidden.bs.modal", function () {
    if (!window.accountCreated) {
      // Vérifie si un compte n'a pas été créé
      $("#authModal").modal("show"); // Réaffiche la modale de connexion
    }
  });
});
