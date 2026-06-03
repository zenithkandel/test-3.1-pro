<?php
declare(strict_types=1);

define('ADMIN_PIN', '8038');
define('SESSION_LIFETIME', 1800); // 30 minutes
define('PROJECT_ROOT', dirname(__DIR__));
define('DATA_DIR', PROJECT_ROOT . DIRECTORY_SEPARATOR . 'data');
define('DATA_FILE', DATA_DIR . DIRECTORY_SEPARATOR . 'data.json');
define('BACKUP_DIR', DATA_DIR . DIRECTORY_SEPARATOR . 'backups');
define('ASSETS_DIR', PROJECT_ROOT . DIRECTORY_SEPARATOR . 'assets');

define('ALLOWED_UPLOAD_TYPES', [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
]);

define('ALLOWED_UPLOAD_EXTENSIONS', [
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'
]);

define('MAX_UPLOAD_SIZE', 10 * 1024 * 1024); // 10MB

header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
