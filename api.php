<?php
require_once 'db.php';

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `cv_data` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `profile_key` VARCHAR(64) UNIQUE NOT NULL,
        `data_json` LONGTEXT NOT NULL,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
} catch(Exception $e) {}

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true) ?: [];
    $pass = trim($payload['password'] ?? '');

    if ($pass === '!Eymen2017.') {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['cv_auth_success'] = true;
        setcookie('cv_auth_success', 'true', time() + 315360000, '/', '', false, false);
        echo json_encode(['success' => true, 'message' => 'Giriş başarılı']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Hatalı şifre!']);
    }
    exit;
}

// Authentication check for database operations
$isAuth = false;
if (isset($_COOKIE['cv_auth_success']) && $_COOKIE['cv_auth_success'] === 'true') {
    $isAuth = true;
}
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION['cv_auth_success']) && $_SESSION['cv_auth_success'] === true) {
    $isAuth = true;
}

if (!$isAuth) {
    if ($action === 'get_data') {
        // Return decoy demo data to unauthenticated requests/scrapers
        echo json_encode([
            'success' => true,
            'data' => [
                'boekhoudkundigassistent' => [
                    'personal' => ['name' => 'Demo Kandidaat', 'title' => 'Voorbeeld Profiel (Beveiligd)'],
                    'contact' => ['phone' => '+32 000 00 00 00', 'email' => 'demo.gebruiker@example.org']
                ]
            ]
        ]);
        exit;
    }
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Yetkisiz erişim!']);
    exit;
}

if ($action === 'get_data') {
    try {
        $stmt = $pdo->query("SELECT profile_key, data_json FROM cv_data");
        $rows = $stmt->fetchAll();
        $result = [];
        foreach ($rows as $row) {
            $decoded = json_decode($row['data_json'], true);
            if ($decoded) {
                $result[$row['profile_key']] = $decoded;
            }
        }
        echo json_encode(['success' => true, 'data' => $result]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'save_data') {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);

    if (!$payload || !isset($payload['profiles']) || !is_array($payload['profiles'])) {
        echo json_encode(['success' => false, 'error' => 'Geçersiz veri paketi']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO cv_data (profile_key, data_json) VALUES (:k, :d) ON DUPLICATE KEY UPDATE data_json = :d2");
        foreach ($payload['profiles'] as $key => $val) {
            $json = json_encode($val, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            $stmt->execute([':k' => $key, ':d' => $json, ':d2' => $json]);
        }
        echo json_encode(['success' => true, 'message' => 'Veriler MySQL veritabanına başarıyla kaydedildi!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Geçersiz işlem']);
