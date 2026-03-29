// Front-end/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await axios.post('https://bookstore-api-bmay.onrender.com/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>ลืมรหัสผ่าน</h2>
            <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px', fontSize: '14px' }}>
                กรุณากรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้ครับ
            </p>

            {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>✅ {message}</div>}
            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>❌ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                    type="email" 
                    placeholder="กรอกอีเมลของคุณ..." 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        padding: '12px', backgroundColor: isLoading ? '#bdc3c7' : '#3498db', color: 'white', border: 'none', 
                        borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {isLoading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontSize: '14px' }}>⬅️ กลับไปหน้าเข้าสู่ระบบ</Link>
            </div>
        </div>
    );
}