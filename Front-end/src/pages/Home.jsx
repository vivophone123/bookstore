// Front-end/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const navigate = useNavigate();

  const categories = ['ทั้งหมด', 'นิยาย/วรรณกรรม', 'การ์ตูน/มังงะ', 'การศึกษา/ตำรา', 'ธุรกิจ/พัฒนาตนเอง', 'เทคโนโลยี/คอมพิวเตอร์'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/products');
        setProducts(res.data);
      } catch (error) {
        console.error('ดึงข้อมูลไม่สำเร็จ', error);
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

  const filteredProducts = products.filter(product => {
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', fontSize: '42px', fontWeight: '800', marginBottom: '10px' }}>ยินดีต้อนรับสู่ E-Bookstore 📚</h1>
        <p style={{ color: '#7f8c8d', fontSize: '18px' }}>แหล่งรวมหนังสือที่คุณชื่นชอบ ในราคาที่ดีที่สุด</p>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto 30px auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ช่องค้นหา */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="🔍 ค้นหาชื่อหนังสือที่ต้องการ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '15px 20px', width: '100%', maxWidth: '600px', borderRadius: '30px', border: '2px solid #3498db', fontSize: '16px', outline: 'none', boxShadow: '0 4px 10px rgba(52, 152, 219, 0.1)' }}
            />
        </div>

        {/* หมวดหมู่ */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
                <button 
                    key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{
                        padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s',
                        backgroundColor: selectedCategory === cat ? '#3498db' : '#e0e0e0', color: selectedCategory === cat ? 'white' : '#555'
                    }}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* 🌟 สรุปจำนวนหนังสือที่มีบนเว็บ */}
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ backgroundColor: '#2c3e50', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                📚 มีหนังสือบนเว็บตอนนี้ทั้งหมด: {filteredProducts.length} รายการ
            </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#999', fontSize: '18px' }}>ไม่พบหนังสือที่คุณค้นหา 😥</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} style={{ backgroundColor: 'white', borderRadius: '15px', padding: '20px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.08)', position: 'relative' }}>
              
              {/* 🌟 ป้ายบอกจำนวนที่เหลือให้ซื้อได้บนเว็บ */}
              <div style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: product.stock > 0 ? '#e8f8f5' : '#fdedec', color: product.stock > 0 ? '#1abc9c' : '#e74c3c', padding: '8px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', border: `1px solid ${product.stock > 0 ? '#1abc9c' : '#e74c3c'}` }}>
                {product.stock > 0 ? `จำนวนที่มีบนเว็บ: ${product.stock} เล่ม` : 'สินค้าหมด'}
              </div>

              <img src={product.coverImage ? `https://bookstore-api-bmay.onrender.com/${product.coverImage}` : 'https://via.placeholder.com/150'} alt={product.title} style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', marginTop: '30px' }} />
              
              <h3 style={{ margin: '10px 0', fontSize: '20px', color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h3>
              <p style={{ color: '#7f8c8d', margin: '5px 0', fontSize: '14px' }}>ผู้เขียน: {product.author}</p>
              <p style={{ color: '#9b59b6', margin: '5px 0', fontSize: '12px', fontWeight: 'bold' }}>🏷️ หมวด: {product.category || 'ทั่วไป'}</p>
              
              <p style={{ color: '#e74c3c', fontSize: '26px', fontWeight: 'bold', margin: '15px 0' }}>฿{product.price}</p>
              
              <button 
                onClick={() => addToCart(product)} disabled={product.stock <= 0}
                style={{ width: '100%', padding: '12px', backgroundColor: product.stock > 0 ? '#3498db' : '#bdc3c7', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: product.stock > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}
              >
                {product.stock > 0 ? '➕ เพิ่มลงตะกร้า' : '❌ สินค้าหมด'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}