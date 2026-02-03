import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './ManageCommon.css' 

function ManageStatuses() {
  const [statuses, setStatuses] = useState([])
  const [formData, setFormData] = useState({ status_id: '', status_name: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchStatuses()
  }, [])

  const fetchStatuses = () => {
    fetch('http://localhost:3000/api/statuses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStatuses(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error')
        setLoading(false)
      })
  }

  // 2. ฟังก์ชันบันทึก
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isEditing) {
        // --- โหมดแก้ไข (PUT) ---
        const res = await fetch(`http://localhost:3000/api/statuses/${formData.status_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status_name: formData.status_name })
        })
        if (res.ok) {
            Swal.fire('แก้ไขเรียบร้อย', 'ข้อมูลสถานะถูกอัปเดตแล้ว', 'success')
            setIsEditing(false)
            setFormData({ status_id: '', status_name: '' })
            fetchStatuses()
        } else {
            Swal.fire('ผิดพลาด', 'แก้ไขไม่สำเร็จ', 'error')
        }
      } else {
        // --- โหมดเพิ่มใหม่ (POST) ---
        // ตรวจสอบรหัสซ้ำในหน้าจอก่อนส่ง
        if (statuses.some(s => s.status_id === formData.status_id)) {
            return Swal.fire('รหัสซ้ำ', 'รหัสสถานะนี้มีอยู่แล้ว', 'warning')
        }

        const res = await fetch('http://localhost:3000/api/statuses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        
        const result = await res.json()
        if (res.ok) {
            Swal.fire('เพิ่มสำเร็จ', 'เพิ่มสถานะใหม่เรียบร้อย', 'success')
            setFormData({ status_id: '', status_name: '' })
            fetchStatuses()
        } else {
            Swal.fire('ผิดพลาด', result.message, 'error')
        }
      }
    } catch (error) {
        Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
    }
  }

  // เริ่มแก้ไข
  const startEdit = (status) => {
    setFormData(status)
    setIsEditing(true)
  }

  // ฟังก์ชันลบ (ใช้ SweetAlert2)
  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบสถานะรหัส "${id}" ใช่ไหม?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // สีแดง
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/statuses/${id}`, { method: 'DELETE' })
          
          if (response.ok) {
             Swal.fire('ลบเรียบร้อย', 'สถานะถูกลบออกจากระบบแล้ว', 'success')
             fetchStatuses()
          } else {
             // แจ้งเตือนกรณีลบไม่ได้ (เช่น สถานะนี้ถูกใช้อยู่)
             const errorData = await response.json()
             Swal.fire({
                icon: 'error',
                title: 'ลบไม่สำเร็จ!',
                text: errorData.message || 'สถานะนี้อาจถูกใช้งานอยู่ในรายการสิ่งของ',
                footer: '💡 คำแนะนำ: ต้องเปลี่ยนสถานะของสิ่งของที่ใช้อยู่ก่อน'
             })
          }
        } catch (error) {
           Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>กำลังโหลดข้อมูล...</div>

  return (
    <div className="manage-container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom:'3px solid #9b59b6', display:'inline-block', paddingBottom:5 }}>
        🏷️ จัดการสถานะระบบ (Database)
      </h2>

      <div className="manage-form-box">
        <h4>{isEditing ? '✏️ แก้ไขสถานะ' : '➕ เพิ่มสถานะใหม่'}</h4>
        <form onSubmit={handleSubmit} className="inline-form">
          {/* เพิ่มช่องกรอก ID ให้กำหนดเองได้ */}
          <input 
            type="text" 
            placeholder="รหัส (เช่น 05)" 
            required
            value={formData.status_id}
            onChange={e => setFormData({ ...formData, status_id: e.target.value })}
            readOnly={isEditing} // ถ้าแก้ไข ห้ามแก้ ID
            style={{ backgroundColor: isEditing ? '#eee' : 'white', maxWidth: '120px' }}
          />

          <input 
            type="text" 
            placeholder="ชื่อสถานะ (เช่น ยกเลิก, หมดอายุ)" 
            required
            value={formData.status_name}
            onChange={e => setFormData({ ...formData, status_name: e.target.value })}
            style={{ flex: 1 }}
          />

          <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'}`}>
            {isEditing ? 'บันทึกแก้ไข' : 'เพิ่มรายการ'}
          </button>
          
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={() => {
              setIsEditing(false); setFormData({ status_id: '', status_name: '' })
            }}>ยกเลิก</button>
          )}
        </form>
      </div>

      <table className="manage-table">
        <thead>
          <tr>
            <th style={{width: '100px'}}>รหัส</th>
            <th>ชื่อสถานะ</th>
            <th style={{width: '150px'}}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map(st => (
            <tr key={st.status_id}>
              <td>{st.status_id}</td>
              <td>{st.status_name}</td>
              <td>
                <div style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                    <button className="btn-icon edit" onClick={() => startEdit(st)} title="แก้ไข">✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(st.status_id)} title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ManageStatuses