<?php
require 'config.php';
require 'vendor/autoload.php'; // Inclure la bibliothèque JWT

use \Firebase\JWT\JWT;



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = $data['password'];

    // Vérifier si l'utilisateur existe
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    // Vérifier le mot de passe
    if ($user && password_verify($password, $user['password'])) {
        // Créer le payload du jeton JWT
        $payload = [
            'userId' => $user['id'],
            'username' => $user['username'],
            'iat' => time(),
            'exp' => time() + (7 * 24 * 60 * 60)
        ];

        // Générer le jeton JWT
        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        // Retourner le jeton JWT et le nom d'utilisateur
        echo json_encode(['success' => true, 'token' => $jwt, 'username' => $user['username']]);
    } else {
        // Identifiants incorrects
        echo json_encode(['success' => false, 'message' => 'Identifiants incorrects.']);
    }
}