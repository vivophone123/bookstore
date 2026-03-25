// Back-End/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ลูกค้าที่สั่งซื้อ
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            title: { type: String, required: true },
            price: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    slipImage: { type: String, required: true }, // เก็บที่อยู่ไฟล์สลิปโอนเงิน
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'rejected'], 
        default: 'pending' // ค่าเริ่มต้นคือ "รอตรวจสอบ"
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);