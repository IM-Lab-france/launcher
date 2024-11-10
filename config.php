<?php
// Configuration de la base de données
$host = '127.0.0.1';
$dbname = 'signets';
$user = 'signets';
$pass = 'ParKGKC19#';
$secretKey = '4L9fP!2#Rq@Xz*7vWx^Kd3Tj+QmZp&SnYbLgGd@Ht^FxMzP1'; // Clé secrète pour signer les jetons JWT

try {
    // Création de l'objet PDO pour se connecter à la base de données
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    // Configuration des options PDO pour afficher les erreurs en cas de problème
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // En cas d'erreur de connexion, afficher un message d'erreur et arrêter l'exécution
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}