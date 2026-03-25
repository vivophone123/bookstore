// Back-End/routes/coupon.js
const express = require('express');
const Coupon = require('../models/Coupon');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// 🔴 [POST] เจ้าของร้านสร้างคูปองใหม่
router.post('/', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { code, discount, expireDate } = req.body;
        const newCoupon = await Coupon.create({ code, discount, expireDate });
        res.status(201).json({ message: 'สร้างคูปองสำเร็จ', coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: 'สร้างคูปองไม่สำเร็จ (โค้ดอาจซ้ำ)', error: error.message });
    }
});

// 🟢 [POST] ลูกค้าตรวจสอบและใช้งานคูปองตอน Checkout
router.post('/validate', protect, async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) return res.status(404).json({ message: 'ไม่พบคูปองนี้' });
        if (!coupon.isActive) return res.status(400).json({ message: 'คูปองนี้ถูกปิดใช้งานแล้ว' });
        if (new Date() > new Date(coupon.expireDate)) return res.status(400).json({ message: 'คูปองนี้หมดอายุแล้ว' });

        res.json({ message: 'คูปองสามารถใช้งานได้', discount: coupon.discount });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบคูปอง' });
    }
});

module.exports = router;