// Back-End/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String, default: 'ทั่วไป' },                        
    coverImage: { type: String, default: 'https://via.placeholder.com/150' }, // เก็บ URL รูปภาพ
    user: { 

        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);