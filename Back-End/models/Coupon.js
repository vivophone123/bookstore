// Back-End/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true }, // โค้ดส่วนลด (เช่น NEWYEAR20)
    discount: { type: Number, required: true }, // ส่วนลดเป็นเปอร์เซ็นต์ หรือจำนวนเงิน
    isActive: { type: Boolean, default: true }, // เปิด/ปิด การใช้งาน
    expireDate: { type: Date, required: true } // วันหมดอายุ
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);