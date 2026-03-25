// Back-End/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. ด่านตรวจว่า Login หรือยัง (มี Token ไหม)
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // ดึง Token ออกมา (ตัดคำว่า Bearer ออก)
            token = req.headers.authorization.split(' ')[1];
            
            // ถอดรหัส Token (OWASP A07)
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'MySuperSecretKeyForBookstoreProject123!');
            
            // หาข้อมูล User จาก Database แล้วแปะไปกับ req (ไม่เอา Password มาด้วย)
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token ไม่ถูกต้อง หรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'ไม่มี Token อนุญาตให้เข้าถึง กรุณาเข้าสู่ระบบ' });
    }
};

// 2. ด่านตรวจสิทธิ์การเข้าถึง (Role-based) (OWASP A01)
const authorize = (...roles) => {
    return (req, res, next) => {
        // ถ้า Role ของ User ไม่ตรงกับที่กำหนดไว้
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `ผู้ใช้ระดับ ${req.user.role} ไม่มีสิทธิ์เข้าถึงส่วนนี้` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize };