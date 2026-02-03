import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './HomePage.css'

function HomePage({ onLogin }) {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({ username: '', password: '' })

  const handleLogin = async (e) => {
    e.preventDefault()
    
    try {
      // ✅ เชื่อมต่อ API Login ของจริง
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      })

      const result = await response.json()

      if (result.success) {
        // ✅ Login สำเร็จ
        const user = result.user
        
        // แจ้ง App.jsx และบันทึกลงเครื่อง
        onLogin(user)
        localStorage.setItem('currentUser', JSON.stringify(user))

        // ✨ ใช้ SweetAlert2 แจ้งต้อนรับ (แบบ Auto Close 1.5 วิ)
        Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ!',
            text: `ยินดีต้อนรับคุณ ${user.fullname}`,
            timer: 1500, // ปิดเองอัตโนมัติใน 1.5 วินาที
            showConfirmButton: false
        }).then(() => {
            // พอ Popup ปิด ค่อยย้ายหน้า
            if (user.role === 'admin') {
                navigate('/admin/dashboard') // แนะนำให้ไป Dashboard ก่อน
            } else {
                navigate('/items')
            }
        })

      } else {
        // ❌ Login ไม่ผ่าน
        Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: result.message // เช่น รหัสผิด, ไม่พบผู้ใช้
        })
      }

    } catch (error) {
      console.error('Login Error:', error)
      Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้ (ตรวจสอบว่ารัน node server.js หรือยัง?)', 'error')
    }
  }

  return (
    <div className="login-landing-container">
      
      {/* กล่อง Login หลัก */}
      <div className="login-card">
        <div className="brand-header">
          <h1>🔐 WU Lost & Found</h1>
          <p>ระบบแจ้งของหายและคืนของ ม.วลัยลักษณ์</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>ชื่อผู้ใช้ (Username)</label>
            <input 
              type="text" 
              placeholder="กรอก username"
              className="input-field"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>รหัสผ่าน (Password)</label>
            <input 
              type="password" 
              placeholder="••••••"
              className="input-field"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-login-main">เข้าสู่ระบบ</button>
        </form>

        {/* เมนูทางเลือกอื่นๆ */}
        <div className="quick-links">
          <Link to="/items" className="link-btn search">🔍 ค้นหาของหาย (ไม่ต้องล็อกอิน)</Link>
          <Link to="/register" className="link-btn register">📝 ลงทะเบียนใหม่</Link>
        </div>
      </div>

    </div>
  )
}

export default HomePage