import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' 
import './ReportPage.css' 

function ReportPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  // ✅ 1. ฟังก์ชันหาวันที่ปัจจุบัน (YYYY-MM-DD)
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  
  // State เก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    item_name: '', 
    category_id: '', 
    location_found: '', 
    date_found: getTodayDate(), // 🔥 2. ตั้งค่าเริ่มต้นเป็นวันนี้
    description: '', 
    image: null,      
    previewUrl: null  
  })

  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/categories')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setCategories(data) })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // ฟังก์ชันจัดการเมื่อเลือกรูปภาพ
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData(prev => ({ 
          ...prev, 
          image: file, 
          previewUrl: URL.createObjectURL(file) 
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const userStr = localStorage.getItem('currentUser')
    const user = userStr ? JSON.parse(userStr) : null

    if (!user) {
        Swal.fire('แจ้งเตือน', 'กรุณาเข้าสู่ระบบก่อน', 'warning')
        return
    }

    // ใช้ FormData เพื่อส่งไฟล์
    const dataToSend = new FormData()
    dataToSend.append('name', formData.item_name)
    dataToSend.append('category', formData.category_id)
    dataToSend.append('location', formData.location_found)
    dataToSend.append('date', formData.date_found)
    dataToSend.append('description', formData.description)
    dataToSend.append('created_by', user.id || user.user_id) 

    if (formData.image) {
        dataToSend.append('image', formData.image)
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/api/report', {
            method: 'POST',
            body: dataToSend 
        })

        const result = await response.json()
        if (result.success) {
            Swal.fire({
                title: 'บันทึกสำเร็จ!',
                text: 'ข้อมูลและรูปภาพถูกส่งเข้าระบบเรียบร้อยแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง',
                confirmButtonColor: '#2ecc71'
            }).then(() => {
                navigate('/items') 
            })
        } else {
            Swal.fire('เกิดข้อผิดพลาด', result.message, 'error')
        }
    } catch (error) {
        console.error('Submit Error:', error)
        Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
    }
  }

  return (
    <div className="report-page-container">
      <h1>📢 แจ้งพบสิ่งของ / ของหาย</h1>
      
      <form onSubmit={handleSubmit} className="report-form">
        
        {/* --- ส่วนอัปโหลดรูปภาพ --- */}
        <div className="form-group" style={{textAlign: 'center'}}>
            <label style={{display:'block', marginBottom:10}}>📸 รูปภาพสิ่งของ (ถ้ามี)</label>
            
            {formData.previewUrl && (
                <div style={{marginBottom: 10}}>
                    <img src={formData.previewUrl} alt="Preview" style={{maxWidth: '200px', borderRadius: 8, border: '1px solid #ddd'}} />
                </div>
            )}

            <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="input-field"
                style={{padding: 10}}
            />
        </div>

        <div className="form-group">
          <label>ชื่อสิ่งของ *</label>
          <input required name="item_name" value={formData.item_name} onChange={handleChange} className="input-field" placeholder="เช่น กระเป๋าสตางค์" />
        </div>
        <div className="form-group">
          <label>หมวดหมู่ *</label>
          <select required name="category_id" value={formData.category_id} onChange={handleChange} className="input-field">
            <option value="">-- เลือกหมวดหมู่ --</option>
            {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>สถานที่พบ *</label>
          <input required name="location_found" value={formData.location_found} onChange={handleChange} className="input-field" />
        </div>
        <div className="form-group">
          <label>วันที่พบ *</label>
          {/* ✅ ค่าในนี้จะเป็นวันที่ปัจจุบัน และเลือกเปลี่ยนได้ */}
          <input type="date" required name="date_found" value={formData.date_found} onChange={handleChange} className="input-field" />
        </div>
        <div className="form-group">
          <label>รายละเอียดเพิ่มเติม</label>
          <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="input-field" />
        </div>
        <div className="form-actions">
           <button type="button" onClick={() => navigate(-1)} className="btn-report-cancel">ยกเลิก</button>
           <button type="submit" className="btn-report-submit">บันทึกข้อมูล</button>
        </div>
      </form>
    </div>
  )
}

export default ReportPage