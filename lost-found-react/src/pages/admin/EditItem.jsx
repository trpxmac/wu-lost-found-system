import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ManageCommon.css'

function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    item_name: '',
    location_found: '',
    description: '',
    category_id: '',
    status_id: '' // ✅ ต้องมีตัวนี้ เพื่อส่งกลับไปให้ Backend
  })
  
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. ดึงหมวดหมู่
    fetch('http://127.0.0.1:3000/api/categories')
      .then(res => res.json())
      .then(catData => setCategories(catData))
      .catch(err => console.error('Error fetching categories:', err))

    // 2. ดึงข้อมูลเก่ามาใส่ฟอร์ม
    fetch(`http://127.0.0.1:3000/api/items/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log("📥 ข้อมูลเดิมที่ดึงมา:", data); // เช็คว่าดึงมาครบไหม
        setFormData({
          item_name: data.item_name || '',
          location_found: data.location_found || '',
          description: data.description || '',
          category_id: data.category_id || '',
          status_id: data.status_id || '' // ✅ สำคัญ: ห้ามหาย
        })
        setLoading(false)
      })
      .catch(err => {
        alert('ไม่พบข้อมูลรายการนี้')
        navigate('/items')
      })
  }, [id, navigate])

  const handleUpdate = async (e) => {
    e.preventDefault()

    // 🕵️‍♂️ จุดเช็คตาย: ดูที่ Console (F12) ก่อนส่ง
    console.log("📤 กำลังส่งข้อมูลไปแก้:", formData);

    if (!window.confirm('ยืนยันการบันทึกการแก้ไข?')) return

    try {
      const res = await fetch(`http://127.0.0.1:3000/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // ส่งข้อมูลทั้งหมดรวมถึง status_id
      })
      const result = await res.json()

      console.log("✅ ผลลัพธ์จาก Server:", result); // ดูว่า Server ตอบอะไรกลับมา

      if (result.success) {
        alert('✅ แก้ไขข้อมูลเรียบร้อยแล้ว')
        navigate('/items')
      } else {
        alert('❌ แก้ไขไม่สำเร็จ: ' + result.message)
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Server')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>กำลังโหลดข้อมูล...</div>

  return (
    <div className="manage-container" style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>✏️ แก้ไขรายการ {id}</h2>
      
      <form onSubmit={handleUpdate} className="report-form" style={{ background: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        <label>ชื่อสิ่งของ</label>
        <input 
          className="input-field" 
          type="text"
          value={formData.item_name}
          onChange={e => setFormData({ ...formData, item_name: e.target.value })}
          required
        />

        <label style={{ marginTop: '15px', display: 'block' }}>หมวดหมู่</label>
        <select 
          className="input-field"
          value={formData.category_id}
          onChange={e => setFormData({ ...formData, category_id: e.target.value })}
          required
        >
          <option value="">-- เลือกหมวดหมู่ --</option>
          {categories.map(cat => (
            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
          ))}
        </select>

        <label style={{ marginTop: '15px', display: 'block' }}>สถานที่พบ</label>
        <input 
          className="input-field" 
          type="text"
          value={formData.location_found}
          onChange={e => setFormData({ ...formData, location_found: e.target.value })}
          required
        />

        <label style={{ marginTop: '15px', display: 'block' }}>รายละเอียดเพิ่มเติม</label>
        <textarea 
          className="input-field" 
          rows="4"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />

        <div style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn" style={{ background: '#95a5a6', flex: 1 }}>
            ยกเลิก
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            บันทึกการแก้ไข
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditItem