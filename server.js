const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DIR = __dirname;
const APPS_DIR = path.join(DIR, 'apps'); // Thư mục chứa các app đã xuất

// Tạo thư mục apps nếu chưa có
if (!fs.existsSync(APPS_DIR)) fs.mkdirSync(APPS_DIR);

const MIME = {
    '.html': 'text/html',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.gif':  'image/gif',
};

http.createServer((req, res) => {

    // === Bỏ qua lỗi lặt vặt Favicon ===
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        res.end();
        return;
    }

    // === POST: Nhận code từ Builder và lưu thành file ===
    if (req.method === 'POST' && req.url === '/save-app') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { filename, code } = JSON.parse(body);
                const safeName = filename.replace(/[^a-z0-9_\-\.]/gi, '_');
                const filePath = path.join(APPS_DIR, safeName);
                fs.writeFileSync(filePath, code, 'utf-8');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, url: '/apps/' + safeName }));
                console.log('✅ Đã lưu app: ' + safeName);
            } catch(e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: e.message }));
            }
        });
        return;
    }

    // === GET: Phục vụ file tĩnh ===
    let filePath;

    if (req.url.startsWith('/apps/')) {
        // Phục vụ các app đã lưu
        filePath = path.join(DIR, req.url);
    } else {
        // Phục vụ giao diện React Builder
        filePath = path.join(DIR, 'react-builder', 'dist', req.url === '/' ? 'index.html' : req.url);
    }
    
    if (!fs.existsSync(filePath)) {
        filePath = path.join('C:\\Users\\ADMIN\\Downloads', req.url);
    }

    const ext = path.extname(filePath);
    const contentType = MIME[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('404 - Khong tim thay file'); return; }
        res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
        res.end(data);
    });
}).listen(PORT, () => console.log('Server dang chay tai http://localhost:' + PORT));
