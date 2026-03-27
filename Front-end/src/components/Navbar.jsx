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
    <>
      {/* 🌟 ฝัง CSS เพื่อจัดการหน้าจอมือถือโดยเฉพาะ */}
      <style>
        {`
          .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 30px;
            background-color: #2c3e50;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .nav-links {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .user-section {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .nav-btn {
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 14px;
            text-decoration: none;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          .btn-blue { background-color: #3498db; }
          .btn-red { background-color: #e74c3c; border: none; cursor: pointer; }
          .btn-transparent { background-color: rgba(255,255,255,0.1); }

          /* 📱 โหมดหน้าจอมือถือ (กว้างไม่เกิน 768px) */
          @media (max-width: 768px) {
            .navbar-container {
              flex-direction: column; /* เปลี่ยนให้เรียงแนวตั้ง */
              padding: 15px;
              gap: 15px;
            }
            .nav-links, .user-section {
              flex-direction: column; /* ปุ่มเมนูต่างๆ เรียงแนวตั้ง */
              width: 100%;
              gap: 10px;
            }
            .user-section {
              border-top: 1px solid rgba(255,255,255,0.2);
              padding-top: 15px;
            }
            .nav-btn {
              width: 100%; /* ให้ปุ่มขยายเต็มจอเพื่อง่ายต่อการกด */
              box-sizing: border-box;
            }
          }
        `}
      </style>

      <nav className="navbar-container">
        <h2 style={{ margin: 0 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px' }}>📚 E-Bookstore</Link>
        </h2>
        
        <div className="nav-links">
          <Link to="/" className="nav-btn btn-transparent">🏠 หน้าแรก</Link>
          <Link to="/cart" className="nav-btn btn-transparent">🛒 ตะกร้าสินค้า</Link>

          {user ? (
            <div className="user-section">
              {(user.role === 'owner' || user.role === 'admin') && (
                <Link to="/admin" className="nav-btn" style={{ color: '#f1c40f', backgroundColor: 'rgba(0,0,0,0.2)' }}>⚙️ หลังบ้าน</Link>
              )}

              <span style={{ color: '#ecf0f1', fontSize: '14px', margin: '5px 0' }}>
                  สวัสดี, <strong style={{ color: '#f39c12' }}>{user.username}</strong>
              </span>
              
              <Link to="/profile" className="nav-btn btn-blue">👤 โปรไฟล์</Link>

              <button onClick={handleLogout} className="nav-btn btn-red">
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-btn btn-blue">
              🔑 เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}