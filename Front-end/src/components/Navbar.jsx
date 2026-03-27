// Front-end/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // 🌟 ขั้นตอนใหม่: State สำหรับตรวจสอบว่าตอนนี้เป็นจอมือถือหรือไม่
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    // ฟังก์ชันตรวจสอบขนาดหน้าจอเมื่อมีการปรับขนาด
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('ออกจากระบบสำเร็จ');
    navigate('/login');
    window.location.reload();
  };

  // 🌟 ขั้นตอนใหม่: นิยามสไตล์สำหรับ PC และ มือถือ แยกกันชัดเจน
  
  // สไตล์พื้นฐานของ Nav
  const navBaseStyle = {
    display: 'flex',
    backgroundColor: '#2c3e50',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    alignItems: 'center',
    boxSizing: 'border-box', // สำคัญ! ป้องกัน padding ดันขนาดเว็บ
  };

  // สไตล์สำหรับ PC (เรียงแนวนอน)
  const navDesktopStyle = {
    ...navBaseStyle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '15px 30px',
  };

  // สไตล์สำหรับมือถือ (เรียงแนวตั้ง)
  const navMobileStyle = {
    ...navBaseStyle,
    flexDirection: 'column', // เปลี่ยนเป็นแนวตั้ง
    justifyContent: 'center',
    padding: '10px',
    gap: '10px', // ระยะห่างแนวตั้ง
  };

  // เลือกใช้สไตล์ตามขนาดหน้าจอ
  const currentNavStyle = isMobile ? navMobileStyle : navDesktopStyle;

  return (
    <nav style={currentNavStyle}>
      {/* โลโก้ร้าน (จัดกลางบนมือถือ) */}
      <h2 style={{ margin: isMobile ? '5px 0' : 0 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: isMobile ? '20px' : '24px' }}>📚 E-Bookstore</Link>
      </h2>
      
      {/* เมนูต่างๆ */}
      <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', // ปัดเป็นแนวตั้งบนมือถือ
          alignItems: 'center', 
          justifyContent: 'center', 
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '8px' : '20px', 
          marginTop: isMobile ? '5px' : 0
      }}>
        
        <div style={{ display:'flex', gap:'15px'}}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>🏠 หน้าแรก</Link>
            <Link to="/cart" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>🛒 ตะกร้าสินค้า</Link>
        </div>

        {user ? (
          <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', // ปัดเป็นแนวตั้งบนมือถือ
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: isMobile ? '5px' : '10px',
              borderTop: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
              paddingTop: isMobile ? '10px' : 0
          }}>
            
            {(user.role === 'owner' || user.role === 'admin') && (
              <Link to="/admin" style={{ color: '#f1c40f', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>⚙️ หลังบ้าน</Link>
            )}

            {/* 🌟 ปรับปรุงการโชว์ชื่อบนมือถือให้สั้นลงและไม่เบียด (ลบปุ่ม [X] ปิด ออก) */}
            <span style={{ color: '#ecf0f1', fontSize: '13px', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis', maxWidth: isMobile ? '200px' : 'none' }}>
                สวัสดี, <strong style={{ color: '#f39c12' }}>{user.username}</strong>
            </span>
            
            <div style={{ display:'flex', gap:'5px'}}>
                <Link to="/profile" style={{ 
                color: 'white', textDecoration: 'none', fontSize: '11px', 
                backgroundColor: 'rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: '5px' 
                }}>
                    👤 โปรไฟล์
                </Link>

                <button onClick={handleLogout} style={{ 
                padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', 
                border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' 
                }}>
                  ออกจากระบบ
                </button>
            </div>
          </div>
        ) : (
          <Link to="/login" style={{ 
            padding: '8px 15px', backgroundColor: '#3498db', color: 'white', 
            textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', fontSize: '14px' 
          }}>
            🔑 เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}