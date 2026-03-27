// Back-End/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    
    // 🌟 ตัวการอยู่ที่นี่ครับ! เราต้องบังคับให้ Database เปิดรับคำว่า category
    category: { type: String, default: 'ทั่วไป' }, 
    sold: { type: Number, default: 0 },
    
    coverImage: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);