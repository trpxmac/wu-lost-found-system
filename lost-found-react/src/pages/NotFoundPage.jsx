import { Link, useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '80vh',
      textAlign: 'center',
      color: '#2c3e50'
    }}>
      <div style={{ fontSize: '8rem', fontWeight: 'bold', color: '#e74c3c' }}>
        404
      </div>
      
      <h2 style={{ fontSize: '2rem', margin: '0 0 20px 0' }}>
        อุ๊ปส์! ไม่พบหน้าที่คุณต้องการ
      </h2>
      
      <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '30px' }}>
        หน้านี้อาจถูกลบไปแล้ว หรือคุณอาจจะพิมพ์ URL ผิด
      </p>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 25px',
            fontSize: '1rem',
            border: '2px solid #3498db',
            background: 'white',
            color: '#3498db',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          &larr; ย้อนกลับ
        </button>

        <Link 
          to="/" 
          style={{
            padding: '10px 25px',
            fontSize: '1rem',
            background: '#3498db',
            color: 'white',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: 'bold',
            border: '2px solid #3498db'
          }}
        >
          🏠 กลับหน้าแรก
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage