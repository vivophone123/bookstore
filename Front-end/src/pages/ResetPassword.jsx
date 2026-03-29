// Front-end/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // ดึง Token ที่แนบมากับลิงก์ URL (เช่น /reset-password/1234abc...)
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // ตรวจสอบความปลอดภัยเบื้องต้น
        if (password !== confirmPassword) {
            return setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกันครับ');
        }
        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            return setError('รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป และมีทั้งตัวอักษรและตัวเลขครับ');
        }

        setIsLoading(true);

        try {
            const res = await axios.put(`https://bookstore-api-bmay.onrender.com/api/auth/reset-password/${token}`, { password });
            setMessage(res.data.message);
            
            // รอ 3 วินาทีแล้วพากลับไปหน้า Login อัตโนมัติ
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'ลิงก์รีเซ็ตรหัสผ่านนี้หมดอายุหรือไม่ถูกต้องครับ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div style={{ width: '400px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
                <h2 style={{ textAlign: 'center', color: '#2ecc71', marginBottom: '10px' }}>ตั้งรหัสผ่านใหม่</h2>
                <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '20px', fontSize: '14px' }}>
                    กรุณาตั้งรหัสผ่านใหม่ที่คาดเดาได้ยากครับ
                </p>

                {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>✅ {message}<br/><small style={{color: '#666'}}>กำลังพากลับหน้าล็อกอินใน 3 วินาที...</small></div>}
                {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>❌ {error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="password" 
                        placeholder="รหัสผ่านใหม่ (อักษร+ตัวเลข 8 ตัวขึ้นไป)" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="password" 
                        placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || message}
                        style={{ padding: '12px', backgroundColor: (isLoading || message) ? '#bdc3c7' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: (isLoading || message) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                    >
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                    </button>
                </form>
            </div>
        </div>
    );
}