<?php
require 'config.php';
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON data from client
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? null;

    if (!$token) {
        echo json_encode(['status' => 'error', 'message' => 'Missing authentication token.']);
        exit;
    }

    try {
        // Decode JWT token
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));

        // Extract user ID from token
        $userId = $decoded->userId;

        // Fetch user profile from database
        $stmt = $pdo->prepare("SELECT background_image FROM users WHERE id = :userId");
        $stmt->execute(['userId' => $userId]);
        $user = $stmt->fetch();

        if ($user) {
            // Respond with user's profile data
            echo json_encode([
                'status' => 'success',
                'background_image' => $user['background_image']
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        }
    } catch (Exception $e) {
        // Error decoding JWT
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Request method not allowed.']);
}
