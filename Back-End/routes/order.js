// Back-End/routes/order.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const sgMail = require('@sendgrid/mail'); // 🌟 เรียกใช้ SendGrid
const router = express.Router();

// ==========================================
// 🛠️ ตั้งค่า API Key ของ SendGrid
// ==========================================
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ==========================================
// 🟢 [GET] ดึงประวัติการสั่งซื้อของตัวเอง (สำหรับลูกค้า)
// ==========================================
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('items.product', 'title coverImage price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลประวัติไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🟢 [GET] ดึงข้อมูลออเดอร์ทั้งหมด (สำหรับ Admin)
// ==========================================
router.get('/', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate('items.product', 'title price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'ดึงข้อมูลออเดอร์ไม่สำเร็จ' });
    }
});

// ==========================================
// 🟢 [POST] สร้างคำสั่งซื้อใหม่ + อัปโหลดสลิป
// ==========================================
router.post('/', protect, upload.single('slipImage'), async (req, res) => {
    try {
        const { items, totalAmount } = req.body;
        
        let slipImageUrl = '';
        if (req.file) {
            slipImageUrl = req.file.path;
        }

        let parsedItems = [];
        if (typeof items === 'string') {
            parsedItems = JSON.parse(items);
        } else {
            parsedItems = items;
        }

        const newOrder = await Order.create({
            user: req.user.id,
            items: parsedItems,
            totalAmount: Number(totalAmount),
            slipImage: slipImageUrl,
            paymentStatus: 'pending'
        });

        res.status(201).json({ message: 'สั่งซื้อสำเร็จ! รอแอดมินตรวจสอบสลิป', order: newOrder });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ message: 'สั่งซื้อไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🟢 [PUT] อัปเดตสถานะการชำระเงิน + ตัดสต๊อก + 📧 ส่งอีเมลด้วย SendGrid
// ==========================================
router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อนี้' });
        }

        // ถ้าสถานะเดิมยังไม่เสร็จ และกำลังจะเปลี่ยนเป็น 'completed'
        if (paymentStatus === 'completed' && order.paymentStatus !== 'completed') {
            
            // 1. ตัดสต๊อกหนังสือ
            for (let item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -1 }
                });
            }

            // 🌟 2. ส่งอีเมลด้วย SendGrid 🌟
            try {
                const msg = {
                    to: order.user.email, // ส่งไปที่อีเมลลูกค้า
                    from: process.env.SENDGRID_SENDER_EMAIL, // 🌟 ต้องเป็นอีเมลที่ยืนยันกับ SendGrid แล้วเท่านั้น
                    subject: `🎉 อนุมัติคำสั่งซื้อเรียบร้อยแล้ว (ออเดอร์ #${order._id.toString().slice(-6)})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #2ecc71;">ขอบคุณที่อุดหนุนครับ คุณ ${order.user.username}!</h2>
                            <p>แอดมินได้ทำการตรวจสอบสลิปและ <strong>อนุมัติคำสั่งซื้อของคุณเรียบร้อยแล้ว</strong></p>
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>รหัสคำสั่งซื้อ:</strong> ${order._id}</p>
                                <p><strong>ยอดชำระเงิน:</strong> ฿${order.totalAmount}</p>
                                <p><strong>สถานะ:</strong> <span style="color: #2ecc71; font-weight: bold;">ชำระเงินเรียบร้อย</span></p>
                            </div>
                            <p>คุณสามารถดาวน์โหลดหรืออ่านหนังสือที่ซื้อไว้ได้ในระบบเลยครับ</p>
                            <p>ขอให้สนุกกับการอ่านนะครับ 📚</p>
                        </div>
                    `
                };

                await sgMail.send(msg);
                console.log('✅ ส่งอีเมลผ่าน SendGrid สำเร็จไปที่:', order.user.email);

            } catch (emailError) {
                console.error('❌ ส่งอีเมลล้มเหลว:', emailError.response ? emailError.response.body : emailError);
            }
        }

        // อัปเดตสถานะ
        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({ message: 'อัปเดตสถานะและตัดสต๊อกสำเร็จ', order });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตสถานะไม่สำเร็จ', error: error.message });
    }
});

module.exports = router;