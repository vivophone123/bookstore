// Front-end/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false); 
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 🌟 เพิ่ม State สำหรับช่องยืนยันรหัสผ่าน
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLoginMode) {
        // เข้าสู่ระบบ
        const res = await axios.post('https://bookstore-api-bmay.onrender.com/api/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert('เข้าสู่ระบบสำเร็จ!');
        navigate('/');
        window.location.reload();
      } else {
        // 🌟 ดักจับรหัสผ่านไม่ตรงกัน
        if (password !== confirmPassword) {
            return alert('❌ รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้งครับ');
        }

        // 🌟 ดักจับความปลอดภัยของรหัสผ่าน
        if (password.length < 8) {
            return alert('❌ รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษรครับ');
        }
        if (!/\d/.test(password)) { 
            return alert('❌ รหัสผ่านต้องมีตัวเลข (0-9) อย่างน้อย 1 ตัวครับ');
        }
        if (!/[a-zA-Z]/.test(password)) { 
            return alert('❌ รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษอย่างน้อย 1 ตัวครับ');
        }

        // สมัครสมาชิก
        await axios.post('https://bookstore-api-bmay.onrender.com/api/auth/register', { username, email, password, role });
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        setIsLoginMode(true);
        // ล้างช่องรหัสผ่านเพื่อความปลอดภัย
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
    }
  };

  const handleResetPassword = async (e) => {
      e.preventDefault();
      try {
          const res = await axios.post('https://bookstore-api-bmay.onrender.com/api/auth/reset-password', { email, newPassword: password });
          alert(res.data.message);
          setIsForgotPasswordMode(false); 
          setIsLoginMode(true);
          setPassword(''); 
      } catch (error) {
          alert(error.response?.data?.message || 'รีเซ็ตรหัสผ่านไม่สำเร็จ');
      }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div style={{ width: '400px', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', backgroundColor: 'white' }}>
        
        {isForgotPasswordMode ? (
            <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e74c3c' }}>ลืมรหัสผ่าน</h2>
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" placeholder="ใส่อีเมลที่เคยสมัครไว้" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <input type="password" placeholder="ตั้งรหัสผ่านใหม่" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>รีเซ็ตรหัสผ่าน</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <a href="#" onClick={() => { setIsForgotPasswordMode(false); setIsLoginMode(true); }} style={{ color: '#3498db', textDecoration: 'none' }}>กลับไปหน้าเข้าสู่ระบบ</a>
                </div>
            </>
        ) : (
            <>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2c3e50' }}>
                  {isLoginMode ? '🔑 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
                </h2>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {!isLoginMode && (
                    <input type="text" placeholder="ชื่อผู้ใช้งาน" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  )}
                  
                  {!isLoginMode && (
                      <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}>
                          <option value="customer">ลูกค้า (Customer)</option>
                          <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                      </select>
                  )}

                  <input type="email" placeholder="อีเมล" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  
                  <input type="password" placeholder={isLoginMode ? "รหัสผ่าน" : "ตั้งรหัสผ่าน (อักษร+ตัวเลข 8 ตัวขึ้นไป)"} required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  
                  {/* 🌟 ช่องยืนยันรหัสผ่าน (จะโผล่มาเฉพาะตอนสมัครสมาชิก) */}
                  {!isLoginMode && (
                    <input type="password" placeholder="ยืนยันรหัสผ่านอีกครั้ง" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
                  )}

                  <button type="submit" style={{ padding: '12px', backgroundColor: isLoginMode ? '#3498db' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    {isLoginMode ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัครสมาชิก'}
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <a href="#" onClick={() => { setIsLoginMode(!isLoginMode); setIsForgotPasswordMode(false); }} style={{ color: '#2c3e50', textDecoration: 'none', fontWeight: 'bold' }}>
                    {isLoginMode ? 'ไม่มีบัญชีใช่ไหม? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'}
                  </a>
                  
                  {isLoginMode && (
                      <a href="#" onClick={() => setIsForgotPasswordMode(true)} style={{ color: '#e74c3c', fontSize: '14px', textDecoration: 'none' }}>
                          ลืมรหัสผ่าน?
                      </a>
                  )}
                </div>
            </>
        )}
      </div>
    </div>
  );
}