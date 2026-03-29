// Back-End/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// 🌟 ตัวช่วยสำหรับระบบลืมรหัสผ่าน
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ==========================================
// [POST] สมัครสมาชิก
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวอักษรและตัวเลข' });
        }
        
        // เช็กว่ามีอีเมลนี้หรือยัง
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

        const user = await User.create({ username, email, password, role });
        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ', user: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', error: error.message });
    }
});

// ==========================================
// [POST] เข้าสู่ระบบ (Login)
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // หาผู้ใช้จากอีเมล
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

        // เทียบรหัสผ่าน
        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

        // ใส่รหัสลับเป็น String ไปเลย
        const token = jwt.sign({ id: user._id, role: user.role }, 'MySuperSecretKeyForBookstore123', { expiresIn: '1d' });

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: error.message });
    }
});

// ==========================================
// 🟢 [GET/PUT] จัดการข้อมูลส่วนตัว (Profile)
// ==========================================

// ดูโปรไฟล์ตัวเอง (ต้องเข้าสู่ระบบก่อน)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // ไม่ส่งรหัสผ่านกลับไป
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลผู้ใช้ไม่สำเร็จ' });
    }
});

// ลูกค้า/ผู้ใช้ แก้ไขข้อมูลส่วนตัว
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });

        user.username = req.body.username || user.username;
        // ถ้ามีการส่งรหัสผ่านใหม่มา ให้เปลี่ยนด้วย (ระบบจะ Hash ให้อัตโนมัติจากโมเดล User ที่เราทำไว้)
        if (req.body.password) {
            user.password = req.body.password; 
        }

        const updatedUser = await user.save();
        res.json({ message: 'อัปเดตข้อมูลส่วนตัวสำเร็จ', user: { username: updatedUser.username, email: updatedUser.email } });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตข้อมูลไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🔴 [POST] แจ้งลืมรหัสผ่าน (ส่งลิงก์เข้าอีเมลผ่าน SendGrid)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบครับ' });

        // 1. สร้างรหัส Token สุ่มแบบปลอดภัย
        const resetToken = crypto.randomBytes(20).toString('hex');

        // 2. เอา Token ไปเข้ารหัสอีกชั้นก่อนเซฟลงฐานข้อมูล (เพื่อความปลอดภัย)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // ให้เวลา 10 นาทีในการกดลิงก์

        await user.save();

        // 3. สร้างลิงก์สำหรับส่งเข้าอีเมล (ชี้ไปที่หน้าเว็บ Vercel ของเรา)
        const resetUrl = `https://bookstore-nicexyz.vercel.app/reset-password/${resetToken}`;

        // 4. ตั้งค่าอีเมล SendGrid
        const msg = {
            to: user.email,
            from: process.env.SENDGRID_SENDER_EMAIL, 
            subject: '🔒 แจ้งเตือนการรีเซ็ตรหัสผ่าน (E-Bookstore)',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>คำร้องขอเปลี่ยนรหัสผ่าน</h2>
                    <p>คุณได้ทำการร้องขอเพื่อเปลี่ยนรหัสผ่านบัญชี E-Bookstore ของคุณ</p>
                    <p>กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ (ลิงก์มีอายุการใช้งาน 10 นาที):</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 25px; background-color: #e74c3c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0;">รีเซ็ตรหัสผ่าน</a>
                    <p style="color: #7f8c8d; font-size: 12px;">หากคุณไม่ได้ทำรายการนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้ รหัสผ่านของคุณจะยังคงปลอดภัยครับ</p>
                </div>
            `
        };

        await sgMail.send(msg);
        res.json({ message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว กรุณาเช็กอินบ็อกซ์ครับ' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งอีเมล' });
    }
});

// ==========================================
// 🔴 [PUT] ตั้งรหัสผ่านใหม่ (หลังจากกดลิงก์ในอีเมล)
// ==========================================
router.put('/reset-password/:token', async (req, res) => {
    try {
        // 1. เอา Token ที่ได้จาก URL มาเข้ารหัสเพื่อเอาไปค้นหาในฐานข้อมูล
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        // 2. หา User ที่มี Token ตรงกัน และเวลาต้องยังไม่หมด (10 นาที)
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือหมดอายุแล้วครับ' });

        // 3. ตั้งรหัสผ่านใหม่ (ระบบจะ Hash ให้ตอนเซฟอัตโนมัติจาก pre-save hook)
        user.password = req.body.password;

        // 4. ล้างค่า Token เก่าทิ้ง ป้องกันคนเอาลิงก์เดิมมากดซ้ำ
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ! คุณสามารถล็อกอินด้วยรหัสผ่านใหม่ได้เลยครับ' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน' });
    }
});

module.exports = router;