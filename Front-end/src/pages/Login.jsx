// Front-end/src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  // สร้าง State เก็บข้อมูลที่กรอกในฟอร์ม
  const [isLogin, setIsLogin] = useState(true); // สลับระหว่าง ล็อกอิน / สมัครสมาชิก
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('customer'); // แอบใส่ช่องเลือก Role ให้อาจารย์เทสระบบได้ง่ายๆ
  
  const navigate = useNavigate();

  // ฟังก์ชันจัดการเมื่อกดปุ่ม "ยืนยัน"
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช
    try {
      if (isLogin) {
        // 🟢 โหมดเข้าสู่ระบบ (Login)
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        
        // เก็บ Token และข้อมูล User ลงในระบบของเบราว์เซอร์
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        alert('เข้าสู่ระบบสำเร็จครับ!');
        window.location.href = '/'; // ใช้ window.location เพื่อบังคับให้ Navbar อัปเดตข้อมูลใหม่
      } else {
        // 🔵 โหมดสมัครสมาชิก (Register)
        const res = await axios.post('http://localhost:5000/api/auth/register', { 
          username, email, password, role 
        });
        
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสที่สมัครไว้ครับ');
        setIsLogin(true); // สลับหน้าจอมาเป็นหน้าล็อกอิน
        setPassword(''); // ล้างช่องรหัสผ่าน
      }
    } catch (error) {
      // ถ้า Backend ส่ง Error กลับมา (เช่น รหัสผิด, อีเมลซ้ำ) จะโชว์ตรงนี้
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>
        {isLogin ? '🔑 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        {/* ช่องที่โชว์เฉพาะตอนสมัครสมาชิก */}
        {!isLogin && (
          <>
            <input 
              type="text" placeholder="ชื่อผู้ใช้งาน (Username)" required 
              value={username} onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <select 
              value={role} onChange={(e) => setRole(e.target.value)}
              style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value="customer">ลูกค้าทั่วไป (Customer)</option>
              <option value="owner">เจ้าของร้าน (Owner)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </>
        )}

        {/* ช่องที่โชว์ทั้งตอนล็อกอินและสมัคร */}
        <input 
          type="email" placeholder="อีเมล (Email)" required 
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" placeholder="รหัสผ่าน (Password)" required 
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />

        <button type="submit" style={{ padding: '12px', backgroundColor: isLogin ? '#3498db' : '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
          {isLogin ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัครสมาชิก'}
        </button>
      </form>

      {/* ปุ่มสลับโหมด ล็อกอิน <-> สมัครสมาชิก */}
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
        {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
        <span 
          onClick={() => setIsLogin(!isLogin)} 
          style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบที่นี่'}
        </span>
      </p>
    </div>
  );
}