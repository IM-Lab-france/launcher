<?php
require 'config.php';
require 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON envoyées par le client
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? null;
    $bookmarksData = json_encode($data['bookmarks'] ?? []);

    if (!$token) {
        echo json_encode(['success' => false, 'message' => 'Jeton d\'authentification manquant.']);
        exit;
    }

    try {
        // Décoder le jeton JWT
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // Récupérer l'ID de l'utilisateur à partir du jeton
        $userId = $decoded->userId;

        // Mettre à jour les signets de l'utilisateur dans la base de données
        $stmt = $pdo->prepare("
            UPDATE users
            SET bookmarks_data = :bookmarksData
            WHERE id = :userId
        ");
        $stmt->execute([
            'bookmarksData' => $bookmarksData,
            'userId' => $userId
        ]);

        echo json_encode(['success' => true, 'message' => 'Signets sauvegardés avec succès.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Jeton invalide ou expiré.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode de requête non autorisée.']);
}
