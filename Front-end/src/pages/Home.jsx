// Front-end/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // ดึงข้อมูลสินค้าทั้งหมดจาก Backend เมื่อเปิดหน้าเว็บ
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/products');
        setProducts(res.data);
      } catch (error) {
        console.error('ดึงข้อมูลสินค้าไม่สำเร็จ', error);
      }
    };
    fetchProducts();
  }, []);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า (เก็บลง localStorage)
  const addToCart = (product) => {
    // ดึงตะกร้าเดิมออกมาก่อน (ถ้าไม่มีให้เป็น Array ว่าง)
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // เอาสินค้าใหม่ยัดใส่ตะกร้า
    currentCart.push(product);
    
    // เซฟตะกร้ากลับลงไปในระบบ
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    alert(`เพิ่ม "${product.title}" ลงตะกร้าเรียบร้อยครับ! 🛒`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '36px' }}>ยินดีต้อนรับสู่ E-Bookstore 📚</h1>
        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>เลือกซื้อหนังสือที่คุณชื่นชอบได้เลย!</p>
      </header>

      {/* Grid แสดงรายการสินค้า */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' }}>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#999' }}>ยังไม่มีสินค้าในร้านครับ</p>
        ) : (
          products.map((product) => (
            <div key={product._id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: 'white' }}>
              
              {/* รูปปกหนังสือ (ใช้ URL จากเซิร์ฟเวอร์) */}
              <img 
                src={product.coverImage ? `https://bookstore-api-bmay.onrender.com/${product.coverImage}` : 'https://via.placeholder.com/150'} 
                alt={product.title} 
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
              />
              
              <h3 style={{ margin: '10px 0', fontSize: '18px', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title}
              </h3>
              <p style={{ color: '#7f8c8d', margin: '5px 0', fontSize: '14px' }}>ผู้เขียน: {product.author}</p>
              <p style={{ color: '#e74c3c', fontSize: '22px', fontWeight: 'bold', margin: '15px 0' }}>
                ฿{product.price}
              </p>
              
              <button 
                onClick={() => addToCart(product)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
              >
                ➕ เพิ่มลงตะกร้า
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}