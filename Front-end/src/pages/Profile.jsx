// Front-end/src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ดึงข้อมูลเดิมมาแสดง
  useEffect(() => {
    if (!token) return navigate('/login');

    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsername(res.data.username);
        setEmail(res.data.email);
      } catch (error) {
        alert('ดึงข้อมูลไม่สำเร็จ กรุณาล็อกอินใหม่');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate, token]);

  // กดบันทึกการแก้ไข
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('https://bookstore-api-bmay.onrender.com/api/auth/profile', 
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ อัปเดตข้อมูลส่วนตัวสำเร็จ!');
      
      // อัปเดตชื่อใน localStorage เพื่อให้เมนูด้านบนเปลี่ยนตาม
      const userStr = localStorage.getItem('user');
      if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.username = username;
          userObj.email = email;
          localStorage.setItem('user', JSON.stringify(userObj));
      }
    } catch (error) {
      alert('แก้ไขไม่สำเร็จ: ' + (error.response?.data?.message || 'ข้อผิดพลาดระบบ'));
    }
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>👤 ข้อมูลส่วนตัว</h2>
        
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#34495e' }}>ชื่อผู้ใช้งาน:</label>
            <input 
              type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '5px' }} 
            />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', color: '#34495e' }}>อีเมล:</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', marginTop: '5px' }} 
            />
          </div>
          
          <button type="submit" style={{ 
            padding: '15px', backgroundColor: '#3498db', color: 'white', 
            border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' 
          }}>
            💾 บันทึกการเปลี่ยนแปลง
          </button>
        </form>
      </div>
    </div>
  );
}