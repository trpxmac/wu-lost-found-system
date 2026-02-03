import { Link, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2' 
import './Sidebar.css'

function Sidebar({ role, onLogout }) {
  const location = useLocation()
  
  // ฟังก์ชันเช็ค Active
  const isActive = (path) => location.pathname === path ? 'active' : ''

  // ฟังก์ชันกด Logout แล้วถามก่อน
  const handleLogoutClick = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      text: "คุณต้องการออกจากระบบใช่ไหม",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // สีแดง
      cancelButtonColor: '#95a5a6', // สีเทา
      confirmButtonText: 'ใช่, ออกเลย',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout()
      }
    })
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header" style={{textAlign:'center'}}>
        {/* ✅ 1. เปลี่ยนชื่อระบบ */}
        <h3 style={{margin:'0 0 5px 0', fontSize:'1.2rem'}}>🔐 WU Lost & Found</h3>
        <p style={{fontSize:'0.75rem', color:'#bdc3c7', margin:0}}>ระบบแจ้งของหายและคืนของ ม.วลัยลักษณ์</p>
        
        <div style={{marginTop:'15px', paddingTop:'10px', borderTop:'1px solid rgba(255,255,255,0.1)'}}>
            {/* ✅ 2. สถานะ: ตัวแรกพิมพ์ใหญ่ (Capitalize) */}
            <p style={{margin:0, fontSize:'0.9rem'}}>
                สถานะ: <span style={{
                    color: role==='admin'?'#e74c3c':'#2ecc71', 
                    textTransform:'capitalize',  /* 🔥 แก้ตรงนี้ */
                    fontWeight:'bold'
                }}>
                    {role}
                </span>
            </p>
        </div>
      </div>

      <ul className="menu-list">
        
        {/* --- เมนู Guest --- */}
        {role === 'guest' && (
           <li><Link to="/login" className={isActive('/login')}>🔐 เข้าสู่ระบบ</Link></li>
        )}

        {/* --- เมนู User & Admin --- */}
        {(role === 'user' || role === 'admin') && (
          <>
            <li className="menu-group">เมนูหลัก</li>
            <li><Link to="/" className={isActive('/')}>🏠 หน้าแรก</Link></li>
            <li><Link to="/items" className={isActive('/items')}>📦 รายการทั้งหมด</Link></li>
            
            <li className="menu-group">จัดการข้อมูล</li>
            <li><Link to="/report" className={isActive('/report')}>📢 แจ้งของหาย/พบ</Link></li>
            <li><Link to="/my-history" className={isActive('/my-history')}>🕒 ประวัติการแจ้ง</Link></li>
            <li><Link to="/profile" className={isActive('/profile')}>👤 ข้อมูลส่วนตัว</Link></li>
          </>
        )}

        {/* --- เมนู Admin Only --- */}
        {role === 'admin' && (
          <>
            <li className="menu-group">ผู้ดูแลระบบ</li>
            <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>📊 แดชบอร์ด</Link></li>
            <li><Link to="/admin/users" className={isActive('/admin/users')}>👥 จัดการผู้ใช้</Link></li>
            <li><Link to="/admin/approve" className={isActive('/admin/approve')}>✅ อนุมัติสิ่งของ</Link></li>
            <li><Link to="/admin/claim" className={isActive('/admin/claim')}>📦 คืนสิ่งของ</Link></li>
            <li><Link to="/admin/categories" className={isActive('/admin/categories')}>📂 จัดการหมวดหมู่</Link></li>
            <li><Link to="/admin/statuses" className={isActive('/admin/statuses')}>🏷️ จัดการสถานะ</Link></li>
          </>
        )}
      </ul>

      {/* --- ส่วนล่าง: Logout --- */}
      <div className="sidebar-footer">
        {role !== 'guest' && (
          <button 
            onClick={handleLogoutClick} 
            className="btn-logout"
          >
            🚪 ออกจากระบบ
          </button>
        )}
      </div>

    </div>
  )
}

export default Sidebar