// Back-End/routes/product.js
const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/authMiddleware');
// ดึงยามรับไฟล์ที่เราเคยทำไว้ (จาก uploadMiddleware.js)
const upload = require('../middleware/uploadMiddleware'); 
const router = express.Router();

// ==========================================
// 🟢 1. [GET] ดึงข้อมูลสินค้าทั้งหมดมาแสดงผล (ตัวที่หายไป เอาคืนมาแล้วครับ!)
// ==========================================
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
    }
});

// ==========================================
// 🟢 2. [GET] ดึงข้อมูลสินค้าแค่ชิ้นเดียว (ไว้ทำหน้ารายละเอียด)
// ==========================================
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'รหัสสินค้าไม่ถูกต้อง' });
    }
});

// ==========================================
// 🔴 3. [POST] เพิ่มสินค้าใหม่ (โค้ดของคุณธนายุตที่ถูกต้องแล้ว)
// ==========================================
router.post('/', protect, authorize('owner', 'admin'), upload.single('coverImage'), async (req, res) => {
    try {
        // 1. เช็กว่าไฟล์มาถึงไหม
        if (!req.file) {
            return res.status(400).json({ message: 'กรุณาอัปโหลดรูปปกหนังสือ' });
        }

        // 2. ดึงข้อมูลข้อความที่ส่งมาพร้อมรูป
        const { title, author, description, price, stock } = req.body;

        // 3. บันทึกที่อยู่ไฟล์
        const coverImageUrl = req.file.path;

        const newProduct = await Product.create({
            title: title || 'ไม่มีชื่อ', // ใส่ค่าเริ่มต้นกันเหนียว
            author: author || 'ไม่ระบุผู้แต่ง',
            description: description || '',
            price: Number(price) || 0,
            stock: Number(stock) || 0,
            coverImage: coverImageUrl,
            user: req.user.id
        });
        
        res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', product: newProduct });
    } catch (error) {
        console.error("Product Create Error:", error); // ให้มันปริ้น Error ออกมาดูใน Terminal
        res.status(500).json({ message: 'เพิ่มสินค้าไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🔴 4. [PUT] แก้ไขสินค้า (ต้องเป็น Owner หรือ Admin)
// ==========================================
router.put('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
        res.json({ message: 'อัปเดตข้อมูลสำเร็จ', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'อัปเดตข้อมูลไม่สำเร็จ', error: error.message });
    }
});

// ==========================================
// 🔴 5. [DELETE] ลบสินค้า (ต้องมีตัวนี้ ปุ่ม "ลบ" ในตารางถึงจะทำงานครับ)
// ==========================================
router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: 'ไม่พบสินค้านี้' });
        res.json({ message: 'ลบสินค้าสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'ลบสินค้าไม่สำเร็จ', error: error.message });
    }
});

module.exports = router;