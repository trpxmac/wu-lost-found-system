import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom' 
import '../ManageCommon.css' 

function AdminItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = () => {
    fetch('http://127.0.0.1:3000/api/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setItems(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  // ฟังก์ชันลบ
  const handleDelete = async (id) => {
    if (window.confirm('⚠️ คุณแน่ใจหรือไม่ที่จะลบรายการนี้? (กู้คืนไม่ได้)')) {
      try {
        // ยิงไปลบที่ Server
        const res = await fetch(`http://127.0.0.1:3000/api/items/${id}`, {
          method: 'DELETE'
        })
        const result = await res.json()

        if (result.success) {
          alert('✅ ลบรายการสำเร็จ')
          // ลบออกจากหน้าจอทันที (UI Update)
          setItems(items.filter(item => item.item_id !== id))
        } else {
          alert('❌ ลบไม่สำเร็จ: ' + result.message)
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ Server')
      }
    }
  }

  // ✅ แก้ไขแล้ว: เปิดใช้งาน Navigate ไปหน้าแก้ไข
  const handleEdit = (id) => {
    navigate(`/items/edit/${id}`) 
  }

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`
  
  const renderStatus = (statusId) => {
    if (statusId === '01') return <span className="badge badge-red">รออนุมัติ</span>
    if (statusId === '02') return <span className="badge badge-orange">รอผู้มารับ</span>
    if (statusId === '03') return <span className="badge badge-green">รับคืนแล้ว</span>
    return <span className="badge badge-gray">-</span>
  }

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>กำลังโหลดข้อมูล...</div>

  return (
    <div className="manage-container">
      <h2>📦 รายการของหาย (Database)</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="🔍 ค้นหาชื่อ / หมวด / สถานที่" 
          className="input-field" 
          style={{ padding: '10px', width: '300px', border: '1px solid #ddd', borderRadius: '5px' }}
        />
      </div>

      <table className="manage-table">
        <thead>
          <tr>
            <th>รหัสรายการ</th>
            <th>ชื่อ</th>
            <th>หมวด</th>
            <th>สถานที่</th>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.item_id}>
              <td style={{ color: '#3498db', fontWeight: 'bold' }}>
                {formatItemID(item.item_id)}
              </td>
              <td>{item.item_name}</td>
              <td>{item.category_id}</td>
              <td>{item.location_found}</td>
              <td>{new Date(item.date_found).toLocaleDateString('th-TH')}</td>
              <td>{renderStatus(item.status_id)}</td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                    <Link to={`/items/${item.item_id}`} className="btn-icon" style={{background:'#f1c40f', color:'white', borderRadius:'4px', fontSize:'14px', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center', width:'30px', height:'30px'}}>
                        👁️
                    </Link>

                    <button 
                        className="btn-icon" 
                        onClick={() => handleEdit(item.item_id)}
                        style={{background:'#2ecc71', color:'white', borderRadius:'4px', fontSize:'14px', width:'30px', height:'30px'}}
                    >
                        ✏️
                    </button>

                    <button 
                        className="btn-icon" 
                        onClick={() => handleDelete(item.item_id)}
                        style={{background:'#e74c3c', color:'white', borderRadius:'4px', fontSize:'14px', width:'30px', height:'30px'}}
                    >
                        🗑️
                    </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminItems