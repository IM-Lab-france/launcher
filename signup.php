<?php
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    // Vérifier si le nom d'utilisateur existe déjà
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Nom d\'utilisateur déjà pris.']);
        exit;
    }

    // Insérer le nouvel utilisateur dans la base de données
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
    $stmt->execute(['username' => $username, 'password' => $password]);

    echo json_encode(['success' => true, 'message' => 'Compte créé avec succès']);
}
?>
