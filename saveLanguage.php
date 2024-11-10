<?php
require 'config.php';
require 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header('Content-Type: application/json');

// Vérifier la méthode de la requête
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON envoyées par le client
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? null;
    $language = $data['language'] ?? null;

    if (!$token || !$language) {
        echo json_encode(['success' => false, 'message' => 'Données de requête manquantes.']);
        exit;
    }

    try {
        // Décoder le jeton JWT
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // Récupérer l'ID de l'utilisateur à partir du jeton
        $userId = $decoded->userId;

        // Mettre à jour la langue de l'utilisateur dans la base de données
        $stmt = $pdo->prepare("UPDATE users SET language = :language WHERE id = :userId");
        $stmt->execute(['language' => $language, 'userId' => $userId]);

        echo json_encode(['success' => true, 'message' => 'Langue mise à jour avec succès.']);
    } catch (Exception $e) {
        // En cas d'erreur lors de la vérification du jeton
        echo json_encode(['success' => false, 'message' => 'Jeton invalide ou expiré.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode de requête non autorisée.']);
}
