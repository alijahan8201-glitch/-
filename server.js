const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// اتصال به دیتابیس ابری Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// ساخت جدول‌ها
async function initDB() {
    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            team_name TEXT,
            image_url TEXT,
            video_url TEXT, 
            total_score INTEGER DEFAULT 0,
            vote_count INTEGER DEFAULT 0
        )`);
        await db.execute(`CREATE TABLE IF NOT EXISTS votes (
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
        console.log("✅ Tables are ready.");
    } catch (err) {
        console.error("Database Initialization Error:", err);
    }
}
initDB();

// دریافت لیست پروژه‌ها
app.get('/api/projects', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT *, 
            (CASE WHEN vote_count = 0 THEN 0 ELSE ROUND(CAST(total_score AS REAL) / vote_count, 1) END) AS avg_score 
            FROM projects 
            ORDER BY avg_score DESC, vote_count DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ثبت امتیاز جدید
app.post('/api/rate', async (req, res) => {
    const { project_id, voter_id, first_name, last_name, phone_number, score } = req.body;
    
    const phoneRegex = /^09\d{9}$/;
    if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ success: false, message: "شماره موبایل نامعتبر است" });
    }

    try {
        const existing = await db.execute({
            sql: "SELECT * FROM votes WHERE project_id = ? AND voter_id = ?",
            args: [project_id, voter_id]
        });
        
        if (existing.rows.length > 0) {
            return res.json({ success: false, message: "شما قبلاً به این پروژه امتیاز داده‌اید" });
        }
        
        await db.execute({
            sql: "INSERT INTO votes (project_id, voter_id, first_name, last_name, phone_number, score) VALUES (?, ?, ?, ?, ?, ?)",
            args: [project_id, voter_id, first_name, last_name, phone_number, score]
        });
        
        await db.execute({
            sql: "UPDATE projects SET total_score = total_score + ?, vote_count = vote_count + 1 WHERE id = ?",
            args: [score, project_id]
        });
        
        res.json({ success: true, message: "امتیاز شما با موفقیت ثبت شد!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// افزودن پروژه جدید (فقط لینک)
app.post('/api/admin/add', async (req, res) => {
    const { password, title, description, team_name, image_url, video_url } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });

    try {
        await db.execute({
            sql: "INSERT INTO projects (title, description, team_name, image_url, video_url) VALUES (?, ?, ?, ?, ?)",
            args: [title, description, team_name, image_url, video_url]
        });
        res.json({ success: true, message: "پروژه اضافه شد" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ویرایش پروژه (فقط لینک)
app.put('/api/admin/edit/:id', async (req, res) => {
    const { password, title, description, team_name, image_url, video_url } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });

    const id = req.params.id;
    try {
        await db.execute({
            sql: "UPDATE projects SET title = ?, description = ?, team_name = ?, image_url = ?, video_url = ? WHERE id = ?",
            args: [title, description, team_name, image_url, video_url, id]
        });
        res.json({ success: true, message: "پروژه با موفقیت ویرایش شد" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// حذف پروژه
app.delete('/api/admin/delete/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز اشتباه است" });
    try {
        await db.execute({ sql: "DELETE FROM votes WHERE project_id = ?", args: [req.params.id] });
        await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [req.params.id] });
        res.json({ success: true, message: "پروژه حذف شد" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// دریافت لیست شرکت‌کننده‌ها
app.get('/api/admin/participants', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT v.first_name, v.last_name, v.phone_number, v.score, p.title as project_title, v.created_at 
            FROM votes v JOIN projects p ON v.project_id = p.id ORDER BY v.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// قرعه‌کشی
app.get('/api/admin/draw', async (req, res) => {
    try {
        const result = await db.execute("SELECT first_name, last_name, phone_number FROM votes");
        if (result.rows.length === 0) return res.json({ success: false, message: "شرکت‌کننده‌ای یافت نشد" });
        const randomIndex = Math.floor(Math.random() * result.rows.length);
        const winner = result.rows[randomIndex];
        res.json({ success: true, name: `${winner.first_name} ${winner.last_name}`, phone: winner.phone_number });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
