// Front-end/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
// ❌ ลบการ import Profile ออก (เพราะเหมือนคุณยังไม่มีไฟล์นี้)
// ❌ ลบการ import ForgotPassword ออก (เพราะเรารวมไว้ใน Login แล้ว)
import ResetPassword from './pages/ResetPassword';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); 
  const user = JSON.parse(localStorage.getItem('user')); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('ออกจากระบบเรียบร้อยครับ');
    navigate('/login');
  };

  return (
    <nav style={{ padding: '15px 30px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>📚 E-Bookstore</Link>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>🏠 หน้าแรก</Link>
        <Link to="/cart" style={{ color: 'white', textDecoration: 'none' }}>🛒 ตะกร้าสินค้า</Link>
        
        {/* ถ้าล็อกอินแล้ว ถึงจะโชว์เมนูเหล่านี้ */}
        {token ? (
          <>
            {/* โชว์ปุ่มหลังบ้าน เฉพาะ Owner หรือ Admin */}
            {(user?.role === 'owner' || user?.role === 'admin') && (
              <Link to="/admin" style={{ color: '#f39c12', textDecoration: 'none', fontWeight: 'bold' }}>⚙️ ระบบหลังบ้าน</Link>
            )}
            <span style={{ color: '#bdc3c7' }}>| สวัสดี, {user?.username}</span>
            <button onClick={handleLogout} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
              ออกจากระบบ
            </button>
          </>
        ) : (
          <Link to="/login" style={{ backgroundColor: '#3498db', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '5px' }}>
            🔑 เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </nav>
  );
}

// คอมโพเนนต์หลักที่จัดการเส้นทาง (Routes)
function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
          {/* ❌ ลบ Route สำหรับ /forgot-password ออก */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;