<?php
require 'config.php';
require 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Méthode de requête non autorisée']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['token'])) {
    echo json_encode(['success' => false, 'message' => 'Token manquant']);
    exit;
}

$token = $data['token'];

try {
    // Décodage du token avec la clé secrète
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

    // Extraction des informations utilisateur
    $userId = $decoded->userId;
    $username = $decoded->username;

    // Vérification si l'utilisateur existe toujours dans la base de données
    $stmt = $pdo->prepare("SELECT username FROM users WHERE id = :userId");
    $stmt->execute(['userId' => $userId]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            'success' => true,
            'username' => $username,
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
    }
} catch (Exception $e) {
    // En cas d'échec de la vérification du jeton
    echo json_encode(['success' => false, 'message' => 'Token invalide ou expiré']);
}
