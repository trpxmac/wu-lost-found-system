import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css' // ✅ อย่าลืมบรรทัดนี้ (ถ้ายังไม่มีไฟล์ App.css ให้สร้างไว้คู่กับ App.jsx)

// Components
import Sidebar from './components/Sidebar.jsx'

// User Pages
import HomePage from './pages/auth/HomePage.jsx' 
import ItemsPage from './pages/ItemsPage.jsx'
import ItemDetailPage from './pages/ItemDetailPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import MyHistoryPage from './pages/MyHistoryPage.jsx'
import ProfilePage from './pages/auth/ProfilePage.jsx' 
import NotFoundPage from './pages/NotFoundPage.jsx'

// Auth Pages
import RegisterPage from './pages/auth/RegisterPage.jsx'

// Admin Pages
import AdminApprove from './pages/admin/AdminApprove.jsx'
import AdminClaim from './pages/admin/AdminClaim.jsx'
import ManageCategories from './pages/admin/ManageCategories.jsx'
import ManageStatuses from './pages/admin/ManageStatuses.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import EditItem from './pages/admin/EditItem.jsx'

function App() {
  const [role, setRole] = useState('guest')

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setRole(user.role || 'guest')
      } catch (error) {
        console.error("Error parsing user data", error)
        setRole('guest')
      }
    }
  }, [])

  const handleLogin = (user) => {
    setRole(user.role)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const handleLogout = () => {
    setRole('guest')
    localStorage.removeItem('currentUser')
    window.location.href = '/' 
  }

  const isGuest = role === 'guest';

  return (
    <Router>
      {/* ✅ เปลี่ยน style เป็น className เพื่อให้ Responsive */}
      <div className="app-layout"> 
        
        {!isGuest && <Sidebar role={role} onLogout={handleLogout} />}

        <div className={`main-content ${isGuest ? 'guest-view' : ''}`}>
          <Routes>
            {/* หน้าหลัก */}
            <Route path="/" element={<HomePage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* User Routes */}
            <Route path="/items" element={<ItemsPage userRole={role} />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/items/edit/:id" element={<EditItem />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/my-history" element={<MyHistoryPage role={role} />} />
            <Route path="/profile" element={!isGuest ? <ProfilePage /> : <Navigate to="/" />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
            <Route path="/admin/users" element={role === 'admin' ? <ManageUsers /> : <Navigate to="/" />} />
            <Route path="/admin/approve" element={role === 'admin' ? <AdminApprove /> : <Navigate to="/" />} />
            <Route path="/admin/claim" element={role === 'admin' ? <AdminClaim /> : <Navigate to="/" />} />
            <Route path="/admin/categories" element={role === 'admin' ? <ManageCategories /> : <Navigate to="/" />} />
            <Route path="/admin/statuses" element={role === 'admin' ? <ManageStatuses /> : <Navigate to="/" />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App