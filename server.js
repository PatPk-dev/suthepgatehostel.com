const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Explicit route for root to ensure Vercel finds index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Explicitly serve components folder
app.use('/components', express.static(path.join(__dirname, 'components')));

// --- Multer config for image uploads ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
        cb(null, name);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowed.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowed.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// --- Data helpers & In-Memory Cache (for Vercel support) ---
const DATA_DIR = path.join(__dirname, 'data');
const dataCache = {}; // Cache for temporary persistence in Vercel memory

function readJSON(filename) {
    // Return cached data if available (for Vercel serverless persistence within instance)
    if (dataCache[filename]) {
        return dataCache[filename];
    }

    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) return null;

    try {
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        dataCache[filename] = data; // Cache initial load
        return data;
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return null;
    }
}

function writeJSON(filename, data) {
    // Update cache immediately
    dataCache[filename] = data;

    // Try to write to file (will fail on Vercel, but succeed locally)
    try {
        const filepath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.warn(`Warning: Could not write to ${filename} (likely read-only fs on Vercel). Using in-memory cache.`);
        // Do not throw error, let the API respond with success
    }
}

// --- Simple Auth (change this password!) ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'suthepgate2026';

function authMiddleware(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (token !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

// ============================================
// API ROUTES
// ============================================

// --- Login ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, token: ADMIN_PASSWORD });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// --- Content (GET public, PUT admin) ---
app.get('/api/content', (req, res) => {
    const content = readJSON('content.json');
    res.json(content || {});
});

app.put('/api/content', authMiddleware, (req, res) => {
    writeJSON('content.json', req.body);
    res.json({ success: true });
});

// --- SEO Settings ---
app.get('/api/seo', (req, res) => {
    const content = readJSON('content.json');
    res.json(content?.seo || {});
});

app.put('/api/seo', authMiddleware, (req, res) => {
    const content = readJSON('content.json') || {};
    content.seo = req.body;
    writeJSON('content.json', content);
    res.json({ success: true });
});

// --- Booking URL ---
app.put('/api/booking-url', authMiddleware, (req, res) => {
    const content = readJSON('content.json') || {};
    content.bookingUrl = req.body.url;
    writeJSON('content.json', content);
    res.json({ success: true });
});

// --- Site Images (position-based) ---
app.put('/api/site-images/:key', authMiddleware, (req, res) => {
    const content = readJSON('content.json') || {};
    if (!content.siteImages) content.siteImages = {};
    if (!content.siteImages[req.params.key]) {
        return res.status(404).json({ error: 'Image position not found' });
    }
    content.siteImages[req.params.key].url = req.body.url;
    writeJSON('content.json', content);
    res.json({ success: true });
});

// --- Blog CRUD ---
app.get('/api/blog', (req, res) => {
    const data = readJSON('blog.json');
    res.json(data || { posts: [] });
});

app.post('/api/blog', authMiddleware, (req, res) => {
    const data = readJSON('blog.json') || { posts: [] };
    const newPost = {
        id: Date.now().toString(),
        ...req.body,
        date: req.body.date || new Date().toISOString().split('T')[0]
    };
    data.posts.unshift(newPost);
    writeJSON('blog.json', data);
    res.json({ success: true, post: newPost });
});

app.put('/api/blog/:id', authMiddleware, (req, res) => {
    const data = readJSON('blog.json') || { posts: [] };
    const index = data.posts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Post not found' });
    data.posts[index] = { ...data.posts[index], ...req.body };
    writeJSON('blog.json', data);
    res.json({ success: true, post: data.posts[index] });
});

app.delete('/api/blog/:id', authMiddleware, (req, res) => {
    const data = readJSON('blog.json') || { posts: [] };
    data.posts = data.posts.filter(p => p.id !== req.params.id);
    writeJSON('blog.json', data);
    res.json({ success: true });
});

// --- Image Upload ---
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
        success: true,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`
    });
});

app.get('/api/images', (req, res) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) return res.json({ images: [] });
    const files = fs.readdirSync(uploadDir)
        .filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f))
        .map(f => ({
            filename: f,
            url: `/uploads/${f}`,
            size: fs.statSync(path.join(uploadDir, f)).size,
            modified: fs.statSync(path.join(uploadDir, f)).mtime
        }));
    res.json({ images: files });
});

app.delete('/api/images/:filename', authMiddleware, (req, res) => {
    const filepath = path.join(__dirname, 'public', 'uploads', req.params.filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// --- Serve data files for frontend ---
app.get('/data/content.json', (req, res) => {
    const content = readJSON('content.json');
    res.json(content || {});
});

app.get('/data/blog.json', (req, res) => {
    const data = readJSON('blog.json');
    res.json(data || { posts: [] });
});

// --- Sitemap ---
app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://suthepgatehostel.com';
    const pages = [
        { loc: '/', priority: '1.0', changefreq: 'weekly' },
        { loc: '/rooms.html', priority: '0.9', changefreq: 'weekly' },
        { loc: '/about.html', priority: '0.7', changefreq: 'monthly' },
        { loc: '/blog.html', priority: '0.8', changefreq: 'daily' },
        { loc: '/contact.html', priority: '0.7', changefreq: 'monthly' }
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
});

// --- robots.txt ---
app.get('/robots.txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: https://suthepgatehostel.com/sitemap.xml

Disallow: /admin.html
Disallow: /api/
`);
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════╗
  ║   Suthep Gate Hostel — Server Running     ║
  ╠═══════════════════════════════════════════╣
  ║                                           ║
  ║   🌐  http://localhost:${PORT}              ║
  ║   🔧  http://localhost:${PORT}/admin.html   ║
  ║                                           ║
  ║   Admin Password: ${ADMIN_PASSWORD}        ║
  ║                                           ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
