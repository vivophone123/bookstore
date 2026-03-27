
// Front-end/src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Admin() {
  const [products, setProducts] = useState([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('นิยาย/วรรณกรรม');
  const [author, setAuthor] = useState('');
  const [price, setPrice] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null); 

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('ดึงข้อมูลสินค้าไม่สำเร็จ', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!coverImageFile) return alert('กรุณาเลือกรูปปกหนังสือ');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('price', Number(price));
    formData.append('category', category); // 🌟 ส่งหมวดหมู่ไปให้ Backend
    formData.append('coverImage', coverImageFile); 
    formData.append('stock', 10); 

    try {
      await axios.post('https://bookstore-api-bmay.onrender.com/api/products', 
        formData, 
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
          } 
        }
      );
      
      alert('เพิ่มหนังสือสำเร็จ!');
      setTitle(''); setAuthor(''); setPrice(''); setCoverImageFile(null); setCategory('นิยาย/วรรณกรรม');
      document.getElementById('coverImageInput').value = null;
      fetchProducts(); 
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('แน่ใจนะครับว่าจะลบหนังสือเล่มนี้?')) {
      try {
        await axios.delete(`https://bookstore-api-bmay.onrender.com/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ลบสำเร็จ');
        fetchProducts();
      } catch (error) {
        alert('ลบไม่สำเร็จครับ');
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>⚙️ ระบบจัดการร้านค้า (สำหรับ Owner / Admin)</h2>

      <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>➕ เพิ่มหนังสือใหม่</h3>
        
        {/* 🌟 ฟอร์มกรอกข้อมูลพร้อม Dropdown เลือกหมวดหมู่ */}
        <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="text" placeholder="ชื่อหนังสือ" required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '8px', flex: '1' }} />
          <input type="text" placeholder="ผู้เขียน" required value={author} onChange={e => setAuthor(e.target.value)} style={{ padding: '8px', flex: '1' }} />
          <input type="number" placeholder="ราคา" required value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '8px', width: '100px' }} />
          
          {/* 🌟 ช่องเลือกหมวดหมู่ */}
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '8px', flex: '1', borderRadius: '5px', border: '1px solid #ddd' }}>
            <option value="นิยาย/วรรณกรรม">นิยาย/วรรณกรรม</option>
            <option value="การ์ตูน/มังงะ">การ์ตูน/มังงะ</option>
            <option value="การศึกษา/ตำรา">การศึกษา/ตำรา</option>
            <option value="ธุรกิจ/พัฒนาตนเอง">ธุรกิจ/พัฒนาตนเอง</option>
            <option value="เทคโนโลยี/คอมพิวเตอร์">เทคโนโลยี/คอมพิวเตอร์</option>
          </select>

          <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '14px', color: '#555' }}>รูปปกหนังสือ:</label>
            <input 
              id="coverImageInput"
              type="file" 
              accept="image/*" 
              required 
              onChange={e => setCoverImageFile(e.target.files[0])} 
              style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: 'white' }} 
            />
          </div>

          <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>➕ เพิ่มสินค้า</button>
        </form>
      </div>

      <h3>📚 รายการหนังสือในคลัง ({products.length} เล่ม)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <th style={{ padding: '10px' }}>รูปภาพ</th>
            <th style={{ padding: '10px' }}>ชื่อหนังสือ</th>
            <th style={{ padding: '10px' }}>ผู้เขียน</th>
            <th style={{ padding: '10px' }}>หมวดหมู่</th>
            <th style={{ padding: '10px' }}>ราคา</th>
            <th style={{ padding: '10px' }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd', backgroundColor: 'white' }}>
              <td style={{ padding: '10px' }}>
                <img 
                    src={product.coverImage ? `https://bookstore-api-bmay.onrender.com/${product.coverImage}` : 'https://via.placeholder.com/50'} 
                    alt="cover" 
                    width="50" 
                    style={{ borderRadius: '4px' }}
                />
              </td>
              <td style={{ padding: '10px' }}>{product.title}</td>
              <td style={{ padding: '10px' }}>{product.author}</td>
              <td style={{ padding: '10px' }}>
                 <span style={{ backgroundColor: '#ecf0f1', padding: '3px 8px', borderRadius: '10px', fontSize: '12px' }}>
                    {product.category || 'ทั่วไป'}
                 </span>
              </td>
              <td style={{ padding: '10px', color: '#e74c3c', fontWeight: 'bold' }}>฿{product.price}</td>
              <td style={{ padding: '10px' }}>
                <button onClick={() => handleDelete(product._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>🗑️ ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}