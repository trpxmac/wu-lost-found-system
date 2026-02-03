import { useState, useEffect } from 'react'
import Swal from 'sweetalert2' 
import './ManageCommon.css' // ✅ เรียกใช้ CSS เพื่อให้ธีมเหมือนหน้าอื่น

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // State สำหรับ Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10 

  useEffect(() => {
    fetchUsers()
  }, [])

  // Reset หน้าเมื่อค้นหา
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const fetchUsers = () => {
    fetch('http://localhost:3000/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  // ฟังก์ชันลบผู้ใช้
  const handleDelete = (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "หากลบแล้ว ประวัติการแจ้งของหายของคนนี้จะหายไปด้วย!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ลบเลย',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/users/${id}`, { method: 'DELETE' })
          const resultData = await res.json()
          
          if (resultData.success) {
            Swal.fire('ลบสำเร็จ!', 'ผู้ใช้งานถูกลบออกจากระบบแล้ว', 'success')
            setUsers(users.filter(u => u.user_id !== id))
          } else {
            Swal.fire('ลบไม่สำเร็จ', resultData.message, 'error')
          }
        } catch (err) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  // ฟังก์ชันเปลี่ยน Role
  const handleRoleChange = (id, newRole) => {
    Swal.fire({
      title: 'ยืนยันเปลี่ยนสิทธิ์?',
      text: `คุณต้องการเปลี่ยนสิทธิ์ผู้ใช้นี้เป็น "${newRole}" ใช่ไหม?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3498db',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'ใช่, ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`http://localhost:3000/api/users/${id}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
          })
          if (res.ok) {
            Swal.fire('เรียบร้อย!', `เปลี่ยนสิทธิ์เป็น ${newRole} สำเร็จ`, 'success')
            setUsers(users.map(u => u.user_id === id ? { ...u, role: newRole } : u))
          } else {
            Swal.fire('ผิดพลาด', 'ไม่สามารถเปลี่ยนสิทธิ์ได้', 'error')
          }
        } catch (err) {
          Swal.fire('Error', 'เชื่อมต่อ Server ไม่ได้', 'error')
        }
      }
    })
  }

  // Logic ค้นหา & Pagination
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) || 
    user.fullname.toLowerCase().includes(search.toLowerCase())
  )

  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>กำลังโหลดรายชื่อ...</div>

  return (
    // ✅ ใช้ Class "manage-container" แทน Style เดิม
    <div className="manage-container">
      
      <h2>👥 จัดการผู้ใช้งาน ({filteredUsers.length})</h2>

      {/* กล่องค้นหา */}
      <div className="manage-form-box" style={{padding:'15px'}}>
        <input 
          type="text" 
          placeholder="🔍 ค้นหา Username หรือ ชื่อ-นามสกุล..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {/* ✅ ตาราง: ใช้ Class "manage-table" (สำคัญมาก! สีหัวตารางจะมาเอง) */}
      <div style={{ overflowX: 'auto' }}>
        <table className="manage-table">
          <thead>
            {/* ❌ ลบ style={{ background: '#f8f9fa' }} ออกแล้ว */}
            <tr>
              <th style={{ width: '60px' }}>ID</th>
              <th>Username</th>
              <th>ชื่อ-นามสกุล</th>
              <th>สิทธิ์ (Role)</th>
              <th style={{ textAlign: 'center' }}>เปลี่ยนสิทธิ์</th>
              <th style={{ textAlign: 'center', width: '80px' }}>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.user_id}>
                  <td style={{ color: '#7f8c8d' }}>#{user.user_id}</td>
                  <td style={{ fontWeight: 'bold' }}>{user.username}</td>
                  <td>{user.fullname}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px', 
                      borderRadius: '15px', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: user.role === 'admin' ? '#e74c3c' : '#2ecc71',
                      color: 'white',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {user.role === 'user' ? (
                      <button 
                        onClick={() => handleRoleChange(user.user_id, 'admin')}
                        className="btn"
                        style={{ padding: '5px 10px', background: '#3498db', fontSize: '0.8rem', color: 'white' }}
                      >
                        ⬆️ ตั้งเป็น Admin
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRoleChange(user.user_id, 'user')}
                        className="btn"
                        style={{ padding: '5px 10px', background: '#95a5a6', fontSize: '0.8rem', color: 'white' }}
                      >
                        ⬇️ ปลดเป็น User
                      </button>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{display:'flex', justifyContent:'center'}}>
                        {/* ใช้ Class ปุ่มลบแบบไอคอน */}
                        <button className="btn-icon delete" onClick={() => handleDelete(user.user_id)} title="ลบผู้ใช้">
                        🗑️
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  ❌ ไม่พบชื่อที่ค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

    </div>
  )
}

export default ManageUsers