// Front-end/src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// คอมโพเนนต์ Modal สำหรับโชว์รูปสลิปขนาดใหญ่ (ลูกเล่นใหม่!)
const SlipModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null; // ถ้าไม่มีรูป ก็ไม่โชว์อะไร
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>ปิด [X]</button>
        <img src={imageUrl} alt="slip large" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', marginTop: '30px' }} />
      </div>
    </div>
  );
};

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [slipFile, setSlipFile] = useState(null);
  
  // State สำหรับ Modal โชว์รูปสลิป
  const [showSlipUrl, setShowSlipUrl] = useState(null);
  
  // State สำหรับเก็บข้อมูล orders (ไว้โชว์เฉพาะแอดมิน)
  const [orders, setOrders] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')); // ดึงข้อมูล user มาดูสิทธิ์

  useEffect(() => {
    // 1. จัดการของในตะกร้าลูกค้า
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
    calculateTotal(savedCart, discount);
    
    // 2. ถ้าเป็น Owner/Admin ให้ดึงข้อมูล Orders มาโชว์ด้วย
    if (user?.role === 'owner' || user?.role === 'admin') {
        fetchOrders();
    }
  }, [discount, user?.role]); // คำนวณใหม่ถ้าส่วนลดเปลี่ยน หรือสิทธิ์เปลี่ยน

  const calculateTotal = (items, currentDiscount) => {
    const sum = items.reduce((acc, item) => acc + item.price, 0);
    const finalPrice = Math.max(0, sum - currentDiscount); 
    setTotalPrice(finalPrice);
  };

  const removeFromCart = (indexToRemove) => {
    const newCart = cartItems.filter((_, index) => index !== indexToRemove);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    calculateTotal(newCart, discount);
  };

  const handleApplyCoupon = async () => {
    if (!token) return alert('กรุณาเข้าสู่ระบบก่อนใช้คูปองครับ');
    try {
      const res = await axios.post('https://bookstore-api-bmay.onrender.com/api/coupons/validate', 
        { code: couponCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscount(res.data.discount);
      alert(`ใช้คูปองสำเร็จ! ลดไป ฿${res.data.discount}`);
    } catch (error) {
      alert(error.response?.data?.message || 'คูปองไม่ถูกต้องหรือหมดอายุ');
      setDiscount(0);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนสั่งซื้อครับ');
      return navigate('/login');
    }
    if (cartItems.length === 0) return alert('ตะกร้าว่างเปล่าครับ');
    if (!slipFile) return alert('กรุณาแนบสลิปชำระเงินเพื่อยืนยันคำสั่งซื้อครับ');

    const formData = new FormData();
    formData.append('slip', slipFile);
    formData.append('totalAmount', totalPrice);
    const itemsData = cartItems.map(item => ({ product: item._id, title: item.title, price: item.price }));
    formData.append('items', JSON.stringify(itemsData)); 

    try {
      await axios.post('https://bookstore-api-bmay.onrender.com/api/orders/checkout', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('🎉 สั่งซื้อสำเร็จ! กรุณารอเจ้าของร้านตรวจสอบสลิปครับ');
      localStorage.removeItem('cart');
      setCartItems([]);
      setSlipFile(null);
      document.getElementById('slipInput').value = null; // ล้างช่องเลือกไฟล์
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ');
    }
  };

  // 🔴 ฟังก์ชันสำหรับ Admin: ดึงข้อมูล Order ทั้งหมด
  const fetchOrders = async () => {
      try {
          const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/orders', {
              headers: { Authorization: `Bearer ${token}` }
          });
          setOrders(res.data);
      } catch (error) {
          console.error("Fetch Orders Error:", error);
      }
  };

  // 🔴 ฟังก์ชันสำหรับ Admin: อัปเดตสถานะชำระเงินแบบ Instant UI Update
  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
        await axios.put(`https://bookstore-api-bmay.onrender.com/api/orders/${orderId}/status`, 
            { paymentStatus: newStatus },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('อัปเดตสถานะสำเร็จ!');
        // 🔥 Instant UI Update: แก้สถานะใน State เลย ไม่ต้อง fetch ใหม่
        setOrders(prevOrders => 
            prevOrders.map(order => 
                order._id === orderId ? { ...order, paymentStatus: newStatus } : order
            )
        );
    } catch (error) {
        alert('อัปเดตสถานะไม่สำเร็จครับ');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* โมเดลโชว์รูปสลิป */}
      <SlipModal imageUrl={showSlipUrl} onClose={() => setShowSlipUrl(null)} />

      {/* ด่านตรวจสิทธิ์: ถ้าเป็นแอดมิน ให้โชว์ระบบหลังบ้าน */}
      { (user?.role === 'owner' || user?.role === 'admin') ? (
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px' }}>⚙️ ระบบจัดการคำสั่งซื้อ (สำหรับ Admin)</h2>
            
            {orders.length === 0 ? <p style={{textAlign:'center', color:'#7f8c8d'}}>ยังไม่มีคำสั่งซื้อ</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize:'14px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f7f6', borderBottom: '2px solid #ddd', textAlign:'left' }}>
                            <th style={{ padding: '12px' }}>วันที่/ลูกค้า</th>
                            <th style={{ padding: '12px' }}>ยอดรวม</th>
                            <th style={{ padding: '12px' }}>สลิป</th>
                            <th style={{ padding: '12px' }}>สถานะ</th>
                            <th style={{ padding: '12px' }}>จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px' }}>
                                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                    <div style={{color:'#7f8c8d'}}>{order.user?.username || 'ลูกค้าทั่วไป'}</div>
                                </td>
                                <td style={{ padding: '12px', fontWeight: 'bold', color:'#e74c3c' }}>฿{order.totalAmount}</td>
                                <td style={{ padding: '12px' }}>
                                    {/* ลูกเล่นใหม่! กดแล้วเปิด SlipModal */}
                                    <button 
                                        onClick={() => setShowSlipUrl(`https://bookstore-api-bmay.onrender.com/${order.slipImage}`)}
                                        style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' }}>
                                        👀 ดูสลิป
                                    </button>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {/* UI ใหม่: เปลี่ยนสีสถานะให้ชัดเจน */}
                                    <span style={{ 
                                        padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize:'12px',
                                        backgroundColor: order.paymentStatus === 'completed' ? '#2ecc71' : order.paymentStatus === 'rejected' ? '#e74c3c' : '#f39c12',
                                        color: 'white' 
                                    }}>
                                        {order.paymentStatus === 'completed' ? 'ชำระเงินเรียบร้อย' : order.paymentStatus === 'rejected' ? 'สลิปไม่ถูกต้อง' : 'รอตรวจสอบ'}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    {/* Instant UI Update: ปุ่มจัดการ */}
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <button onClick={() => handleUpdatePaymentStatus(order._id, 'completed')} style={{ backgroundColor: '#2ecc71', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' }}>✔️อนุมัติ</button>
                                        <button onClick={() => handleUpdatePaymentStatus(order._id, 'rejected')} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize:'12px' }}>❌ปฏิเสธ</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
      ) : (
          // ด่านตรวจสิทธิ์: ถ้าเป็นลูกค้าทั่วไป ให้โชว์หน้าตะกร้าสินค้าปกติ
        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0,0,0,0.1)', border: '1px solid #eee' }}>
            <h2 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>🛒 ตะกร้าสินค้าของคุณ</h2>

            {cartItems.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#7f8c8d' }}>ตะกร้าว่างเปล่า ลองไปเลือกหนังสือดูสิครับ!</p>
            ) : (
                <>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {cartItems.map((item, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img src={item.coverImage ? `https://bookstore-api-bmay.onrender.com/${item.coverImage}` : 'https://via.placeholder.com/50'} alt="cover" width="50" style={{ borderRadius: '4px' }} />
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>฿{item.price}</span>
                        <button onClick={() => removeFromCart(index)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>ลบ</button>
                        </div>
                    </li>
                    ))}
                </ul>

                <div style={{ backgroundColor: '#f4f7f6', padding: '20px', borderRadius: '10px', marginTop: '20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="กรอกโค้ดส่วนลด (ถ้ามี)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ padding: '12px', flex: '1', borderRadius: '5px', border: '1px solid #ccc', textTransform: 'uppercase' }} />
                    <button onClick={handleApplyCoupon} style={{ padding: '12px 25px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>ใช้คูปอง</button>
                    </div>
                    <div style={{textAlign:'right', borderTop:'1px solid #ddd', paddingTop:'10px'}}>
                        <p style={{ fontSize: '14px', margin: '5px 0', color:'#7f8c8d' }}>ยอดรวมสินค้า: ฿{cartItems.reduce((acc, item) => acc + item.price, 0)}</p>
                        {discount > 0 && <p style={{ fontSize: '14px', color: '#27ae60', margin: '5px 0' }}>ส่วนลดคูปอง: -฿{discount}</p>}
                        <h3 style={{ fontSize: '24px', color: '#2c3e50', marginTop: '10px' }}>ยอดสุทธิ: <span style={{ color: '#e74c3c' }}>฿{totalPrice}</span></h3>
                    </div>
                </div>

                <form onSubmit={handleCheckout} style={{ marginTop: '30px', padding: '25px', border: '2px solid #eee', borderRadius: '10px', backgroundColor: '#fff', display:'flex', flexDirection:'column', gap:'15px' }}>
                    <h3 style={{ color: '#2c3e50' }}>💳 ชำระเงินและแนบสลิป</h3>
                    <p style={{ fontSize: '14px', color: '#7f8c8d' }}>กรุณาโอนเงินมาที่บัญชี: <b>123-4-56789-0 (ธนาคารจำลอง)</b></p>
                    <input id="slipInput" type="file" accept="image/*" required onChange={(e) => setSlipFile(e.target.files[0])} style={{ padding: '10px', border: '1px solid #eee', borderRadius: '5px', width:'100%' }} />
                    <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition:'background-color 0.2s' }}>✅ ยืนยันคำสั่งซื้อ</button>
                </form>
                </>
            )}
        </div>
      )}
    </div>
  );
}