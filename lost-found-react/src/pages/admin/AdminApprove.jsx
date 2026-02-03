import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' 
import './ManageCommon.css' 
import './AdminApprove.css' 

function AdminApprove() {
  const [pendingItems, setPendingItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // 1. โหลดข้อมูล
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch('http://localhost:3000/api/items'),
        fetch('http://localhost:3000/api/categories')
      ])

      const itemsData = await itemsRes.json()
      const catsData = await catsRes.json()

      if (Array.isArray(itemsData)) {
        setPendingItems(itemsData.filter(item => item.status_id === '01'))
      }
      
      if (Array.isArray(catsData)) {
        setCategories(catsData)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Helper Functions
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.category_id === catId)
    return cat ? cat.category_name : catId
  }

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`

  // 🔥 Approve Logic
  const handleApprove = (id) => {
    Swal.fire({
      title: 'ยืนยันการอนุมัติ?',
      text: "รายการนี้จะถูกแสดงในหน้าสาธารณะ (รอผู้มารับ)",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#27ae60', 
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'อนุมัติเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/items/${id}/approve`, {
            method: 'PUT'
          })
          const resultData = await res.json()

          if (resultData.success) {
            Swal.fire('เรียบร้อย!', 'อนุมัติรายการสำเร็จ', 'success')
            setPendingItems(pendingItems.filter(item => item.item_id !== id))
          } else {
            Swal.fire('ผิดพลาด', 'ไม่สามารถอนุมัติได้', 'error')
          }
        } catch (error) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  // 🔥 Reject Logic
  const handleReject = (id) => {
    Swal.fire({
      title: 'ไม่อนุมัติ/ลบรายการ?',
      text: "รายการนี้จะถูกลบออกจากระบบถาวร!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', 
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบทิ้ง',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/items/${id}`, {
            method: 'DELETE'
          })
          const resultData = await res.json()

          if (resultData.success) {
            Swal.fire('ลบสำเร็จ', 'รายการถูกปฏิเสธและลบออกจากระบบแล้ว', 'success')
            setPendingItems(pendingItems.filter(item => item.item_id !== id))
          } else {
            Swal.fire('ผิดพลาด', 'ลบไม่สำเร็จ', 'error')
          }
        } catch (error) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>⏳ กำลังโหลดรายการรออนุมัติ...</div>

  return (
    <div className="manage-container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom:'3px solid #f1c40f', display:'inline-block', paddingBottom:5 }}>
        ✅ อนุมัติการแจ้งของหาย
      </h2>

      {pendingItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px', border:'1px solid #eee', marginTop:'20px' }}>
          <span style={{fontSize:'3rem'}}>🎉</span>
          <p style={{ color: '#7f8c8d', fontSize:'1.2rem', marginTop:'10px' }}>ไม่มีรายการรออนุมัติในขณะนี้</p>
          <p style={{ color: '#aaa' }}>ทุกรายการได้รับการตรวจสอบแล้ว</p>
        </div>
      ) : (
        /* ✅ เพิ่ม div นี้ครอบ table ครับ เพื่อให้เลื่อนได้ในมือถือ */
        <div className="table-container"> 
            <table className="approve-table">
              <thead>
                <tr>
                  <th style={{width:'80px'}}>รหัส</th>
                  <th style={{width:'90px'}}>รูปภาพ</th>
                  <th>รายละเอียด</th>
                  <th style={{width:'150px'}}>สถานที่พบ</th>
                  <th style={{width:'120px'}}>วันที่แจ้ง</th>
                  <th style={{width:'180px'}}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {pendingItems.map(item => (
                  <tr key={item.item_id}>
                    <td style={{ fontWeight: 'bold', color: '#3498db' }}>
                        {formatItemID(item.item_id)}
                    </td>
                    
                    <td>
                        {item.item_image ? (
                          <img 
                            src={`http://localhost:3000/uploads/${item.item_image}`} 
                            alt="item" 
                            className="item-thumbnail" 
                          />
                        ) : (
                          <div className="item-thumbnail" style={{background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>📷</div>
                        )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 'bold', fontSize:'1.1rem', color:'#2c3e50' }}>{item.item_name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop:'5px' }}>
                        หมวด: <span style={{fontWeight:'600', color:'#555'}}>{getCategoryName(item.category_id)}</span>
                      </div>
                      {item.description && (
                          <div style={{ fontSize: '0.85rem', color: '#999', marginTop:'5px', fontStyle:'italic' }}>
                            "{item.description}"
                          </div>
                      )}
                      <div style={{fontSize:'0.8rem', color:'#aaa', marginTop:'5px'}}>
                        แจ้งโดย: {item.reporter_name || 'ไม่ระบุ'}
                      </div>
                    </td>
                    <td>{item.location_found}</td>
                    <td>{new Date(item.date_found).toLocaleDateString('th-TH')}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-approve"
                          onClick={() => handleApprove(item.item_id)}
                        >
                          ✔ อนุมัติ
                        </button>
                        <button 
                          className="btn-action btn-reject"
                          onClick={() => handleReject(item.item_id)}
                        >
                          ✖ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div> /* ปิด table-container */
      )}
    </div>
  )
}

export default AdminApprove