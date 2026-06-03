<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
auth_start();

if (auth_is_logged_in()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_verify()) {
        $error = 'Invalid request token.';
    } else {
        $pin = $_POST['pin'] ?? '';
        if (auth_login($pin)) {
            header('Location: dashboard.php');
            exit;
        }
        $error = 'Invalid PIN.';
    }
}
$csrf = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;height:100vh;display:flex;align-items:center;justify-content:center}
.login{background:#111;border:1px solid #222;border-radius:12px;padding:40px;width:100%;max-width:360px;box-shadow:0 8px 32px rgba(0,0,0,.4)}
.login h1{font-size:18px;font-weight:500;margin-bottom:8px;text-align:center;color:#fff}
.login p{font-size:13px;color:#666;text-align:center;margin-bottom:28px}
.login label{display:block;font-size:12px;color:#888;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.login input[type="password"]{width:100%;padding:12px 16px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#fff;font-size:16px;letter-spacing:8px;text-align:center;outline:none;transition:border-color .2s}
.login input[type="password"]:focus{border-color:#555}
.login button{width:100%;padding:12px;margin-top:20px;background:#fff;color:#000;border:none;border-radius:8px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .2s}
.login button:hover{opacity:.85}
.error{background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.25);color:#e55;color:#f66;padding:10px;border-radius:8px;font-size:13px;text-align:center;margin-bottom:16px;display:block}
</style>
</head>
<body>
<div class="login">
    <h1>Dashboard</h1>
    <p>Enter your PIN to continue</p>
    <?php if ($error): ?>
        <span class="error"><?= htmlspecialchars($error) ?></span>
    <?php endif; ?>
    <form method="POST">
        <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf) ?>">
        <label for="pin">PIN</label>
        <input type="password" id="pin" name="pin" maxlength="8" inputmode="numeric" pattern="[0-9]*" autofocus required>
        <button type="submit">Sign In</button>
    </form>
</div>
</body>
</html>
