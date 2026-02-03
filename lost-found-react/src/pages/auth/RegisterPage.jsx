import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' 
import './RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
          icon: 'warning',
          title: 'รหัสผ่านไม่ตรงกัน',
          text: 'กรุณากรอกรหัสผ่านและการยืนยันให้ตรงกัน',
          confirmButtonText: 'ตกลง'
      })
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname: formData.fullname,
          username: formData.username,
          password: formData.password
        }),
      })

      const result = await response.json()

      if (result.success) {
        Swal.fire({
            title: 'ลงทะเบียนสำเร็จ! 🎉',
            text: 'ยินดีต้อนรับสมาชิกใหม่ กรุณาเข้าสู่ระบบ',
            icon: 'success',
            confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
            confirmButtonColor: '#2ecc71'
        }).then(() => {
            navigate('/') 
        })
      } else {
        Swal.fire({
            icon: 'error',
            title: 'ลงทะเบียนไม่สำเร็จ',
            text: result.message
        })
      }

    } catch (error) {
      console.error('Register Error:', error)
      Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้ (ตรวจสอบว่ารัน node server.js หรือยัง?)', 'error')
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>📝 ลงทะเบียนสมาชิกใหม่</h2>

        <form onSubmit={handleRegister}>
          
          <div className="form-group">
            {/* ✅ เพิ่มดอกจันสีแดง */}
            <label>ชื่อ-นามสกุล <span style={{color: 'red'}}>*</span></label>
            <input 
              type="text" 
              name="fullname"
              required
              placeholder="เช่น สมชาย ใจดี"
              className="input-field"
              value={formData.fullname}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            {/* ✅ เพิ่มดอกจันสีแดง */}
            <label>ชื่อผู้ใช้ (Username) <span style={{color: 'red'}}>*</span></label>
            <input 
              type="text" 
              name="username"
              required
              placeholder="รหัสนักศึกษา หรือ Username ที่ต้องการ"
              className="input-field"
              value={formData.username}
              onChange={handleChange}
            />
            <small style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px', display: 'block' }}>
              * นักศึกษา: โปรดใช้รหัสนักศึกษาในการลงทะเบียน
            </small>
          </div>

          <div className="form-group">
            {/* ✅ เพิ่มดอกจันสีแดง */}
            <label>รหัสผ่าน <span style={{color: 'red'}}>*</span></label>
            <input 
              type="password" 
              name="password"
              required
              placeholder="ตั้งรหัสผ่าน"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            {/* ✅ เพิ่มดอกจันสีแดง */}
            <label>ยืนยันรหัสผ่าน <span style={{color: 'red'}}>*</span></label>
            <input 
              type="password" 
              name="confirmPassword"
              required
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="input-field"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn-register">
            ยืนยันการลงทะเบียน
          </button>
        </form>

        <div className="back-link">
          <Link to="/">
             &larr; กลับหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage