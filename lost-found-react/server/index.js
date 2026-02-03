const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
// ✨ 1. เพิ่ม Library สำหรับจัดการไฟล์
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors()); 
app.use(express.json());

// ✨ 2. ตั้งค่าโฟลเดอร์สำหรับเก็บรูป
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // สร้างโฟลเดอร์ uploads อัตโนมัติถ้ายังไม่มี
}

// ตั้งชื่อไฟล์และที่เก็บ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่กันซ้ำ (เช่น img-1678888.jpg)
        cb(null, 'img-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ✨ 3. เปิดให้หน้าเว็บเข้าถึงไฟล์รูปภาพได้
app.use('/uploads', express.static('uploads'));


// ==========================================
// 🔌 Database Connection
// ==========================================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lost_found_db',
    port: 3306
});

db.connect(err => {
    if (err) console.error('❌ เชื่อมต่อ DB ไม่ได้:', err);
    else console.log('✅ เชื่อมต่อ MySQL สำเร็จ!');
});

// ==========================================
// 🔑 Auth
// ==========================================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server Error' });
        if (results.length > 0) {
            const user = results[0];
            res.json({ success: true, user: { id: user.user_id, username: user.username, fullname: user.fullname, role: user.role } });
        } else {
            res.status(401).json({ success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password, fullname } = req.body;
    const sql = 'INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, "user")';
    db.query(sql, [username, password, fullname], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว' });
            return res.status(500).json({ success: false, message: 'สมัครสมาชิกไม่สำเร็จ' });
        }
        res.json({ success: true, message: 'สมัครสมาชิกสำเร็จ!' });
    });
});

// ==========================================
// 📦 Items Management
// ==========================================

app.get('/api/items', (req, res) => {
    const sql = `
        SELECT 
            items.*, 
            users.fullname AS reporter_name,
            claims.receiver_name, claims.contact_number, claims.claim_date, claims.remark AS claim_remark
        FROM items 
        LEFT JOIN users ON items.created_by = users.user_id 
        LEFT JOIN claims ON items.item_id = claims.item_id
        ORDER BY items.date_found DESC, items.item_id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/items/:id', (req, res) => {
    const sql = `
        SELECT 
            items.*, 
            users.fullname AS reporter_name,
            claims.receiver_name, claims.contact_number, claims.claim_date, claims.remark AS claim_remark
        FROM items 
        LEFT JOIN users ON items.created_by = users.user_id 
        LEFT JOIN claims ON items.item_id = claims.item_id
        WHERE CAST(items.item_id AS UNSIGNED) = ?
    `;
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(results[0]);
    });
});

// ✨ 4. แก้ API Report ให้รับรูปภาพ (upload.single)
app.post('/api/report', upload.single('image'), (req, res) => {
    // ข้อมูลข้อความ
    const { name, category, location, date, description, created_by } = req.body;
    // ข้อมูลรูปภาพ (ถ้ามี)
    const item_image = req.file ? req.file.filename : null;

    const sql = `INSERT INTO items (item_name, category_id, location_found, date_found, description, status_id, created_by, item_image) VALUES (?, ?, ?, ?, ?, '01', ?, ?)`;
    
    db.query(sql, [name, category, location, date, description || '', created_by, item_image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'บันทึกไม่สำเร็จ' });
        }
        res.json({ success: true, message: 'บันทึกเรียบร้อย', id: result.insertId });
    });
});

app.put('/api/items/:id', (req, res) => {
    const { item_name, location_found, description, category_id, status_id } = req.body;
    const { id } = req.params;
    const sql = `UPDATE items SET item_name = ?, location_found = ?, description = ?, category_id = ?, status_id = ? WHERE CAST(item_id AS UNSIGNED) = ?`;
    db.query(sql, [item_name, location_found, description, category_id, status_id, id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'ไม่พบ ID' });
        res.json({ success: true, message: 'แก้ไขสำเร็จ' });
    });
});

app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM items WHERE CAST(item_id AS UNSIGNED) = ?";
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.affectedRows === 0) return res.status(404).json({ success: false });
        res.json({ success: true, message: 'ลบรายการสำเร็จ' });
    });
});

// ==========================================
// 🛡️ Admin Actions
// ==========================================
app.put('/api/items/:id/approve', (req, res) => {
    const sql = "UPDATE items SET status_id = '02' WHERE CAST(item_id AS UNSIGNED) = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

app.put('/api/items/:id/claim', (req, res) => {
    const itemId = req.params.id;
    const { receiverName, contactNumber, claimDate, remark } = req.body;
    const updateStatusSql = "UPDATE items SET status_id = '03' WHERE item_id = ?";
    
    db.query(updateStatusSql, [itemId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Update Status Error' });

        const insertClaimSql = `INSERT INTO claims (item_id, receiver_name, contact_number, claim_date, remark) VALUES (?, ?, ?, ?, ?)`;
        db.query(insertClaimSql, [itemId, receiverName, contactNumber, claimDate, remark || '-'], (insertErr, insertResult) => {
            if (insertErr) return res.status(500).json({ success: false, message: 'Insert Claim Error' });
            res.json({ success: true, message: 'บันทึกการคืนและเก็บหลักฐานเรียบร้อย' });
        });
    });
});

// ==========================================
// 📂 My History
// ==========================================
app.get('/api/items/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT items.*, categories.category_name
        FROM items
        LEFT JOIN categories ON items.category_id = categories.category_id
        WHERE items.created_by = ?
        ORDER BY items.date_found DESC
    `;
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server Error' });
        res.json(results);
    });
});

