// Back-End/routes/order.js
const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User'); // 🌟 เพิ่มบรรทัดนี้เพื่อดึงอีเมลลูกค้า
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const nodemailer = require('nodemailer'); // 🌟 เรียกใช้ไลบรารีส่งอีเมล
const router = express.Router();

// ==========================================
// 🛠️ ฟังก์ชันตั้งค่าการส่งอีเมลผ่าน Brevo (SMTP)
// ==========================================
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // ใช้ false สำหรับ port 587
    auth: {
        user: process.env.EMAIL_USER, // อีเมลที่สมัคร Brevo
        pass: process.env.EMAIL_PASS  // รหัสผ่าน SMTP จาก Brevo
    }
});

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
router.post('/checkout', protect, upload.single('slipImage'), async (req, res) => {
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
// 🟢 [PUT] อัปเดตสถานะการชำระเงิน + ตัดสต๊อก + 📧 ส่งอีเมล (เฉพาะ Admin)
// ==========================================
router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        
        // 🌟 ดึงข้อมูลออเดอร์และ populate หาข้อมูลลูกค้าด้วย
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

            // 🌟 2. ส่งอีเมลแจ้งลูกค้า 🌟
            try {
                const mailOptions = {
                    from: '"E-Bookstore Admin" <noreply@ebookstore.com>', // ชื่อผู้ส่ง
                    to: order.user.email, // ส่งไปที่อีเมลลูกค้าคนที่สั่งซื้อ
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

                // สั่งส่งอีเมล!
                await transporter.sendMail(mailOptions);
                console.log('✅ ส่งอีเมลสำเร็จไปที่:', order.user.email);

            } catch (emailError) {
                console.error('❌ ส่งอีเมลล้มเหลว:', emailError);
                // ถึงส่งเมลพลาด ก็ปล่อยให้ออเดอร์ผ่านไป ไม่ต้องให้ระบบล่ม
            }
        }

        // อัปเดตสถานะของออเดอร์ลงฐานข้อมูล
        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({ message: 'อัปเดตสถานะและตัดสต๊อกสำเร็จ', order });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตสถานะไม่สำเร็จ', error: error.message });
    }
});

module.exports = router;