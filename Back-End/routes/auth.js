// Back-End/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// [POST] สมัครสมาชิก
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

// [POST] เข้าสู่ระบบ (Login)
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

// ... โค้ดเดิมใน routes/auth.js ...

// 🟢 [PUT] ลูกค้า/ผู้ใช้ แก้ไขข้อมูลส่วนตัว (ต้อง Login ก่อน)
router.put('/profile', require('../middleware/authMiddleware').protect, async (req, res) => {
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

// 🟡 [POST] ลืมรหัสผ่าน (จำลองการรีเซ็ตโดยไม่ต้องใช้ Email OTP เพื่อความไว)
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });

        // เปลี่ยนรหัสผ่านและบันทึก
        user.password = newPassword;
        await user.save();

        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย' });
    } catch (error) {
        res.status(500).json({ message: 'รีเซ็ตรหัสผ่านไม่สำเร็จ', error: error.message });
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

// แก้ไขโปรไฟล์ตัวเอง
router.put('/profile', protect, async (req, res) => {
    try {
        const { username, email } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { username, email }, 
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตข้อมูลไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🔴 [POST] รีเซ็ตรหัสผ่าน (ลืมรหัสผ่าน)
// ==========================================
// *หมายเหตุ: ในระบบจริงต้องส่งอีเมลยืนยัน แต่เพื่อจำลองโปรเจกต์ เราจะให้เปลี่ยนรหัสผ่านได้เลยถ้ายืนยันอีเมลถูกต้อง
router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        // 1. หาผู้ใช้จากอีเมล
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'ไม่พบอีเมลนี้ในระบบ' });

        // 2. เปลี่ยนรหัสผ่านใหม่
        user.password = newPassword; 
        // *หมายเหตุ: userSchema.pre('save') ที่เราเคยเขียนไว้ จะทำการ Hash รหัสใหม่ให้อัตโนมัติ!
        await user.save(); 

        res.json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย' });
    } catch (error) {
        res.status(500).json({ message: 'รีเซ็ตรหัสผ่านไม่สำเร็จ', error: error.message });
    }
});

module.exports = router;