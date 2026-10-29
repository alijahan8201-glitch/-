const express = require('express');
const { createClient } = require('@libsql/client');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const upload = multer({ dest: 'uploads/' }); 

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDB() {
    try {
        await db.execute(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT, description TEXT, team_name TEXT,
            image_url TEXT, video_url TEXT, 
            total_score INTEGER DEFAULT 0, vote_count INTEGER DEFAULT 0
        )`);

        await db.execute(`CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER, voter_id TEXT,
            first_name TEXT, last_name TEXT, phone_number TEXT,
            score INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(project_id, voter_id)
        )`);

        try {
            await db.execute("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'robot'");
        } catch (e) {}
        try {
            await db.execute("ALTER TABLE projects ADD COLUMN is_creator INTEGER DEFAULT 0");
        } catch (e) {}
        try {
            await db.execute("UPDATE projects SET category = 'python' WHERE category = 'game'");
        } catch (e) {}

        console.log("✅ DB is ready.");
    } catch (err) { console.error("DB Error:", err); }
}
initDB();

async function uploadToImgbb(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');
        const formData = new FormData();
        formData.append('key', process.env.IMGBB_API_KEY);
        formData.append('image', base64Image);
        
        const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
        const data = await response.json();
        fs.unlinkSync(filePath); 
        if (data.success) return data.data.url;
        throw new Error('Imgbb upload failed');
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
}

app.get('/api/projects', async (req, res) => {
    try {
        const result = await db.execute(`SELECT *, (CASE WHEN vote_count = 0 THEN 0 ELSE ROUND(CAST(total_score AS REAL) / vote_count, 1) END) AS avg_score FROM projects ORDER BY avg_score DESC, vote_count DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/rate', async (req, res) => {
    const { project_id, voter_id, first_name, last_name, phone_number, score } = req.body;
    if (!/^09\d{9}$/.test(phone_number)) return res.status(400).json({ success: false, message: "شماره نامعتبر است" });
    try {
        const existing = await db.execute({ sql: "SELECT * FROM votes WHERE project_id = ? AND voter_id = ?", args: [project_id, voter_id] });
        if (existing.rows.length > 0) return res.json({ success: false, message: "شما قبلاً به این پروژه رأی داده‌اید" });
        
        await db.execute({ sql: "INSERT INTO votes (project_id, voter_id, first_name, last_name, phone_number, score) VALUES (?, ?, ?, ?, ?, ?)", args: [project_id, voter_id, first_name, last_name, phone_number, score] });
        await db.execute({ sql: "UPDATE projects SET total_score = total_score + ?, vote_count = vote_count + 1 WHERE id = ?", args: [score, project_id] });
        
        res.json({ success: true, message: "امتیاز ثبت شد!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==================== رأی نامحدود برای ادمین ====================
app.post('/api/admin/unlimited-vote', async (req, res) => {
    const { password, project_id, score } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });
    try {
        await db.execute({ 
            sql: "UPDATE projects SET total_score = total_score + ?, vote_count = vote_count + 1 WHERE id = ?", 
            args: [score, project_id] 
        });
        res.json({ success: true, message: "رأی ثبت شد!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ==================== صفر کردن رأی‌ها ====================
app.post('/api/admin/reset-votes', async (req, res) => {
    const { password } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز عبور اشتباه است" });
    try {
        await db.execute("UPDATE projects SET total_score = 0, vote_count = 0");
        await db.execute("DELETE FROM votes");
        res.json({ success: true, message: "تمام رأی‌ها و امتیازها صفر شدند!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ==================== بقیه APIها ====================
app.post('/api/admin/add', upload.single('image'), async (req, res) => {
    const { password, title, description, team_name, video_url, image_url_text, category, is_creator } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز اشتباه است" });

    let final_image_url = image_url_text || ''; 
    if (req.file) {
        try { final_image_url = await uploadToImgbb(req.file.path); } catch (e) { return res.json({ success: false, message: "خطا در آپلود عکس" }); }
    }

    try {
        await db.execute({ 
            sql: "INSERT INTO projects (title, description, team_name, image_url, video_url, category, is_creator) VALUES (?, ?, ?, ?, ?, ?, ?)", 
            args: [title, description, team_name, final_image_url, video_url, category || 'robot', is_creator || 0] 
        });
        res.json({ success: true, message: "پروژه اضافه شد" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/edit/:id', upload.single('image'), async (req, res) => {
    const { password, title, description, team_name, video_url, image_url_text, category, is_creator } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز اشتباه است" });

    const id = req.params.id;
    try {
        const result = await db.execute({ sql: "SELECT image_url FROM projects WHERE id = ?", args: [id] });
        let final_image_url = image_url_text || result.rows[0].image_url; 
        
        if (req.file) {
            try { final_image_url = await uploadToImgbb(req.file.path); } catch (e) { return res.json({ success: false, message: "خطا در آپلود عکس" }); }
        }

        await db.execute({ 
            sql: "UPDATE projects SET title = ?, description = ?, team_name = ?, image_url = ?, video_url = ?, category = ?, is_creator = ? WHERE id = ?", 
            args: [title, description, team_name, final_image_url, video_url, category || 'robot', is_creator || 0, id] 
        });
        res.json({ success: true, message: "پروژه ویرایش شد" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/delete/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== '123456') return res.json({ success: false, message: "رمز اشتباه است" });
    try {
        await db.execute({ sql: "DELETE FROM votes WHERE project_id = ?", args: [req.params.id] });
        await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [req.params.id] });
        res.json({ success: true, message: "حذف شد" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/participants', async (req, res) => {
    try {
        const result = await db.execute(`SELECT v.first_name, v.last_name, v.phone_number, v.score, p.title as project_title, v.created_at FROM votes v JOIN projects p ON v.project_id = p.id ORDER BY v.created_at DESC`);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/draw', async (req, res) => {
    try {
        const result = await db.execute("SELECT first_name, last_name, phone_number FROM votes");
        if (result.rows.length === 0) return res.json({ success: false, message: "کسی نیست" });
        const winner = result.rows[Math.floor(Math.random() * result.rows.length)];
        res.json({ success: true, name: `${winner.first_name} ${winner.last_name}`, phone: winner.phone_number });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
