import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' // ✨ 1. Import SweetAlert2
import './AdminClaim.css'

function AdminClaim() {
  const [foundItems, setFoundItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  
  const [claimData, setClaimData] = useState({
    receiverName: '',
    contactNumber: '', 
    claimDate: new Date().toISOString().split('T')[0],
    remark: '' 
  })

  // 1. ดึงข้อมูลเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = () => {
    fetch('http://localhost:3000/api/items')
      .then(res => res.json())
      .then(data => {
        // กรองเฉพาะสถานะ '02' (รอผู้มารับ)
        const waitingItems = Array.isArray(data) 
            ? data.filter(item => item.status_id === '02') 
            : []
        setFoundItems(waitingItems)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        Swal.fire('Error', 'ไม่สามารถโหลดข้อมูลได้', 'error')
        setLoading(false)
      })
  }

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`

  const handleSelect = (item) => {
    setSelectedItem(item)
    // Reset ฟอร์ม
    setClaimData({ 
        ...claimData, 
        receiverName: '', 
        contactNumber: '',
        remark: '' 
    }) 
  }

  // 2. ฟังก์ชันบันทึกข้อมูล (ใช้ SweetAlert2)
  const handleSubmit = (e) => {
    e.preventDefault()

    // ✨ ใช้ SweetAlert2 ถามยืนยัน
    Swal.fire({
      title: 'ยืนยันการคืนของ?',
      html: `คุณกำลังจะบันทึกการคืนรายการ <b style="color:#3498db">${formatItemID(selectedItem.item_id)}</b><br/>ให้กับคุณ <b>${claimData.receiverName}</b>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71', // สีเขียว
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ยืนยันการคืน',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            const response = await fetch(`http://localhost:3000/api/items/${selectedItem.item_id}/claim`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(claimData)
            })

            const resultData = await response.json()

            if (resultData.success) {
                // ✨ แจ้งเตือนสำเร็จ
                Swal.fire('บันทึกสำเร็จ!', 'ดำเนินการตัดสต็อกและบันทึกประวัติเรียบร้อยแล้ว', 'success')
                
                // ลบรายการที่คืนแล้วออกจากรายการฝั่งซ้าย
                setFoundItems(foundItems.filter(i => i.item_id !== selectedItem.item_id))
                setSelectedItem(null)
            } else {
                Swal.fire('เกิดข้อผิดพลาด', resultData.message, 'error')
            }
        } catch (error) {
            console.error('Submit Error:', error)
            Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>⏳ กำลังโหลดรายการ...</div>

  return (
    <div className="admin-claim-container">
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom:'3px solid #2ecc71', display:'inline-block', paddingBottom:5 }}>
        📦 ดำเนินการคืนสิ่งของ (Admin)
      </h2>
      
      <div className="claim-layout">
        {/* --- ฝั่งซ้าย: รายการของ --- */}
        <div className="items-list-section">
          <h4>รายการที่ "รอผู้มารับ" (Status 02)</h4>
          
          {foundItems.length === 0 && (
              <div style={{padding:'40px', textAlign:'center', color:'#999', border:'1px dashed #ccc', borderRadius:'8px', margin:'10px'}}>
                  <div style={{fontSize:'30px'}}>✅</div>
                  <div>ไม่มีรายการค้างส่งคืน</div>
              </div>
          )}
          
          {foundItems.map(item => (
            <div 
              key={item.item_id} 
              className={`found-item-card ${selectedItem?.item_id === item.item_id ? 'active' : ''}`}
              onClick={() => handleSelect(item)}
            >
              {/* ✅ แก้ไขการแสดงรูปภาพให้ถูกต้อง */}
              {item.item_image ? (
                <img src={`http://localhost:3000/uploads/${item.item_image}`} alt="item" />
              ) : (
                <div style={{width:'60px', height:'60px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'6px'}}>📷</div>
              )}
              
              <div className="found-item-info">
                <h5>{item.item_name}</h5>
                <p>📍 {item.location_found}</p>
                <p style={{color:'#3498db', marginTop:'5px', fontWeight:'bold'}}>
                   {formatItemID(item.item_id)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- ฝั่งขวา: ฟอร์ม --- */}
        <div className="claim-form-section">
          {selectedItem ? (
            <form onSubmit={handleSubmit} className="claim-form-box">
              <h3>
                คืนรายการ: <span style={{color:'#3498db'}}>{formatItemID(selectedItem.item_id)}</span>
              </h3>
              
              <div style={{display:'flex', gap:'15px', marginBottom:'20px', paddingBottom:'15px', borderBottom:'1px solid #eee'}}>
                 {/* ✅ รูปในฟอร์ม */}
                 {selectedItem.item_image ? (
                    <img src={`http://localhost:3000/uploads/${selectedItem.item_image}`} alt="" style={{width:60, height:60, borderRadius:6, objectFit:'cover'}}/>
                 ) : (
                    <div style={{width:60, height:60, background:'#eee', borderRadius:6}}></div>
                 )}
                 
                 <div>
                    <div style={{fontWeight:'bold', fontSize:'18px'}}>{selectedItem.item_name}</div>
                    <div style={{fontSize:'14px', color:'#777'}}>{selectedItem.description || '- ไม่มีรายละเอียด -'}</div>
                 </div>
              </div>
              
              <div className="form-group">
                <label>ชื่อ-นามสกุล ผู้รับ <span style={{color:'red'}}>*</span></label>
                <input 
                  type="text" required 
                  className="input-field"
                  value={claimData.receiverName}
                  onChange={e => setClaimData({...claimData, receiverName: e.target.value})}
                  placeholder="ระบุชื่อจริงของผู้มารับ"
                />
              </div>

              <div className="form-group">
                <label>เบอร์โทรติดต่อ <span style={{color:'red'}}>*</span></label>
                <input 
                  type="tel" required 
                  className="input-field"
                  value={claimData.contactNumber}
                  onChange={e => setClaimData({...claimData, contactNumber: e.target.value})}
                  placeholder="08x-xxx-xxxx"
                />
              </div>

              <div className="form-group">
                <label>วันที่รับ</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={claimData.claimDate}
                  onChange={e => setClaimData({...claimData, claimDate: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>หมายเหตุ / หลักฐาน</label>
                <textarea 
                  className="input-field"
                  rows="3"
                  value={claimData.remark}
                  onChange={e => setClaimData({...claimData, remark: e.target.value})}
                  placeholder="เช่น มารับแทนเจ้าของ, แสดงบัตรนักศึกษาแล้ว"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-submit">
                ✅ ยืนยันการคืน (ตัดสต็อก)
              </button>
            </form>
          ) : (
            <div className="placeholder-box">
              <span style={{fontSize:'50px'}}>👈</span>
              <p>เลือกรายการจากด้านซ้าย<br/>เพื่อทำรายการคืนของ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminClaim