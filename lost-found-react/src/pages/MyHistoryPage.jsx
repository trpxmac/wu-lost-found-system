import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './ItemsPage.css' // ใช้ CSS เดียวกับหน้ารายการของหาย

function MyHistory() {
  const { user } = useContext(UserContext)
  const [myItems, setMyItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let currentUserId = user?.id || user?.user_id;

    if (!currentUserId) {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          currentUserId = parsedUser.id || parsedUser.user_id;
        } catch (e) {
          console.error("Error parsing user from storage", e);
        }
      }
    }

    if (currentUserId) {
      fetchMyHistory(currentUserId)
    } else {
      const timer = setTimeout(() => setLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [user])

  const fetchMyHistory = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/items/user/${userId}`)
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setMyItems(data)
      }
    } catch (err) {
      console.error("Error fetching history:", err)
      Swal.fire('Error', 'ไม่สามารถดึงข้อมูลประวัติได้', 'error')
    } finally {
      setLoading(false)
    }
  }

  // 🔥 ฟังก์ชันลบรายการ (แบบมี Popup สวยๆ)
  const handleDelete = (itemId) => {
    Swal.fire({
      title: 'ยกเลิกการแจ้ง?',
      text: "คุณต้องการลบรายการนี้ออกจากระบบใช่ไหม",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c', // สีแดง
      cancelButtonColor: '#95a5a6', // สีเทา
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ไม่ลบ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/items/${itemId}`, { method: 'DELETE' })
          const resultData = await res.json()
          
          if (resultData.success) {
            Swal.fire(
              'ลบเรียบร้อย!',
              'รายการถูกลบออกจากระบบแล้ว',
              'success'
            )
            // อัปเดตหน้าจอโดยเอา item ที่ลบออกไป
            setMyItems(myItems.filter(item => item.item_id !== itemId))
          } else {
            Swal.fire('เกิดข้อผิดพลาด', resultData.message, 'error')
          }
        } catch (err) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  const renderStatus = (statusId) => {
    if (statusId === '01') return <span className="badge badge-red">รอตรวจสอบ</span>
    if (statusId === '02') return <span className="badge badge-orange">รอผู้มารับ</span>
    if (statusId === '03') return <span className="badge badge-green">รับคืนแล้ว</span>
    return <span>-</span>
  }

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`

  return (
    <div className="items-page">
      <h1>🕒 ประวัติการแจ้งของฉัน ({myItems.length} รายการ)</h1>

      {loading ? (
        <div style={{textAlign:'center', marginTop:50}}>⏳ กำลังโหลดประวัติ...</div>
      ) : myItems.length === 0 ? (
        <div style={{textAlign:'center', padding:'50px', border:'2px dashed #ddd', borderRadius:'10px', marginTop:'20px'}}>
          <p style={{color:'#999', fontSize:'1.2rem'}}>คุณยังไม่เคยแจ้งของหาย หรือพบของเลย</p>
          <Link to="/report" className="btn" style={{backgroundColor:'#2ecc71', color:'white', padding:'10px 20px', textDecoration:'none', borderRadius:'5px', marginTop:'10px', display:'inline-block'}}>
            📢 แจ้งของหาย/พบ ที่นี่
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="items-table">
            <thead>
              <tr>
                <th style={{width: '70px'}}>รูปภาพ</th>
                <th>รหัส</th>
                <th>ชื่อสิ่งของ</th>
                <th>หมวดหมู่</th>
                <th>สถานที่</th>
                <th>วันที่แจ้ง</th>
                <th>สถานะ</th>
                <th style={{textAlign:'center'}}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {myItems.map((item) => (
                <tr key={item.item_id}>
                  {/* เพิ่มรูปภาพเล็กๆ ให้ดูสวยงาม (ถ้ามี) */}
                  <td>
                    {item.item_image ? (
                        <img src={`http://localhost:3000/uploads/${item.item_image}`} alt="รูป" style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd'}} />
                    ) : (
                        <div style={{width:'50px', height:'50px', background:'#f0f0f0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc'}}>📷</div>
                    )}
                  </td>
                  <td style={{fontWeight:'bold', color:'#3498db'}}>{formatItemID(item.item_id)}</td>
                  <td>{item.item_name}</td>
                  <td>{item.category_name || item.category_id}</td> 
                  <td>{item.location_found}</td>
                  <td>{new Date(item.date_found).toLocaleDateString('th-TH')}</td>
                  <td>{renderStatus(item.status_id)}</td>
                  <td style={{textAlign:'center'}}>
                    <div className="action-buttons" style={{justifyContent:'center'}}>
                      <Link to={`/items/${item.item_id}`} className="btn-icon view" title="ดูรายละเอียด">👁️</Link>
                      
                      {/* ปุ่มลบแสดงเฉพาะตอนสถานะรอตรวจสอบ (01) */}
                      {item.status_id === '01' && (
                        <button className="btn-icon delete" onClick={() => handleDelete(item.item_id)} title="ยกเลิกการแจ้ง">🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MyHistory