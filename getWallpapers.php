<?php
header('Content-Type: application/json');

$wallpaperDir = __DIR__ . '/img/wallpaper/';
$images = [];

// Vérifier si le répertoire existe
if (is_dir($wallpaperDir)) {
    // Parcourir les fichiers du répertoire
    foreach (scandir($wallpaperDir) as $file) {
        // Filtrer pour ne garder que les fichiers images
        if (in_array(pathinfo($file, PATHINFO_EXTENSION), ['jpg', 'jpeg', 'png', 'webp'])) {
            $images[] = 'img/wallpaper/' . $file;
        }
    }
}

echo json_encode($images);
