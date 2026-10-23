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

// تنظیمات آپلود موقت عکس
const upload = multer({ dest: 'uploads/' }); 

// اتصال به دیتابیس ابری Turso
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// تابع ساخت جداول و تنظیمات اولیه دیتابیس
async function initDB() {
    try {
        // 1. ساخت جدول پروژه‌ها
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

        // 2. ساخت جدول رأی‌ها
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

        // 3. اضافه کردن ستون دسته‌بندی در صورت وجود نداشتن
        try {
            await db.execute("ALTER TABLE projects ADD COLUMN category TEXT DEFAULT 'robot'");
            // انتقال پروژه‌های قبلی به دسته بازی‌ها (اگر کلمه بازی در اسمشون بود)
            await db.execute("UPDATE projects SET category = 'game' WHERE title LIKE '%بازی%' OR title LIKE '%سرگرمی%'");
            console.log("✅ Category column checked/added.");
        } catch (e) {
            // اگر ستون از قبل وجود داشته باشد، این خط ارور می‌دهد که آن را نادیده می‌گیریم
        }

        console.log("✅ DB is ready.");
    } catch (err) { 
        console.error("DB Error:", err); 
    }
}
initDB();

// تابع آپلود عکس به Imgbb
async function uploadToImgbb(filePath) {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');
        const formData = new FormData();
        formData.append('key', process.env.IMGBB_API_KEY);
        formData.append('image', base64Image);
        
        const response = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData });
        const data = await response.json();
        
        // پاک کردن فایل موقت از سرور
        fs.unlinkSync(filePath); 
        
        if (data.success) return data.data.url;
        throw new Error('Imgbb upload failed');
    } catch (err) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw err;
    }
}

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
    
    // چک کردن فرمت شماره موبایل
    if (!/^09\d{9}$/.test(phone_number)) {
        return res.status(400).json({ success: false, message: "شماره موبایل نامعتبر است" });
    }

    try {
        // چک کردن اینکه کاربر قبلا رأی داده یا نه
        const existing = await db.execute({ 
            sql: "SELECT * FROM votes WHERE project_id = ? AND voter_id = ?", 
            args: [project_id, voter_id] 
        });
        
        if (existing.rows.length > 0) {
            return res.json({ success: false, message: "شما قبلاً به این پروژه رأی داده‌اید" });
        }
        
        // ثبت رأی
        await db.execute({ 
            sql: "INSERT INTO votes (project_id, voter_id, first_name, last_name, phone_number, score) VALUES (?, ?, ?, ?, ?, ?)", 
            args: [project_id, voter_id, first_name, last_name, phone_number, score] 
        });
        
        // آپدیت کردن تعداد و مجموع امتیاز پروژه
        await db.execute({ 
            sql: "UPDATE projects SET total_score = total_score + ?, vote_count = vote_count + 1 WHERE id = ?", 
            args: [score, project_id] 
        });
        
        res.json({ success: true, message: "امتیاز شما با موفقیت ثبت شد!" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// افزودن پروژه جدید (توسط ادمین)
app.post('/api/admin/add', upload.single('image'), async (req, res) => {
    const { password, title, description, team_name, video_url, image_url_text, category } = req.body;
    
    if (password !== '123456') {
        return res.json({ success: false, message: "رمز عبور اشتباه است" });
    }

    let final_image_url = image_url_text || ''; 
    
    // اگر ادمین فایل عکس آپلود کرده بود
    if (req.file) {
        try { 
            final_image_url = await uploadToImgbb(req.file.path); 
        } catch (e) { 
            return res.json({ success: false, message: "خطا در آپلود عکس به سرور ابری" }); 
        }
    }

    try {
        await db.execute({ 
            sql: "INSERT INTO projects (title, description, team_name, image_url, video_url, category) VALUES (?, ?, ?, ?, ?, ?)", 
            args: [title, description, team_name, final_image_url, video_url, category || 'robot'] 
        });
        res.json({ success: true, message: "پروژه اضافه شد" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ویرایش پروژه (توسط ادمین)
app.put('/api/admin/edit/:id', upload.single('image'), async (req, res) => {
    const { password, title, description, team_name, video_url, image_url_text, category } = req.body;
    
    if (password !== '123456') {
        return res.json({ success: false, message: "رمز عبور اشتباه است" });
    }

    const id = req.params.id;
    try {
        const result = await db.execute({ sql: "SELECT image_url FROM projects WHERE id = ?", args: [id] });
        let final_image_url = image_url_text || result.rows[0].image_url; 
        
        // اگر عکس جدیدی آپلود شده بود
        if (req.file) {
            try { 
                final_image_url = await uploadToImgbb(req.file.path); 
            } catch (e) { 
                return res.json({ success: false, message: "خطا در آپلود عکس" }); 
            }
        }

        await db.execute({ 
            sql: "UPDATE projects SET title = ?, description = ?, team_name = ?, image_url = ?, video_url = ?, category = ? WHERE id = ?", 
            args: [title, description, team_name, final_image_url, video_url, category || 'robot', id] 
        });
        res.json({ success: true, message: "پروژه با موفقیت ویرایش شد" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// حذف پروژه (توسط ادمین)
app.delete('/api/admin/delete/:id', async (req, res) => {
    const { password } = req.body;
    if (password !== '123456') {
        return res.json({ success: false, message: "رمز اشتباه است" });
    }
    
    try {
        // اول رأی‌های مربوط به این پروژه رو پاک میکنیم
        await db.execute({ sql: "DELETE FROM votes WHERE project_id = ?", args: [req.params.id] });
        // بعد خود پروژه رو پاک میکنیم
        await db.execute({ sql: "DELETE FROM projects WHERE id = ?", args: [req.params.id] });
        res.json({ success: true, message: "پروژه حذف شد" });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// دریافت لیست شرکت‌کننده‌ها (برای پنل ادمین)
app.get('/api/admin/participants', async (req, res) => {
    try {
        const result = await db.execute(`
            SELECT v.first_name, v.last_name, v.phone_number, v.score, p.title as project_title, v.created_at 
            FROM votes v 
            JOIN projects p ON v.project_id = p.id 
            ORDER BY v.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// قرعه‌کشی (انتخاب یک برنده شانسی)
app.get('/api/admin/draw', async (req, res) => {
    try {
        const result = await db.execute("SELECT first_name, last_name, phone_number FROM votes");
        if (result.rows.length === 0) {
            return res.json({ success: false, message: "هنوز کسی در مسابقه شرکت نکرده است" });
        }
        
        const winner = result.rows[Math.floor(Math.random() * result.rows.length)];
        res.json({ 
            success: true, 
            name: `${winner.first_name} ${winner.last_name}`, 
            phone: winner.phone_number 
        });
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// ==========================================
// بخش مهم: تنظیمات پورت برای Render
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
