// Front-end/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    // ดึง Token มาจาก URL
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (password !== confirmPassword) {
            return setError('รหัสผ่านทั้งสองช่องไม่ตรงกันครับ');
        }

        try {
            const res = await axios.put(`https://bookstore-api-bmay.onrender.com/api/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            // เปลี่ยนรหัสเสร็จ ให้เด้งไปหน้า Login อัตโนมัติหลังผ่านไป 3 วินาที
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'ลิงก์นี้หมดอายุหรือไม่ถูกต้อง');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>ตั้งรหัสผ่านใหม่</h2>

            {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>✅ {message}<br/><small>กำลังพาไปหน้า Login...</small></div>}
            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>❌ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="password" 
                    placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว มีทั้งตัวเลข/ตัวอักษร)" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                />
                <input 
                    type="password" 
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง" 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                />
                <button 
                    type="submit" 
                    style={{ padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    บันทึกรหัสผ่านใหม่
                </button>
            </form>
        </div>
    );
}