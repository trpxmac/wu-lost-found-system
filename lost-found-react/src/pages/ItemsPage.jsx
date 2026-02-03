import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2' 
import './ItemsPage.css' 

function ItemsPage({ userRole }) {
  const [items, setItems] = useState([]) 
  const [categories, setCategories] = useState([]) 
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 

  // 1. ดึงข้อมูลจาก Database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemsRes = await fetch('http://localhost:3000/api/items')
        const itemsData = await itemsRes.json()
        
        const catRes = await fetch('http://localhost:3000/api/categories')
        const catData = await catRes.json()

        if (Array.isArray(itemsData)) {
            // เรียงวันที่ล่าสุดขึ้นก่อน
            itemsData.sort((a, b) => new Date(b.date_found) - new Date(a.date_found))
            setItems(itemsData)
        }
        if (Array.isArray(catData)) setCategories(catData)
        
        setLoading(false)
      } catch (err) {
        console.error('Error fetching data:', err)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // รีเซ็ตหน้าเมื่อค้นหาใหม่
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  // Helper Functions
  const getCategoryName = (id) => {
    const cat = categories.find(c => c.category_id === id)
    return cat ? cat.category_name : id
  }

  const getStatusText = (statusId) => {
    if (statusId === '01') return 'รออนุมัติ'
    if (statusId === '02') return 'รอผู้มารับ'
    if (statusId === '03') return 'รับคืนแล้ว'
    return 'ไม่ระบุ'
  }

  const getBadgeClass = (statusId) => {
    switch(statusId) {
      case '01': return 'badge-orange'
      case '02': return 'badge-green'
      case '03': return 'badge-red'
      default: return 'badge-orange'
    }
  }

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`

  // State Modals (แก้ไขข้อมูล)
  const [editModal, setEditModal] = useState({ show: false, itemId: null })
  const [editForm, setEditForm] = useState({
    item_name: '', category_id: '', location_found: '', description: '', status_id: '' 
  })

  // 🔥 Logic การลบ (Admin Only)
  const handleDelete = (id) => {
    Swal.fire({
      title: 'แน่ใจหรือไม่?',
      text: "คุณต้องการลบรายการนี้ใช่ไหม (กู้คืนไม่ได้นะ)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/items/${id}`, { method: 'DELETE' })
          const data = await res.json()
          
          if (data.success) {
            Swal.fire('ลบสำเร็จ!', 'รายการถูกลบออกจากระบบแล้ว', 'success')
            setItems(items.filter(item => item.item_id !== id))
          } else {
            Swal.fire('เกิดข้อผิดพลาด', data.message, 'error')
          }
        } catch (error) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  // ✏️ Logic การแก้ไข (Admin Only)
  const openEditModal = (item) => {
    setEditModal({ show: true, itemId: item.item_id })
    setEditForm({
      item_name: item.item_name,
      category_id: item.category_id,
      location_found: item.location_found,
      description: item.description || '',
      status_id: item.status_id 
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`http://localhost:3000/api/items/${editModal.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const result = await res.json()
      if (result.success) {
        Swal.fire('สำเร็จ', 'แก้ไขข้อมูลเรียบร้อย', 'success')
        
        const updatedItems = items.map(item => {
          if (item.item_id === editModal.itemId) {
            return { ...item, ...editForm }
          }
          return item
        })
        setItems(updatedItems)
        setEditModal({ show: false, itemId: null })
      } else {
        Swal.fire('แก้ไขไม่สำเร็จ', result.message, 'error')
      }
    } catch (error) {
      Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
    }
  }

  // 🔍 Logic ค้นหา & Pagination
  const filteredItems = items.filter(item => {
    // ถ้าไม่ใช่ Admin ให้เห็นแค่ '02' เท่านั้น (ตัด '03' ออก)
    const isVisible = userRole === 'admin' || item.status_id === '02';
    
    if (!isVisible) return false;

    const term = search.toLowerCase().trim()
    const itemName = (item.item_name || '').toLowerCase()
    const location = (item.location_found || '').toLowerCase()
    const catName = String(getCategoryName(item.category_id) || '').toLowerCase()
    const dateText = item.date_found ? new Date(item.date_found).toLocaleDateString('th-TH') : ''
    
    return (
      itemName.includes(term) || location.includes(term) || catName.includes(term) || dateText.includes(term)
    )
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>⏳ กำลังโหลดข้อมูล...</div>

  return (
    <div className="items-page">
      
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
        <h1 style={{margin: 0}}>📦 รายการของหาย (ทั้งหมด {filteredItems.length} รายการ)</h1>
        
        {/* ✅ แก้ไขตรงนี้: ถ้าเป็น Guest ให้โชว์ปุ่มกลับ Login / ถ้า User โชว์ปุ่มแจ้ง */}
        {userRole !== 'guest' ? (
          <Link 
              to="/report" 
              className="btn-report-submit"
              style={{
                  textDecoration:'none', 
                  display:'flex', 
                  alignItems:'center', 
                  gap:'5px', 
                  padding:'10px 20px',
                  width: 'fit-content', 
                  whiteSpace: 'nowrap'
              }}
          >
            📢 แจ้งของหาย/พบ
          </Link>
        ) : (
          <Link 
              to="/" 
              className="btn-report-submit"
              style={{
                  textDecoration:'none', 
                  display:'flex', 
                  alignItems:'center', 
                  gap:'5px', 
                  padding:'10px 20px',
                  width: 'fit-content', 
                  whiteSpace: 'nowrap',
                  backgroundColor: '#3498db' // สีฟ้าสำหรับปุ่ม Login
              }}
          >
            🔐 เข้าสู่ระบบ / กลับหน้าหลัก
          </Link>
        )}
      </div>

      {/* Search Box */}
      <input
        type="text"
        className="search-box"
        placeholder="🔍 ค้นหาชื่อ / หมวด / สถานที่ / วันที่..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th style={{width: '70px'}}>รูปภาพ</th> 
              <th style={{width: '80px'}}>รหัส</th>
              <th>ชื่อสิ่งของ</th>
              <th>หมวด</th>
              <th>สถานที่</th>
              <th>วันที่</th>
              <th style={{textAlign:'center'}}>สถานะ</th>
              <th style={{width: '120px', textAlign:'center'}}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.item_id}>
                  <td>
                    {item.item_image ? (
                        <img 
                            src={`http://localhost:3000/uploads/${item.item_image}`} 
                            alt="รูปภาพ" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    ) : (
                        <div style={{width:'50px', height:'50px', background:'#f0f0f0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:'18px'}}>
                            📷
                        </div>
                    )}
                  </td>

                  <td style={{fontWeight:'bold', color:'#3498db'}}>{formatItemID(item.item_id)}</td>
                  <td style={{fontWeight:'600'}}>{item.item_name}</td>
                  <td style={{color:'#666'}}>{getCategoryName(item.category_id)}</td>
                  <td>{item.location_found}</td>
                  <td>{item.date_found ? new Date(item.date_found).toLocaleDateString('th-TH') : '-'}</td>
                  
                  <td style={{textAlign:'center'}}>
                    <span className={`badge ${getBadgeClass(item.status_id)}`}>
                        {getStatusText(item.status_id)}
                    </span>
                  </td>
                  
                  <td>
                    <div className="action-buttons" style={{justifyContent:'center'}}>
                      <Link to={`/items/${item.item_id}`} className="btn-icon view" title="ดูรายละเอียด">👁️</Link>
                      {userRole === 'admin' && (
                        <>
                          <button className="btn-icon edit" onClick={() => openEditModal(item)} title="แก้ไข">✏️</button>
                          <button className="btn-icon delete" onClick={() => handleDelete(item.item_id)} title="ลบรายการ">🗑️</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#999'}}>❌ ไม่พบข้อมูลที่ค้นหา</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd', background: currentPage === 1 ? '#eee' : 'white' }}
          >
            ◀️ ก่อนหน้า
          </button>
          
          <span style={{ fontWeight: 'bold', color: '#555' }}>
            หน้า {currentPage} / {totalPages}
          </span>

          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ddd', background: currentPage === totalPages ? '#eee' : 'white' }}
          >
            ถัดไป ▶️
          </button>
        </div>
      )}

      {/* Modal แก้ไขข้อมูล */}
      {editModal.show && (
        <div className="modal-overlay">
          <div className="modal-box form-modal">
            <h3>✏️ แก้ไขข้อมูลสิ่งของ</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>ชื่อสิ่งของ</label>
                <input type="text" required className="input-field" value={editForm.item_name} onChange={e => setEditForm({...editForm, item_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>หมวดหมู่</label>
                <select className="input-field" value={editForm.category_id} onChange={e => setEditForm({...editForm, category_id: e.target.value})} required>
                   <option value="">-- เลือกหมวดหมู่ --</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>สถานที่พบ/หาย</label>
                <input type="text" required className="input-field" value={editForm.location_found} onChange={e => setEditForm({...editForm, location_found: e.target.value})} />
              </div>
              <div className="form-group">
                <label>รายละเอียดเพิ่มเติม</label>
                <textarea className="input-field" rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-report-cancel" onClick={() => setEditModal({show:false, itemId:null})}>ยกเลิก</button>
                <button type="submit" className="btn-report-submit">บันทึกการแก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ItemsPage