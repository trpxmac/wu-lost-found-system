import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ItemDetailPage.css'

function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // State
  const [item, setItem] = useState(null)
  const [categories, setCategories] = useState([]) 
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)

  // ==============================
  // 2. ดึงข้อมูลจาก Database
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemRes = await fetch(`http://localhost:3000/api/items/${id}`)
        if (!itemRes.ok) throw new Error('Not found')
        const itemData = await itemRes.json()
        setItem(itemData)

        const catRes = await fetch('http://localhost:3000/api/categories')
        const catData = await catRes.json()
        setCategories(catData)

        setLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) return <div style={{padding:'50px', textAlign:'center'}}>⏳ กำลังโหลดข้อมูล...</div>
  if (!item) return <div style={{padding:'50px', textAlign:'center', color:'red'}}>❌ ไม่พบข้อมูลสินค้านี้</div>

  // --- Helper Functions ---
  const getCategoryName = (catId) => {
    if (categories.length === 0) return 'กำลังโหลด...'
    const cat = categories.find(c => c.category_id === catId)
    return cat ? cat.category_name : catId 
  }

  const getStatusClass = (statusId) => {
    if (statusId === '02') return 'status-found'     // สีส้ม
    if (statusId === '03') return 'status-returned'  // สีเขียว
    return 'status-lost'                             // สีแดง
  }

  const getStatusText = (statusId) => {
    if (statusId === '01') return 'รออนุมัติ'
    if (statusId === '02') return 'รอผู้มารับ'
    if (statusId === '03') return 'รับคืนแล้ว'
    return 'ไม่ทราบสถานะ'
  }

  return (
    <div className="detail-page-container">
      <button className="btn-back" onClick={() => navigate(-1)}>
        &larr; ย้อนกลับ
      </button>

      <div className="detail-card">
        {/* --- ส่วนรูปภาพ (✅ แก้ไขตรงนี้) --- */}
        <div className="detail-image-section">
          {item.item_image ? (
            <img 
              // ✅ ดึงรูปจาก Server: localhost:3000/uploads/ชื่อไฟล์
              src={`http://localhost:3000/uploads/${item.item_image}`} 
              alt={item.item_name} 
              style={{ width: '100%', height: '300px', objectFit: 'contain', backgroundColor: '#f9f9f9' }}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=Error+Loading+Image' }}
            />
          ) : (
            // กรณีไม่มีรูป ให้โชว์ Placeholder
            <div style={{
                width: '100%', height: '300px', backgroundColor: '#eee', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                color: '#aaa', flexDirection: 'column'
            }}>
                <span style={{fontSize: '3rem'}}>📷</span>
                <p>ไม่มีรูปภาพ</p>
            </div>
          )}

          <div className={`status-tag ${getStatusClass(item.status_id)}`}>
            {getStatusText(item.status_id)}
          </div>
        </div>

        {/* --- ส่วนข้อมูล --- */}
        <div className="detail-info-section">
          <h1>{item.item_name}</h1>
          
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'10px'}}>
             <p className="date-text" style={{margin:0}}>
               📅 วันที่: {item.date_found ? new Date(item.date_found).toLocaleDateString('th-TH') : '-'}
             </p>
             <div style={{fontSize:'0.9rem', color:'#555', backgroundColor:'#f0f2f5', padding:'5px 10px', borderRadius:'15px'}}>
                📢 แจ้งโดย: <strong>{item.reporter_name || 'ไม่ระบุตัวตน'}</strong>
             </div>
          </div>
          
          <div className="info-group">
            <label>หมวดหมู่:</label>
            <span>{getCategoryName(item.category_id)}</span>
          </div>

          <div className="info-group">
            <label>สถานที่:</label>
            <span>📍 {item.location_found}</span>
          </div>

          <div className="info-group description-box">
            <label>รายละเอียดเพิ่มเติม:</label>
            <p>{item.description || 'ไม่มีรายละเอียดเพิ่มเติม'}</p>
          </div>

          {/* --- ปุ่ม Action --- */}
          <div className="action-area">
            
            {/* 02: รอผู้มารับ -> ปุ่มเคลม */}
            {item.status_id === '02' && (
              <button className="btn-claim" onClick={() => setShowContact(true)}>
                🙋‍♂️ นี่คือของของฉัน (ดูช่องทางรับคืน)
              </button>
            )}

            {/* 01: รออนุมัติ -> แจ้งเตือน */}
            {item.status_id === '01' && (
              <div className="status-alert">
                ⚠️ รายการนี้กำลังรอการตรวจสอบและอนุมัติจากเจ้าหน้าที่
              </div>
            )}

            {/* 03: คืนแล้ว -> โชว์ข้อมูลคนรับคืน */}
            {item.status_id === '03' && (
              <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  backgroundColor: '#e8f5e9',
                  borderRadius: '10px',
                  border: '1px solid #c8e6c9',
                  borderLeft: '5px solid #2ecc71'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#27ae60', display:'flex', alignItems:'center', gap:'10px' }}>
                   ✅ ส่งมอบคืนเจ้าของแล้ว
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', fontSize: '1rem', color:'#444' }}>
                  <strong style={{color:'#2e7d32'}}>👤 ผู้รับคืน:</strong>
                  <span>{item.receiver_name || '- ไม่ระบุชื่อ -'}</span>
                  
                  <strong style={{color:'#2e7d32'}}>📞 เบอร์ติดต่อ:</strong>
                  <span>{item.contact_number || '-'}</span>
                  
                  <strong style={{color:'#2e7d32'}}>📅 วันที่รับ:</strong>
                  <span>{item.claim_date ? new Date(item.claim_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) : '-'}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* --- Modal Contact (Pop-up) --- */}
      {showContact && (
        <div className="modal-overlay" onClick={() => setShowContact(false)}>
          <div className="modal-contact-box" onClick={e => e.stopPropagation()}>
            <h3>📍 ช่องทางการติดต่อรับคืน</h3>
            <div className="contact-details">
              <p>กรุณานำหลักฐานยืนยันตัวตน (เช่น บัตรนักศึกษา) ไปติดต่อรับของได้ที่:</p>
              
              <div className="location-highlight">
                <strong>{item.location_found}</strong>
                <br />
                <small>(หรือติดต่อห้องกิจการนักศึกษา)</small>
              </div>

              <p>📞 เบอร์โทรศัพท์ส่วนกลาง: <strong>0-7567-3000</strong></p>
              
              <div className="admin-note">
                ℹ️ เจ้าหน้าที่จะทำการบันทึกข้อมูลและถ่ายรูปหลักฐานเข้าระบบ
              </div>
            </div>
            <button className="btn-close" onClick={() => setShowContact(false)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemDetailPage