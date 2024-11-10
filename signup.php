<?php
require 'config.php';

header('Content-Type: application/json');

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

    // JSON par défaut pour bookmarks_data
    $defaultBookmarksData = json_encode([
        [
            "id" => "section-1731200000001",
            "title" => "Exemple",
            "links" => [
                [
                    "title" => "Notice Launcher",
                    "url" => "https://ia.fozzy.fr/launcher/notice.html",
                    "parentId" => null
                ],
                [
                    "title" => "Perdu",
                    "url" => "https://www.perdu.com",
                    "parentId" => null
                ]

            ],
            "position" => 0
        ]

    ]);

    // Insérer le nouvel utilisateur dans la base de données avec bookmarks_data par défaut
    $stmt = $pdo->prepare("INSERT INTO users (username, password, bookmarks_data) VALUES (:username, :password, :bookmarks_data)");
    $stmt->execute([
        'username' => $username,
        'password' => $password,
        'bookmarks_data' => $defaultBookmarksData
    ]);

    echo json_encode(['success' => true, 'message' => 'Compte créé avec succès']);
}
