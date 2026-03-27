// Front-end/src/pages/OrderHistory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนครับ');
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await axios.get('https://bookstore-api-bmay.onrender.com/api/orders/myorders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (error) {
        console.error('ดึงข้อมูลไม่สำเร็จ', error);
      }
    };

    fetchMyOrders();
  }, [token, navigate]);

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px', fontSize: '32px' }}>
          📦 ประวัติการสั่งซื้อของคุณ {user?.username}
        </h2>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#7f8c8d' }}>ยังไม่มีประวัติการสั่งซื้อครับ 🛒</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order, index) => (
              <div key={order._id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 6px 15px rgba(0,0,0,0.08)', borderLeft: `8px solid ${order.paymentStatus === 'completed' ? '#2ecc71' : '#f39c12'}` }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#34495e' }}>รายการที่ {orders.length - index} (รหัส: {order._id.slice(-6)})</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>📅 วันที่สั่งซื้อ: {new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>ยอดรวม: ฿{order.totalAmount}</p>
                    
                    {/* 🌟 ป้ายสถานะ (หัวใจหลักของหน้านี้) */}
                    <span style={{ 
                        padding: '6px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', color: 'white',
                        backgroundColor: order.paymentStatus === 'completed' ? '#2ecc71' : '#f39c12'
                    }}>
                        {order.paymentStatus === 'completed' ? '✅ ชำระเงินเรียบร้อย (อนุมัติแล้ว)' : '⏳ รอตรวจสอบสลิป'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', color: '#2c3e50' }}>รายการหนังสือ:</p>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '14px', color: '#333', flex: 1 }}>📖 {item.product ? item.product.title : 'หนังสือถูกลบไปแล้ว'}</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>จำนวน: {item.quantity} เล่ม</span>
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}