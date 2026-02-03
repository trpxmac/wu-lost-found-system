import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './ProfilePage.css'

function ProfilePage() {
  const [user, setUser] = useState({ id: '', username: '', fullname: '', role: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'))
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      // ดึง ID ให้ถูกตัว (บางทีอาจเป็น id หรือ user_id)
      const userId = user.id || user.user_id;
      
      const res = await fetch(`http://localhost:3000/api/users/${userId}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname: user.fullname })
      })
      const result = await res.json()
      
      if (result.success) {
        // อัปเดตข้อมูลใหม่ลงเครื่องทันที
        localStorage.setItem('currentUser', JSON.stringify(user)) 

        // ✨ ใช้ SweetAlert2 แจ้งเตือนสวยๆ
        Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'ข้อมูลส่วนตัวของคุณถูกอัปเดตเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#2ecc71'
        }).then(() => {
            // พอกดตกลง ค่อยรีเฟรชหน้าเว็บ (เพื่อให้ Navbar อัปเดตชื่อตาม)
            window.location.reload() 
        })
        
      } else {
        Swal.fire('บันทึกไม่สำเร็จ', result.message, 'error')
      }
    } catch (error) { 
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อกับ Server ได้', 'error') 
    }
  }

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>กำลังโหลด...</div>

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>👤 ข้อมูลส่วนตัว</h2>
          <p>จัดการข้อมูลชื่อและตรวจสอบสถานะของคุณ</p>
        </div>

        <form onSubmit={handleSave} className="profile-form">
          <div className="form-group">
            {/* ✨ แยกคำเรียกตาม Role ตามที่คุณต้องการ */}
            <label>
              {user.role === 'admin' ? 'ชื่อผู้ใช้งาน (Username)' : 'รหัสนักศึกษา / รหัสพนักงาน'}
            </label>
            <input 
              type="text" 
              value={user.username} 
              disabled 
              className="input-field disabled-input"
              title="ไม่สามารถแก้ไขรหัสประจำตัวได้"
            />
            <small className="hint-text">* รหัสประจำตัวไม่สามารถแก้ไขได้</small>
          </div>

          <div className="form-group">
            <label>ชื่อ-นามสกุลจริง</label>
            <input 
              type="text" 
              value={user.fullname} 
              onChange={e => setUser({...user, fullname: e.target.value})} 
              className="input-field" 
              placeholder="กรุณากรอกชื่อ-นามสกุล"
              required
            />
          </div>

          <div className="form-group">
             <label>ประเภทผู้ใช้งาน</label>
             <div className="status-container">
               <span className={`role-badge ${user.role}`}>
                 {user.role === 'admin' ? '👑 ผู้ดูแลระบบ' : '🎓 นักศึกษา / บุคลากร'}
               </span>
             </div>
          </div>

          <button type="submit" className="btn-save-profile">💾 บันทึกการเปลี่ยนแปลง</button>
        </form>
      </div>
    </div>
  )
}

export default ProfilePage