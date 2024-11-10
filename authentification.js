$(document).ready(function () {
  window.token = localStorage.getItem("jwtToken") || null;
  let username = localStorage.getItem("username") || null;

  // Affiche le message de bienvenue pour l'utilisateur connecté
  function displayWelcomeMessage(username) {
    const $welcomeMessage = $("#userGreeting");
    if ($welcomeMessage.length) {
      $welcomeMessage.html(`Bonjour, ${username}`);
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
      userGreeting.textContent = `Bonjour ${username}`;
      authLink.textContent = "Déconnexion";
      authLink.onclick = logout;
    } else {
      userGreeting.style.display = "none";
      authLink.textContent = "Connexion";
      authLink.onclick = toggleAuthModal;
    }
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

  // Fonction pour gérer l'affichage du nom d'utilisateur dans le menu
  function displayUsername() {
    const $authContainer = $("#authContainer");
    if ($authContainer.length) {
      if (token && username) {
        $authContainer.html(
          `<span>Bonjour, ${username}</span> | <span id="authLink" style="cursor: pointer;" onclick="toggleAuthModal()">Déconnexion</span>`
        );
      } else {
        $authContainer.html(
          `<span id="authLink" style="cursor: pointer;" onclick="toggleAuthModal()">Connexion</span>`
        );
      }
    }
  }

  // Fonction pour se déconnecter
  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    window.token = null;
    window.bookmarksData.sections = [];
    renderBookmarks();
    $("#authLink").text("Connexion");
    $("#userGreeting").hide();
    updateAuthUI();
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

  // Appel de la vérification du jeton lors du chargement de la page
  checkTokenValidity();
  updateAuthUI();
});
