<?php
declare(strict_types=1);

require_once __DIR__ . '/auth.php';
auth_require();

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

function ok(mixed $data = null): never {
    echo json_encode(array_merge(['ok' => true], is_array($data) ? $data : ['result' => $data]));
    exit;
}

function err(string $msg, int $code = 400): never {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

function read_body(): string {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') err('Empty request body');
    return $raw;
}

function real_path(string $relative): string {
    $relative = str_replace('\\', '/', $relative);
    $relative = preg_replace('#/+#', '/', $relative);
    $relative = ltrim($relative, '/');
    $resolved = realpath(PROJECT_ROOT . '/' . $relative);
    if ($resolved === false) err('Path not found');
    return $resolved;
}

function require_csrf(): void {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '';
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        err('Invalid CSRF token', 403);
    }
}

function format_size(int $bytes): string {
    if ($bytes < 1024) return $bytes . ' B';
    if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
    return round($bytes / 1048576, 1) . ' MB';
}

function is_within_assets(string $resolved): bool {
    $assets = realpath(ASSETS_DIR);
    if ($assets === false) return false;
    return str_starts_with($resolved, $assets);
}

switch ($action) {

    case 'get':
        if ($method !== 'GET') err('Method not allowed', 405);
        if (!file_exists(DATA_FILE)) ok(['data' => (object)[]]);
        $raw = file_get_contents(DATA_FILE);
        if ($raw === false) err('Failed to read data.json');
        $json = json_decode($raw, true);
        if (json_last_error() !== JSON_ERROR_NONE) err('Invalid JSON in data.json');
        ok(['data' => $json]);
        break;

    case 'save':
        if ($method !== 'POST') err('Method not allowed', 405);
        require_csrf();
        $body = json_decode(read_body(), true);
        if (!is_array($body) || !isset($body['data'])) err('Invalid payload');
        $data_str = is_string($body['data']) ? $body['data'] : json_encode($body['data'], JSON_UNESCAPED_UNICODE);
        if (json_decode($data_str) === null && json_last_error() !== JSON_ERROR_NONE) {
            err('Invalid JSON data');
        }
        $decoded = json_decode($data_str);
        $pretty = json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($pretty === false) err('Failed to encode JSON');
        if (!is_dir(BACKUP_DIR)) @mkdir(BACKUP_DIR, 0755, true);
        if (file_exists(DATA_FILE)) {
            $ts = date('Y-m-d_H-i-s');
            $backup = BACKUP_DIR . '/data_' . $ts . '.json';
            @copy(DATA_FILE, $backup);
        }
        $written = file_put_contents(DATA_FILE, $pretty, LOCK_EX);
        if ($written === false) err('Failed to write data.json', 500);
        ok(['message' => 'Saved successfully', 'bytes' => $written]);
        break;

    case 'upload':
        if ($method !== 'POST') err('Method not allowed', 405);
        require_csrf();
        
        $folder = preg_replace('#[^a-zA-Z0-9_\-/]#', '', $_POST['folder'] ?? '');
        $folder = trim($folder, '/');
        $dest_dir = ASSETS_DIR . ($folder ? '/' . $folder : '');
        if (!is_dir($dest_dir)) {
            if (!@mkdir($dest_dir, 0755, true)) err('Failed to create directory');
        }

        $uploaded_files = [];
        $files_to_process = [];

        if (isset($_FILES['file'])) {
            $files_to_process[] = $_FILES['file'];
        } elseif (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
            $count = count($_FILES['files']['name']);
            for ($i = 0; $i < $count; $i++) {
                $files_to_process[] = [
                    'name'     => $_FILES['files']['name'][$i],
                    'type'     => $_FILES['files']['type'][$i],
                    'tmp_name' => $_FILES['files']['tmp_name'][$i],
                    'error'    => $_FILES['files']['error'][$i],
                    'size'     => $_FILES['files']['size'][$i],
                ];
            }
        } else {
            err('No files uploaded');
        }

        foreach ($files_to_process as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) continue;
            if ($file['size'] > MAX_UPLOAD_SIZE) continue;
            
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, ALLOWED_UPLOAD_EXTENSIONS, true)) continue;

            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);
            if (!in_array($mime, ALLOWED_UPLOAD_TYPES, true)) continue;

            $safe_name = preg_replace('#[^a-zA-Z0-9._\-]#', '_', $file['name']);
            $safe_name = preg_replace('#_+#', '_', $safe_name);
            $safe_name = ltrim($safe_name, '_');
            if ($safe_name === '') $safe_name = 'upload_' . time() . '_' . bin2hex(random_bytes(2)) . '.' . $ext;
            
            $dest = $dest_dir . '/' . $safe_name;
            if (file_exists($dest)) {
                $base = pathinfo($safe_name, PATHINFO_FILENAME);
                $dest = $dest_dir . '/' . $base . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
                $safe_name = basename($dest);
            }

            if (move_uploaded_file($file['tmp_name'], $dest)) {
                $relative = 'assets/' . ($folder ? $folder . '/' : '') . $safe_name;
                $uploaded_files[] = ['path' => $relative, 'name' => $safe_name];
            }
        }

        if (empty($uploaded_files)) {
            err('Failed to upload files. Check file size and type.');
        }

        if (count($uploaded_files) === 1 && isset($_FILES['file'])) {
            ok($uploaded_files[0]);
        } else {
            ok(['files' => $uploaded_files, 'path' => $uploaded_files[0]['path']]);
        }
        break;

    case 'delete':
        if ($method !== 'POST') err('Method not allowed', 405);
        require_csrf();
        $body = json_decode(read_body(), true);
        $path = $body['path'] ?? '';
        if ($path === '') err('No file path specified');
        $resolved = real_path($path);
        if (!is_within_assets($resolved)) err('Access denied: path outside assets/', 403);
        if (!file_exists($resolved)) err('File not found');
        if (!is_file($resolved)) err('Cannot delete directories');
        if (!@unlink($resolved)) err('Failed to delete file', 500);
        ok(['message' => 'Deleted']);
        break;

    case 'list':
        if ($method !== 'GET') err('Method not allowed', 405);
        $dir_param = $_GET['dir'] ?? '';
        $dir_param = preg_replace('#[^a-zA-Z0-9_\-/]#', '', $dir_param);
        $dir_param = trim($dir_param, '/');
        $target = ASSETS_DIR . ($dir_param ? '/' . $dir_param : '');
        if (!is_dir($target)) err('Directory not found');
        $files = [];
        $items = @scandir($target);
        if ($items === false) err('Failed to read directory');
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $full = $target . '/' . $item;
            $rel = 'assets/' . ($dir_param ? $dir_param . '/' : '') . $item;
            if (is_dir($full)) {
                $files[] = [
                    'name' => $item,
                    'path' => $rel,
                    'is_dir' => true,
                ];
            } elseif (is_file($full)) {
                $files[] = [
                    'name' => $item,
                    'path' => $rel,
                    'size' => format_size((int)filesize($full)),
                    'raw_size' => (int)filesize($full),
                    'type' => mime_content_type($full) ?: 'application/octet-stream',
                    'is_dir' => false,
                ];
            }
        }
        usort($files, function ($a, $b) {
            if ($a['is_dir'] && !$b['is_dir']) return -1;
            if (!$a['is_dir'] && $b['is_dir']) return 1;
            return strcmp($a['name'], $b['name']);
        });
        ok(['files' => $files, 'count' => count($files)]);
        break;

    case 'download':
        if ($method !== 'GET') err('Method not allowed', 405);
        $path = $_GET['path'] ?? '';
        if ($path === '') err('No file path specified');
        $resolved = real_path($path);
        if (!is_within_assets($resolved)) err('Access denied', 403);
        if (!file_exists($resolved) || !is_file($resolved)) err('File not found');
        $mime = mime_content_type($resolved) ?: 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($resolved));
        header('Content-Disposition: inline; filename="' . basename($resolved) . '"');
        header('Cache-Control: no-store');
        readfile($resolved);
        exit;

    default:
        err('Unknown action');
}
