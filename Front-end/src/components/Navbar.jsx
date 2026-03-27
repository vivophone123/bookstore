// Front-end/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  // ดึงข้อมูล user จาก localStorage เพื่อดูว่าล็อกอินอยู่ไหม และชื่ออะไร
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('ออกจากระบบสำเร็จ');
    navigate('/login');
    window.location.reload(); // บังคับรีเฟรชหน้าให้เมนูกลับเป็นปกติ
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '15px 30px', 
      backgroundColor: '#2c3e50', 
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* โลโก้ร้าน มุมซ้าย */}
      <h2 style={{ margin: 0 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>📚 E-Bookstore</Link>
      </h2>
      
      {/* เมนูต่างๆ มุมขวา */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 หน้าแรก</Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>🛒 ตะกร้าสินค้า</Link>

        {user ? (
          /* 🟢 กรณีที่เข้าสู่ระบบแล้ว (โชว์ชื่อ, ปุ่มโปรไฟล์, ระบบหลังบ้าน(ถ้าเป็นแอดมิน), และปุ่มออกระบบ) */
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            
            {/* ด่านตรวจสิทธิ์: ถ้าเป็น Owner หรือ Admin ถึงจะเห็นเมนูนี้ */}
            {(user.role === 'owner' || user.role === 'admin') && (
              <Link to="/admin" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold' }}>⚙️ ระบบหลังบ้าน</Link>
            )}

            <span style={{ color: '#ecf0f1' }}>สวัสดีคุณ <strong style={{ color: '#f39c12' }}>{user.username}</strong></span>
            
            {/* 🌟 ปุ่มใหม่: กดเพื่อไปหน้าแก้ไขโปรไฟล์ */}
            <Link to="/profile" style={{ 
              color: 'white', textDecoration: 'none', fontSize: '14px', 
              backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '5px' 
            }}>
                👤 โปรไฟล์
            </Link>

            <button onClick={handleLogout} style={{ 
              padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', 
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
            }}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          /* 🔴 กรณีที่ยังไม่ได้เข้าสู่ระบบ (โชว์ปุ่ม Login) */
          <Link to="/login" style={{ 
            padding: '8px 15px', backgroundColor: '#3498db', color: 'white', 
            textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' 
          }}>
            🔑 เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}