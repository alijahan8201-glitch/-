const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, './uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        team_name TEXT,
        image_url TEXT,
        video_url TEXT, 
        total_score INTEGER DEFAULT 0,
        vote_count INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        voter_id TEXT,
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        score INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, voter_id)
    )`);
});

app.get('/api/projects', (req, res) => {
    const query = `
        SELECT *, 
        (CASE WHEN vote_count = 0 THEN 0 ELSE ROUND(CAST(total_score AS REAL) / vote_count, 1) END) AS avg_score 
        FROM projects 
        ORDER BY avg_score DESC, vote_count DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/rate', (req, res) => {
    const { project_id, voter_id, first_name, last_name, phone_number, score } = req.body;
    db.get("SELECT * FROM votes WHERE project_id = ? AND voter_id = ?", [project_id, voter_id], (err, row) => {
        if (row) return res.json({ success: false, message: "شما قبلاً به این پروژه امتیاز داده‌اید" });
        db.run("INSERT INTO votes (project_id, voter_id, first_name, last_name, phone_number, score) VALUES (?, ?, ?, ?, ?, ?)", 
        [project_id, voter_id, first_name, last_name, phone_number, score], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            db.run("UPDATE projects SET total_score = total_score + ?, vote_count = vote_count + 1 WHERE id = ?", 
            [score, project_id], function(err) {
                res.json({ success: true, message: "امتیاز شما با موفقیت ثبت شد!" });
            });
        });
    });
});

app.post('/api/admin/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
    const { password, title, description, team_name } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });

    const image_url = req.files['image'] ? 'uploads/' + req.files['image'][0].filename : '';
    const video_url = req.files['video'] ? 'uploads/' + req.files['video'][0].filename : '';

    db.run("INSERT INTO projects (title, description, team_name, image_url, video_url) VALUES (?, ?, ?, ?, ?)",
        [title, description, team_name, image_url, video_url], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "پروژه اضافه شد" });
        });
});

// مسیر جدید برای ویرایش پروژه
app.put('/api/admin/edit/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
    const { password, title, description, team_name } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });

    const id = req.params.id;
    // اول اطلاعات قبلی رو می‌گیریم که اگه فایل جدید آپلود نشد، فایل قبلی حفظ بشه
    db.get("SELECT image_url, video_url FROM projects WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(500).json({ error: "پروژه پیدا نشد" });

        const image_url = req.files['image'] ? 'uploads/' + req.files['image'][0].filename : row.image_url;
        const video_url = req.files['video'] ? 'uploads/' + req.files['video'][0].filename : row.video_url;

        db.run("UPDATE projects SET title = ?, description = ?, team_name = ?, image_url = ?, video_url = ? WHERE id = ?",
            [title, description, team_name, image_url, video_url, id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, message: "پروژه با موفقیت ویرایش شد" });
            });
    });
});

app.delete('/api/admin/delete/:id', (req, res) => {
    const { password } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز اشتباه است" });
    db.run("DELETE FROM votes WHERE project_id = ?", [req.params.id], (err) => {
        db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, message: "پروژه حذف شد" });
        });
    });
});

app.get('/api/admin/participants', (req, res) => {
    const query = `
        SELECT v.first_name, v.last_name, v.phone_number, v.score, p.title as project_title, v.created_at 
        FROM votes v JOIN projects p ON v.project_id = p.id ORDER BY v.created_at DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/draw', (req, res) => {
    db.all("SELECT first_name, last_name, phone_number FROM votes", [], (err, rows) => {
        if (err || rows.length === 0) return res.json({ success: false, message: "شرکت‌کننده‌ای یافت نشد" });
        const randomIndex = Math.floor(Math.random() * rows.length);
        const winner = rows[randomIndex];
        res.json({ success: true, name: `${winner.first_name} ${winner.last_name}`, phone: winner.phone_number });
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
