// Front-end/src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('ออกจากระบบสำเร็จ');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav style={{ 
      display: 'flex', 
      flexWrap: 'wrap', /* 🌟 ถ้ายาวเกินจอมือถือ ให้ปัดลงบรรทัดใหม่ */
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '15px 20px', 
      backgroundColor: '#2c3e50', 
      color: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      gap: '15px' /* 🌟 ระยะห่างเวลามันปัดลงบรรทัดใหม่ */
    }}>
      {/* โลโก้ร้าน */}
      <h2 style={{ margin: 0, textAlign: 'center', flexGrow: 1, minWidth: '150px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '22px' }}>📚 E-Bookstore</Link>
      </h2>
      
      {/* เมนูต่างๆ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', flexGrow: 2 }}>
        
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>🏠 หน้าแรก</Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>🛒 ตะกร้าสินค้า</Link>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
            
            {(user.role === 'owner' || user.role === 'admin') && (
              <Link to="/admin" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>⚙️ หลังบ้าน</Link>
            )}

            <span style={{ color: '#ecf0f1', fontSize: '14px' }}>คุณ <strong style={{ color: '#f39c12' }}>{user.username}</strong></span>
            
            <Link to="/profile" style={{ 
              color: 'white', textDecoration: 'none', fontSize: '12px', 
              backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '5px' 
            }}>
                👤 โปรไฟล์
            </Link>

            <button onClick={handleLogout} style={{ 
              padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', 
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' 
            }}>
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <Link to="/login" style={{ 
            padding: '6px 15px', backgroundColor: '#3498db', color: 'white', 
            textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' 
          }}>
            🔑 เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}