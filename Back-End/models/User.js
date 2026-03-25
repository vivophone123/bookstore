// Back-End/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['customer', 'owner', 'admin'], 
        default: 'customer' 
    }
}, { timestamps: true });

// เข้ารหัสผ่านก่อนบันทึกลง Database เสมอ (OWASP A02)
// เข้ารหัสผ่านก่อนบันทึกลง Database เสมอ (OWASP A02)
// เข้ารหัสผ่านก่อนบันทึกลง Database (เวอร์ชัน Mongoose ใหม่ ไม่ต้องใช้ next)
userSchema.pre('save', async function () {
    // ถ้าไม่ได้แก้รหัสผ่าน ก็ให้ผ่านไปเลย
    if (!this.isModified('password')) {
        return; 
    }
    
    // ถ้ามีการตั้งรหัสผ่านใหม่ ให้เข้ารหัส (Hash)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ฟังก์ชันเทียบรหัสผ่านตอน Login
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);