<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function auth_start(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Strict',
        ]);
        session_start();
    }
}

function auth_check_timeout(): void {
    auth_start();
    if (isset($_SESSION['last_activity'])) {
        if (time() - $_SESSION['last_activity'] > SESSION_LIFETIME) {
            session_unset();
            session_destroy();
            http_response_code(401);
            exit(json_encode(['error' => 'Session expired']));
        }
    }
    $_SESSION['last_activity'] = time();
}

function auth_is_logged_in(): bool {
    auth_start();
    return isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
}

function auth_require(): void {
    auth_check_timeout();
    if (!auth_is_logged_in()) {
        http_response_code(401);
        if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'api.php') {
            exit(json_encode(['error' => 'Unauthorized']));
        }
        header('Location: index.php');
        exit;
    }
}

function auth_login(string $pin): bool {
    if ($pin === ADMIN_PIN) {
        auth_start();
        session_regenerate_id(true);
        $_SESSION['authenticated'] = true;
        $_SESSION['last_activity'] = time();
        $_SESSION['login_time'] = time();
        return true;
    }
    return false;
}

function auth_logout(): void {
    auth_start();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function csrf_token(): string {
    auth_start();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrf_field(): string {
    return '<input type="hidden" name="csrf_token" value="' . csrf_token() . '">';
}

function csrf_verify(): bool {
    auth_start();
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
