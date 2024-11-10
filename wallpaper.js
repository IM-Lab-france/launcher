$(document).ready(function () {
  let selectedImage = null;

  // Function to set background image
  function setBackgroundImage(imagePath) {
    $("#backgroundOverlay").css("background-image", `url(${imagePath})`);
  }

  // Function to save background image to the server
  function saveBackgroundImage(imagePath) {
    const token = localStorage.getItem("jwtToken");

    $.ajax({
      url: "saveBackgroundImage.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ token: token, background_image: imagePath }),
      success: function (response) {
        if (response.status === "success") {
          console.log("Background image saved successfully.");
        } else {
          console.error("Error saving background image.");
        }
      },
      error: function () {
        console.error("Server connection error.");
      },
    });
  }

  // Load user's saved background on page load
  function loadUserBackground() {
    const token = localStorage.getItem("jwtToken");

    $.ajax({
      url: "getUserProfile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ token: token }),
      success: function (response) {
        const backgroundImage =
          response.background_image || "img/wallpaper/WP01.webp";
        setBackgroundImage(backgroundImage);
      },
      error: function () {
        console.error("Error loading user profile.");
      },
    });
  }

  // Initial background load based on user's saved profile
  loadUserBackground();

  // Link to open the background change modal
  $("#changeBackgroundLink").on("click", function () {
    loadWallpapers();
    $("#backgroundModal").modal("show");
  });

  // Dynamically load wallpapers from the server
  function loadWallpapers() {
    const wallpaperContainer = $("#wallpaperContainer");
    wallpaperContainer.empty();

    $.ajax({
      url: "getWallpapers.php",
      method: "GET",
      dataType: "json",
      success: function (wallpapers) {
        wallpapers.forEach((image) => {
          const imgElement = $(
            `<img src="${image}" alt="${image}" class="rounded">`
          );
          imgElement.on("click", function () {
            wallpaperContainer.find("img").removeClass("selected");
            imgElement.addClass("selected");
            selectedImage = image;
          });
          wallpaperContainer.append(imgElement);
        });
      },
      error: function () {
        console.error("Error loading wallpapers.");
      },
    });
  }

  // Confirm button to apply the selected background image
  $("#confirmBackgroundButton").on("click", function () {
    if (selectedImage) {
      setBackgroundImage(selectedImage);
      saveBackgroundImage(selectedImage); // Save to the database
      $("#backgroundModal").modal("hide");
    }
  });

  // Cancel button to close the modal without saving
  $("#cancelBackgroundButton").on("click", function () {
    $("#backgroundModal").modal("hide");
  });
});
