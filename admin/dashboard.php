<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
auth_require();
$csrf = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh}
.topbar{background:#111;border-bottom:1px solid #222;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.topbar h1{font-size:16px;font-weight:500;color:#fff}
.topbar button{background:#1a1a1a;border:1px solid #2a2a2a;color:#999;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;transition:all .2s}
.topbar button:hover{background:#222;color:#fff;border-color:#444}
.container{max-width:1100px;margin:0 auto;padding:32px 24px}
.status{display:none;padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:20px}
.status.ok{display:block;background:rgba(50,180,80,.1);border:1px solid rgba(50,180,80,.25);color:#4b8}
.status.err{display:block;background:rgba(220,50,50,.1);border:1px solid rgba(220,50,50,.25);color:#e55}
.panel{background:#111;border:1px solid #222;border-radius:10px;padding:24px;margin-bottom:24px}
.panel h2{font-size:14px;font-weight:500;color:#fff;margin-bottom:16px;text-transform:uppercase;letter-spacing:.5px}
.panel textarea{width:100%;min-height:300px;background:#0d0d0d;border:1px solid #222;border-radius:6px;color:#ccc;font-family:'SF Mono',Consolas,monospace;font-size:12px;padding:16px;resize:vertical;outline:none;tab-size:2}
.panel textarea:focus{border-color:#444}
.btn-row{display:flex;gap:10px;margin-top:14px}
.btn{padding:10px 20px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s}
.btn-primary{background:#fff;color:#000}.btn-primary:hover{opacity:.85}
.btn-danger{background:#2a1515;color:#e55;border:1px solid rgba(220,50,50,.2)}.btn-danger:hover{background:#3a1a1a}
.btn-secondary{background:#1a1a1a;color:#999;border:1px solid #2a2a2a}.btn-secondary:hover{background:#222;color:#fff}
.upload-zone{border:2px dashed #2a2a2a;border-radius:8px;padding:32px;text-align:center;color:#555;cursor:pointer;transition:all .2s;position:relative}
.upload-zone:hover{border-color:#444;color:#888}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-zone p{font-size:13px}
.upload-zone .hint{font-size:11px;color:#444;margin-top:6px}
.file-list{margin-top:14px;max-height:260px;overflow-y:auto}
.file-item{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;border:1px solid #1a1a1a;border-radius:6px;margin-bottom:4px;font-size:12px}
.file-item span{color:#888}
.file-item button{background:none;border:none;color:#666;cursor:pointer;font-size:12px;padding:2px 6px}.file-item button:hover{color:#e55}
.dir-select{background:#1a1a1a;border:1px solid #2a2a2a;color:#ccc;padding:8px 12px;border-radius:6px;font-size:13px;margin-bottom:12px;outline:none}
</style>
</head>
<body>
<div class="topbar">
    <h1>Portfolio Dashboard</h1>
    <button onclick="logout()">Sign Out</button>
</div>
<div class="container">
    <div id="status" class="status"></div>

    <div class="panel">
        <h2>Data Editor</h2>
        <textarea id="dataEditor" spellcheck="false"></textarea>
        <div class="btn-row">
            <button class="btn btn-primary" onclick="saveData()">Save data.json</button>
            <button class="btn btn-secondary" onclick="loadData()">Reload</button>
        </div>
    </div>

    <div class="panel">
        <h2>File Upload</h2>
        <select id="uploadFolder" class="dir-select">
            <option value="images">images</option>
            <option value="svg">svg</option>
            <option value="fonts">fonts</option>
            <option value="icons">icons</option>
            <option value="">root (assets/)</option>
        </select>
        <div class="upload-zone" id="dropZone">
            <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.gif,.webp,.svg">
            <p>Drop file here or click to browse</p>
            <div class="hint">jpg, jpeg, png, gif, webp, svg — max 10MB</div>
        </div>
        <div id="uploadResult" style="margin-top:10px"></div>
    </div>

    <div class="panel">
        <h2>File Browser</h2>
        <select id="browseDir" class="dir-select" onchange="listFiles()">
            <option value="images">assets/images</option>
            <option value="svg">assets/svg</option>
            <option value="fonts">assets/fonts</option>
            <option value="icons">assets/icons</option>
            <option value="">assets/ (root)</option>
        </select>
        <div id="fileList" class="file-list"></div>
    </div>
</div>

<script>
const CSRF = '<?= $csrf ?>';
const API = 'api.php';

function headers(json) {
    const h = {'X-CSRF-TOKEN': CSRF};
    if (json) h['Content-Type'] = 'application/json';
    return h;
}

function showStatus(msg, ok) {
    const el = document.getElementById('status');
    el.textContent = msg;
    el.className = 'status ' + (ok ? 'ok' : 'err');
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 4000);
}

async function loadData() {
    try {
        const r = await fetch(API + '?action=get');
        const d = await r.json();
        document.getElementById('dataEditor').value = JSON.stringify(d, null, 2);
        if (!r.ok) throw new Error(d.error || 'Failed');
    } catch (e) { showStatus('Load failed: ' + e.message, false); }
}

async function saveData() {
    const raw = document.getElementById('dataEditor').value.trim();
    try { JSON.parse(raw); } catch { showStatus('Invalid JSON', false); return; }
    try {
        const r = await fetch(API + '?action=save', {
            method: 'POST', headers: headers(true),
            body: JSON.stringify({data: raw})
        });
        const d = await r.json();
        showStatus(d.ok ? 'Saved successfully' : (d.error || 'Save failed'), !!d.ok);
    } catch (e) { showStatus('Save failed: ' + e.message, false); }
}

async function uploadFile(file) {
    const folder = document.getElementById('uploadFolder').value;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    try {
        const r = await fetch(API + '?action=upload', {method: 'POST', headers: {'X-CSRF-TOKEN': CSRF}, body: fd});
        const d = await r.json();
        if (d.ok) {
            showStatus('Uploaded: ' + d.path, true);
            document.getElementById('uploadResult').innerHTML =
                '<code style="background:#1a1a1a;padding:6px 10px;border-radius:4px;font-size:12px;color:#8b8">' + d.path + '</code>';
            listFiles();
        } else { showStatus(d.error || 'Upload failed', false); }
    } catch (e) { showStatus('Upload failed: ' + e.message, false); }
}

document.getElementById('fileInput').addEventListener('change', function() {
    if (this.files[0]) uploadFile(this.files[0]);
});
document.getElementById('dropZone').addEventListener('dragover', function(e) {
    e.preventDefault(); this.style.borderColor = '#666';
});
document.getElementById('dropZone').addEventListener('dragleave', function() {
    this.style.borderColor = '';
});
document.getElementById('dropZone').addEventListener('drop', function(e) {
    e.preventDefault(); this.style.borderColor = '';
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
});

async function listFiles() {
    const dir = document.getElementById('browseDir').value;
    try {
        const r = await fetch(API + '?action=list&dir=' + encodeURIComponent(dir));
        const d = await r.json();
        const el = document.getElementById('fileList');
        if (!d.ok) { el.innerHTML = '<div style="color:#666;font-size:12px">No files</div>'; return; }
        el.innerHTML = d.files.map(f =>
            '<div class="file-item"><span>' + f.name + ' <i style="color:#444">(' + f.size + ')</i></span><div><button onclick="downloadFile(\'' + f.path + '\')">&#8595;</button> <button onclick="deleteFile(\'' + f.path + '\',\'' + f.name + '\')">&times;</button></div></div>'
        ).join('');
    } catch { document.getElementById('fileList').innerHTML = '<div style="color:#666;font-size:12px">Error loading files</div>'; }
}

async function deleteFile(path, name) {
    if (!confirm('Delete ' + name + '?')) return;
    try {
        const r = await fetch(API + '?action=delete', {method: 'POST', headers: headers(true), body: JSON.stringify({path})});
        const d = await r.json();
        showStatus(d.ok ? 'Deleted ' + name : (d.error || 'Delete failed'), !!d.ok);
        listFiles();
    } catch (e) { showStatus('Delete failed', false); }
}

function downloadFile(path) {
    window.open(API + '?action=download&path=' + encodeURIComponent(path), '_blank');
}

async function logout() {
    try { await fetch('auth.php?action=logout'); } catch {}
    window.location = 'index.php';
}

loadData();
listFiles();
</script>
</body>
</html>
