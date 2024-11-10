<?php
// Inclure le fichier de configuration pour la base de données
require 'config.php';

// Chemin vers le fichier à télécharger
$file = 'launcher.exe';

// Vérifier que le fichier existe sur le serveur
if (!file_exists($file)) {
    die("Erreur : fichier non trouvé.");
}

try {
    // Incrémenter le compteur de téléchargements dans la base de données
    $stmt = $pdo->prepare("UPDATE downloads SET count = count + 1 WHERE file_name = :file_name");
    $stmt->execute(['file_name' => 'launcher.exe']);

    // Vérifier si la mise à jour a bien été effectuée
    if ($stmt->rowCount() == 0) {
        // Si aucune ligne n'est affectée, cela signifie que le fichier n'est pas trouvé dans la base
        die("Erreur : fichier non trouvé dans la base de données.");
    }

    // Envoyer les en-têtes pour forcer le téléchargement du fichier
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($file) . '"');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));

    // Vider le tampon de sortie pour éviter des problèmes
    ob_clean();
    flush();

    // Lire et envoyer le fichier au client
    readfile($file);
    exit;
} catch (PDOException $e) {
    // Afficher un message d'erreur s'il y a un problème avec la base de données
    die("Erreur de base de données : " . $e->getMessage());
}
