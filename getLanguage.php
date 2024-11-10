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

    if (!$token) {
        echo json_encode(['success' => false, 'message' => 'Jeton d\'authentification manquant.']);
        exit;
    }

    try {
        // Décoder le jeton JWT
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // Récupérer l'ID de l'utilisateur à partir du jeton
        $userId = $decoded->userId;

        // Récupérer la langue de l'utilisateur à partir de la base de données
        $stmt = $pdo->prepare("SELECT language FROM users WHERE id = :userId");
        $stmt->execute(['userId' => $userId]);
        $user = $stmt->fetch();

        if ($user && $user['language']) {
            echo json_encode(['success' => true, 'language' => $user['language']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Langue non définie pour cet utilisateur.']);
        }
    } catch (Exception $e) {
        // En cas d'erreur lors de la vérification du jeton
        echo json_encode(['success' => false, 'message' => 'Jeton invalide ou expiré.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Méthode de requête non autorisée.']);
}
