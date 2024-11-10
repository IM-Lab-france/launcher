<?php
require 'config.php';
require 'vendor/autoload.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? null;
    $backgroundImage = $data['background_image'] ?? 'img/wallpaper/WP01.webp';

    if (!$token) {
        echo json_encode(['status' => 'error', 'message' => 'Token manquant']);
        exit;
    }

    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        $userId = $decoded->userId;

        $stmt = $pdo->prepare("UPDATE users SET background_image = :background_image WHERE id = :user_id");
        $stmt->execute(['background_image' => $backgroundImage, 'user_id' => $userId]);

        echo json_encode(['status' => 'success', 'message' => 'Image de fond mise à jour']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Token invalide ou expiré']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Méthode non autorisée']);
}
