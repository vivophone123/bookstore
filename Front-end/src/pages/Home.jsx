// Front-end/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

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

  const addToCart = (product) => {
    if (product.stock <= 0) return alert('ขออภัยครับ สินค้านี้หมดชั่วคราว');
    
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    currentCart.push(product);
    localStorage.setItem('cart', JSON.stringify(currentCart));
    alert(`เพิ่ม "${product.title}" ลงตะกร้าเรียบร้อยครับ! 🛒`);
  };

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '42px', fontWeight: '800', marginBottom: '10px' }}>ยินดีต้อนรับสู่ E-Bookstore 📚</h1>
        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>แหล่งรวมหนังสือที่คุณชื่นชอบ ในราคาที่ดีที่สุด</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {products.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#999', fontSize: '18px' }}>กำลังโหลดสินค้า...</p>
        ) : (
          products.map((product) => (
            <div key={product._id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '15px', 
              padding: '20px', 
              textAlign: 'center', 
              boxShadow: '0 10px 20px rgba(0,0,0,0.08)', 
              transition: 'transform 0.3s',
              position: 'relative'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* ป้ายบอกสถานะสต๊อก */}
              <div style={{
                position: 'absolute', top: '15px', right: '15px', 
                backgroundColor: product.stock > 0 ? '#e8f8f5' : '#fdedec', 
                color: product.stock > 0 ? '#1abc9c' : '#e74c3c', 
                padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'
              }}>
                {product.stock > 0 ? `เหลือ ${product.stock} เล่ม` : 'สินค้าหมด'}
              </div>

              <img 
                src={product.coverImage ? `https://bookstore-api-bmay.onrender.com/${product.coverImage}` : 'https://via.placeholder.com/150'} 
                alt={product.title} 
                style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} 
              />
              
              <h3 style={{ margin: '10px 0', fontSize: '20px', color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title}
              </h3>
              <p style={{ color: '#7f8c8d', margin: '5px 0', fontSize: '14px' }}>{product.author}</p>
              <p style={{ color: '#e74c3c', fontSize: '26px', fontWeight: 'bold', margin: '15px 0' }}>
                ฿{product.price}
              </p>
              
              <button 
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                style={{ 
                  width: '100%', padding: '12px', 
                  backgroundColor: product.stock > 0 ? '#3498db' : '#bdc3c7', 
                  color: 'white', border: 'none', borderRadius: '8px', 
                  fontSize: '16px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', 
                  fontWeight: 'bold', transition: '0.2s' 
                }}
              >
                {product.stock > 0 ? '➕ เพิ่มลงตะกร้า' : '❌ หมดชั่วคราว'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}