// ==========================================
// 📂 Categories, Users, Statuses
// ==========================================
app.get('/api/categories', (req, res) => { db.query("SELECT * FROM categories", (err, results) => res.json(err ? [] : results)); });
app.post('/api/categories', (req, res) => {
    const { category_id, category_name } = req.body;
    db.query("INSERT INTO categories (category_id, category_name) VALUES (?, ?)", [category_id, category_name], (err) => res.json({ success: !err }));
});
app.put('/api/categories/:id', (req, res) => {
    db.query("UPDATE categories SET category_name = ? WHERE category_id = ?", [req.body.category_name, req.params.id], (err) => res.json({ success: true }));
});
app.delete('/api/categories/:id', (req, res) => {
    db.query("DELETE FROM categories WHERE category_id = ?", [req.params.id], (err) => {
        if (err && err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(400).json({ success: false, message: 'มีสิ่งของอยู่ในหมวดหมู่นี้' });
        res.json({ success: true });
    });
});

app.get('/api/users', (req, res) => { db.query('SELECT user_id, username, fullname, role FROM users', (err, results) => res.json(err ? [] : results)); });
app.put('/api/users/:id/role', (req, res) => {
    db.query("UPDATE users SET role = ? WHERE user_id = ?", [req.body.role, req.params.id], (err) => res.json({ success: true }));
});
app.put('/api/users/:id/update-profile', (req, res) => {
    db.query("UPDATE users SET fullname = ? WHERE user_id = ?", [req.body.fullname, req.params.id], (err) => res.json({ success: true }));
});
app.delete('/api/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE user_id = ?", [req.params.id], (err) => res.json({ success: true }));
});

app.get('/api/statuses', (req, res) => { db.query("SELECT * FROM statuses", (err, results) => res.json(err ? [] : results)); });

// ==========================================
// 📊 Admin Stats
// ==========================================
app.get('/api/admin/stats', (req, res) => {
    const sql = `
        SELECT 
            SUM(CASE WHEN status_id = '01' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status_id = '02' THEN 1 ELSE 0 END) as waiting,
            SUM(CASE WHEN status_id = '03' THEN 1 ELSE 0 END) as returned,
            COUNT(*) as total
        FROM items
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database Error' });
        res.json(results[0]);
    });
});

app.listen(3000, () => { console.log('🚀 Server running at http://localhost:3000'); });