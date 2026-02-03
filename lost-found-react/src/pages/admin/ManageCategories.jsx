import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './ManageCommon.css'

function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({ category_id: '', category_name: '' })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. โหลดข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = () => {
    fetch('http://localhost:3000/api/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error')
        setLoading(false)
      })
  }

  // 2. ฟังก์ชันบันทึก (เพิ่ม หรือ อัปเดต)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (isEditing) {
        // --- โหมดแก้ไข (PUT) ---
        const res = await fetch(`http://localhost:3000/api/categories/${formData.category_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_name: formData.category_name })
        })
        if (res.ok) {
            Swal.fire('แก้ไขเรียบร้อย', 'ข้อมูลหมวดหมู่ถูกอัปเดตแล้ว', 'success')
            setIsEditing(false)
            setFormData({ category_id: '', category_name: '' })
            fetchCategories()
        } else {
            Swal.fire('ผิดพลาด', 'แก้ไขไม่สำเร็จ', 'error')
        }
      } else {
        // --- โหมดเพิ่มใหม่ (POST) ---
        // เช็คก่อนว่ารหัสซ้ำไหม
        if (categories.some(c => c.category_id === formData.category_id)) {
            return Swal.fire('รหัสซ้ำ', 'รหัสหมวดหมู่นี้มีอยู่แล้ว กรุณาใช้รหัสอื่น', 'warning')
        }

        const res = await fetch('http://localhost:3000/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        if (res.ok) {
            Swal.fire('เพิ่มสำเร็จ', 'เพิ่มหมวดหมู่ใหม่เรียบร้อย', 'success')
            setFormData({ category_id: '', category_name: '' })
            fetchCategories()
        } else {
            Swal.fire('ผิดพลาด', 'เพิ่มไม่สำเร็จ', 'error')
        }
      }
    } catch (error) {
        Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
    }
  }

  // เริ่มแก้ไข
  const startEdit = (category) => {
    setFormData(category)
    setIsEditing(true)
  }

  // 3. ฟังก์ชันลบ (ใช้ SweetAlert2)
  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: `คุณต้องการลบหมวดหมู่รหัส "${id}" ใช่ไหม?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // สีแดง
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/categories/${id}`, { 
            method: 'DELETE' 
          })

          if (response.ok) {
            Swal.fire('ลบเรียบร้อย', 'หมวดหมู่ถูกลบออกจากระบบแล้ว', 'success')
            fetchCategories() // โหลดใหม่
          } else {
            // ดึงข้อความ Error จาก Server มาโชว์ (สำคัญมาก กรณีมีของผูกอยู่)
            const errorData = await response.json()
            Swal.fire({
                icon: 'error',
                title: 'ลบไม่สำเร็จ!',
                text: errorData.message || 'อาจมีรายการสิ่งของใช้หมวดหมู่นี้อยู่',
                footer: '💡 คำแนะนำ: ต้องลบหรือย้ายสิ่งของในหมวดนี้ออกก่อน'
            })
          }
        } catch (error) {
          console.error('Delete Error:', error)
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>⏳ กำลังโหลดข้อมูล...</div>

  return (
    <div className="manage-container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom:'3px solid #3498db', display:'inline-block', paddingBottom:5 }}>
        📂 จัดการหมวดหมู่สิ่งของ (Database)
      </h2>

      {/* ฟอร์มจัดการ */}
      <div className="manage-form-box">
        <h4>{isEditing ? '✏️ แก้ไขหมวดหมู่' : '➕ เพิ่มหมวดหมู่ใหม่'}</h4>
        <form onSubmit={handleSubmit} className="inline-form">
          {/* ช่องกรอก ID */}
          <input 
            type="text" 
            placeholder="รหัส (เช่น C001)" 
            required
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
            readOnly={isEditing} 
            style={{ backgroundColor: isEditing ? '#eee' : 'white', maxWidth: '150px' }}
          />

          <input 
            type="text" 
            placeholder="ชื่อหมวดหมู่ (เช่น ของใช้ส่วนตัว)" 
            required
            value={formData.category_name}
            onChange={e => setFormData({ ...formData, category_name: e.target.value })}
            style={{ flex: 1 }}
          />

          <button type="submit" className={`btn ${isEditing ? 'btn-warning' : 'btn-primary'}`}>
            {isEditing ? 'บันทึกแก้ไข' : 'เพิ่มรายการ'}
          </button>
          
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={() => {
              setIsEditing(false); setFormData({ category_id: '', category_name: '' })
            }}>ยกเลิก</button>
          )}
        </form>
      </div>

      {/* ตารางแสดงผล */}
      <table className="manage-table">
        <thead>
          <tr>
            <th style={{width: '150px'}}>รหัส</th>
            <th>ชื่อหมวดหมู่</th>
            <th style={{width: '150px'}}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.category_id}>
              <td>{cat.category_id}</td>
              <td>{cat.category_name}</td>
              <td>
                <div style={{display:'flex', gap:'5px', justifyContent:'center'}}>
                    <button className="btn-icon edit" onClick={() => startEdit(cat)} title="แก้ไข">✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(cat.category_id)} title="ลบ">🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ManageCategories