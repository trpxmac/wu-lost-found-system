import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './AdminDashboard.css' 

function AdminDashboard() {
  const [stats, setStats] = useState({ pending: 0, waiting: 0, returned: 0, total: 0 })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // State สำหรับตัวกรอง (ค่าเริ่มต้น 'all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. ดึงตัวเลขสถิติ
        const resStats = await fetch('http://localhost:3000/api/admin/stats')
        const dataStats = await resStats.json()
        setStats(dataStats)

        // 2. ดึงรายการทั้งหมด
        const resItems = await fetch('http://localhost:3000/api/items')
        const dataItems = await resItems.json()
        if (Array.isArray(dataItems)) {
            // เรียงจากใหม่ไปเก่า
            dataItems.sort((a, b) => new Date(b.date_found) - new Date(a.date_found))
            setItems(dataItems)
        }

        setLoading(false)
      } catch (error) {
        console.error("Dashboard Error:", error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Logic การกรองข้อมูล
  const filteredItems = filterStatus === 'all' 
    ? items 
    : items.filter(item => item.status_id === filterStatus)

  // 1. ชื่อหัวข้อตาราง
  const getListTitle = () => {
    switch(filterStatus) {
      case '01': return '⚠️ รายการที่อยู่ระหว่างรอการตรวจสอบ (Pending Approval)';
      case '02': return '⏳ รายการที่ประกาศหาเจ้าของ / รอผู้มารับ (Waiting for Owner)';
      case '03': return '✅ รายการที่ส่งคืนเจ้าของเรียบร้อยแล้ว (Returned)';
      default: return '📦 สรุปรายการแจ้งของหายและของที่เก็บได้ทั้งหมด (All Items)';
    }
  }

  // 2. ฟังก์ชันเลือกสีธีม (ใช้กับหัวตารางและปุ่ม)
  const getThemeColor = () => {
    switch(filterStatus) {
        case '01': return '#e74c3c'; // สีแดง
        case '02': return '#f39c12'; // สีส้ม
        case '03': return '#2ecc71'; // สีเขียว
        default: return '#3498db';   // สีฟ้า (ค่าเริ่มต้น)
    }
  }

  // ข้อมูลสำหรับกราฟ
  const chartData = [
    { name: 'รอตรวจสอบ', value: Number(stats.pending), color: '#e74c3c' },
    { name: 'รอรับคืน', value: Number(stats.waiting), color: '#f39c12' },
    { name: 'คืนแล้ว', value: Number(stats.returned), color: '#2ecc71' },
  ]

  const formatItemID = (id) => `#${String(id).padStart(4, '0')}`

  if (loading) return <div style={{textAlign:'center', marginTop:50}}>⏳ กำลังโหลดข้อมูล...</div>

  return (
    <div className="dashboard-container">
      {/* 1. ชื่อแดชบอร์ด */}
      <h2>📊 สรุปภาพรวมสถิติและการติดตามสถานะสิ่งของ</h2>
      
      {/* ส่วนที่ 1: การ์ดตัวเลข & กราฟ */}
      <div className="top-section">
          <div className="stats-grid">
            
            <div 
                className="stat-card blue" 
                onClick={() => setFilterStatus('all')}
                style={{ cursor: 'pointer', transform: filterStatus === 'all' ? 'scale(1.05)' : 'scale(1)', transition: '0.2s', border: filterStatus === 'all' ? '2px solid #3498db' : 'none' }}
            >
                <h3>📦 ทั้งหมด</h3>
                <p className="stat-number">{stats.total}</p>
            </div>

            <div 
                className="stat-card red"
                onClick={() => setFilterStatus('01')}
                style={{ cursor: 'pointer', transform: filterStatus === '01' ? 'scale(1.05)' : 'scale(1)', transition: '0.2s', border: filterStatus === '01' ? '2px solid #e74c3c' : 'none' }}
            >
                <h3>⚠️ รออนุมัติ</h3>
                <p className="stat-number">{stats.pending}</p>
            </div>

            <div 
                className="stat-card orange"
                onClick={() => setFilterStatus('02')}
                style={{ cursor: 'pointer', transform: filterStatus === '02' ? 'scale(1.05)' : 'scale(1)', transition: '0.2s', border: filterStatus === '02' ? '2px solid #f39c12' : 'none' }}
            >
                <h3>⏳ รอรับคืน</h3>
                <p className="stat-number">{stats.waiting}</p>
            </div>

            <div 
                className="stat-card green"
                onClick={() => setFilterStatus('03')}
                style={{ cursor: 'pointer', transform: filterStatus === '03' ? 'scale(1.05)' : 'scale(1)', transition: '0.2s', border: filterStatus === '03' ? '2px solid #2ecc71' : 'none' }}
            >
                <h3>✅ คืนแล้ว</h3>
                <p className="stat-number">{stats.returned}</p>
            </div>
          </div>

          <div className="chart-box">
             <h3>📈 สัดส่วนสถานะการดำเนินการ</h3>
             <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* ส่วนที่ 2: ตารางรายการ */}
      <div className="recent-section">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
            {/* ชื่อหัวข้อตารางเปลี่ยนสีตามธีม */}
            <h3 style={{ color: getThemeColor(), transition: '0.3s' }}>
                {getListTitle()} ({filteredItems.length})
            </h3>
            
            {filterStatus !== 'all' && (
                <button 
                    onClick={() => setFilterStatus('all')}
                    style={{padding:'6px 15px', borderRadius:'20px', border:'none', background:'#95a5a6', color:'white', cursor:'pointer'}}
                >
                    🔄 แสดงทั้งหมด
                </button>
            )}
        </div>

        <div style={{overflowX: 'auto'}}>
            <table className="manage-table">
            <thead style={{borderBottom: 'none'}}>
                {/* 🔥 แก้ไขจุดสำคัญ: บังคับใส่สีพื้นหลัง (Background) ให้กับ tr หัวตาราง */}
                <tr style={{ backgroundColor: getThemeColor(), color: 'white', transition: 'background-color 0.3s ease' }}>
                    <th style={{padding:'12px', color:'white', textAlign:'left'}}>รหัส</th>
                    <th style={{padding:'12px', color:'white', textAlign:'left'}}>รายการ</th>
                    <th style={{padding:'12px', color:'white', textAlign:'left'}}>วันที่พบ</th>
                    <th style={{textAlign:'center', padding:'12px', color:'white'}}>สถานะ</th>
                    <th style={{textAlign:'center', padding:'12px', color:'white'}}>จัดการ</th>
                </tr>
            </thead>
            <tbody>
                {filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                    <tr key={item.item_id} style={{borderBottom: '1px solid #eee'}}>
                        <td style={{fontWeight:'bold', color: getThemeColor(), padding:'12px'}}>
                            {formatItemID(item.item_id)}
                        </td>
                        <td style={{padding:'12px'}}>{item.item_name}</td>
                        <td style={{padding:'12px'}}>{new Date(item.date_found).toLocaleDateString('th-TH')}</td>
                        <td style={{textAlign:'center', padding:'12px'}}>
                            {item.status_id === '01' && <span className="badge-dash badge-red">รอตรวจสอบ</span>}
                            {item.status_id === '02' && <span className="badge-dash badge-orange">รอรับคืน</span>}
                            {item.status_id === '03' && <span className="badge-dash badge-green">คืนแล้ว</span>}
                        </td>
                        <td style={{textAlign:'center', padding:'12px'}}>
                            <Link 
                                to={`/items/${item.item_id}`} 
                                style={{
                                    textDecoration:'none', 
                                    background: getThemeColor(),
                                    color:'white', 
                                    padding:'6px 12px', 
                                    borderRadius:'4px', 
                                    fontSize:'0.85rem',
                                    transition: '0.3s',
                                    display: 'inline-block'
                                }}
                            >
                                🔍 ดู
                            </Link>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#999'}}>
                            ❌ ไม่พบรายการในสถานะนี้
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard