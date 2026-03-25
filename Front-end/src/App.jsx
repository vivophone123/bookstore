import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Admin from './pages/Admin';

// คอมโพเนนต์แถบเมนูด้านบน (Navbar)
function Navbar() {
  const navigate = useNavigate();
  // เช็กว่ามี Token ในระบบหรือยัง (แปลว่า Login แล้ว)
  const token = localStorage.getItem('token'); 
  // ดึงข้อมูล User มาดูว่าสิทธิ์อะไร (Customer, Owner, Admin)
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;