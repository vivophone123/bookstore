// Back-End/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// ตั้งค่าที่เก็บไฟล์และชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // เก็บไว้ในโฟลเดอร์ uploads
    },
    filename: function (req, file, cb) {
        // ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน (ใส่วันที่และเวลาลงไป)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// ตรวจสอบว่าต้องเป็นไฟล์รูปภาพเท่านั้น (ความปลอดภัยเบื้องต้น)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;