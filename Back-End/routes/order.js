// Back-End/routes/order.js
const express = require('express');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // ดึงตัวรับไฟล์มาใช้
const router = express.Router();

// 🟢 [POST] ลูกค้าสั่งซื้อสินค้าพร้อมแนบสลิป (ต้อง Login เป็น Customer)
// ใช้ upload.single('slip') เพื่อรับไฟล์รูป 1 ไฟล์ที่ส่งมาในชื่อฟิลด์ 'slip'
router.post('/checkout', protect, authorize('customer'), upload.single('slip'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาแนบสลิปชำระเงิน' });
        }

        // แปลงข้อมูล items จาก JSON String ให้กลับเป็น Array (เพราะส่งมากับ Form Data)
        const items = JSON.parse(req.body.items);
        const totalAmount = req.body.totalAmount;

        const newOrder = await Order.create({
            user: req.user.id,
            items: items,
            totalAmount: totalAmount,
            slipImage: req.file.path // บันทึกที่อยู่ไฟล์ลง Database
        });

        res.status(201).json({ message: 'สั่งซื้อและอัปโหลดสลิปสำเร็จ', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'สั่งซื้อไม่สำเร็จ', error: error.message });
    }
});

// 🔴 [GET] เจ้าของร้าน/แอดมิน ดูคำสั่งซื้อทั้งหมด
router.get('/', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        // .populate('user') จะดึงข้อมูลชื่อลูกค้ามาโชว์ด้วย
        const orders = await Order.find().populate('user', 'username email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลคำสั่งซื้อไม่สำเร็จ' });
    }
});

// 🔴 [PUT] เจ้าของร้าน/แอดมิน อัปเดตสถานะการชำระเงิน (เช่น เปลี่ยนเป็น completed)
router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { paymentStatus } = req.body; // รับค่าสถานะใหม่มา
        const order = await Order.findByIdAndUpdate(
            req.params.id, 
            { paymentStatus: paymentStatus }, 
            { new: true }
        );
        
        if (!order) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });
        res.json({ message: 'อัปเดตสถานะสำเร็จ', order });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตสถานะไม่สำเร็จ', error: error.message });
    }
});

module.exports = router;