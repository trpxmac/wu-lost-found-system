// src/data/mockData.js

// ตาราง 4.1 ผู้ใช้งาน (Users)
export const users = [
  { user_id: 'auth001', user_name: 'Admin User', email: 'admin@wu.ac.th', role: 'admin', created_at: '2025-01-01 09:00:00' },
  { user_id: 'auth002', user_name: 'Somchai Student', email: 'student@wu.ac.th', role: 'user', created_at: '2025-01-02 10:30:00' }
]

// ตาราง 4.3 หมวดหมู่ (Categories)
export const categories = [
  { category_id: '01', category_name: 'ของใช้ส่วนตัว' },
  { category_id: '02', category_name: 'อุปกรณ์อิเล็กทรอนิกส์' },
  { category_id: '03', category_name: 'เอกสาร/บัตร' },
  { category_id: '04', category_name: 'เครื่องแต่งกาย' }
]

// ตาราง 4.4 สถานะ (Statuses) - ปรับปรุงใหม่ตามที่ขอ
export const statuses = [
  { status_id: '01', status_name: 'แจ้งแล้ว รอการอนุมัติ' },
  { status_id: '02', status_name: 'อนุมัติแล้ว (รอผู้มารับ)' },
  { status_id: '03', status_name: 'รับของคืนแล้ว' }
]

// ตาราง 4.2 สิ่งของ (Items)
export const items = [
  {
    item_id: 1,
    item_name: 'กระเป๋าสตางค์',
    description: 'กระเป๋าสตางค์สีดำ ใส่บัตรนักศึกษา',
    location_found: 'อาคารเรียนรวม',
    date_found: '2025-01-10',
    image_url: 'https://placehold.co/150',
    category_id: '01',
    created_by: 'auth002',
    created_at: '2025-01-10 08:00:00',
    approved: true, 
    status_id: '02' // สถานะ: อนุมัติแล้ว (รอเจ้าของมารับ)
  },
  {
    item_id: 2,
    item_name: 'โทรศัพท์มือถือ',
    description: 'iPhone 13 สีขาว เคสใส',
    location_found: 'ห้องสมุด',
    date_found: '2025-01-12',
    image_url: 'https://placehold.co/150',
    category_id: '02',
    created_by: 'auth002',
    created_at: '2025-01-12 09:30:00',
    approved: true, 
    status_id: '03' // สถานะ: รับของคืนแล้ว
  },
  {
    item_id: 3,
    item_name: 'กุญแจรถมอเตอร์ไซค์',
    description: 'กุญแจรถ Honda มีพวงกุญแจรูปหมี',
    location_found: 'โรงอาหาร 2',
    date_found: '2025-01-15',
    image_url: 'https://placehold.co/150',
    category_id: '01',
    created_by: 'auth002',
    created_at: '2025-01-15 12:00:00',
    approved: false, 
    status_id: '01' // สถานะ: รอการอนุมัติ (เพิ่งแจ้งเข้ามา)
  }
]

// ตาราง 4.5 การรับคืนสิ่งของ (Claims)
export const claims = [
  {
    claim_id: 1,
    item_id: 2, // เชื่อมกับโทรศัพท์มือถือ (ที่คืนแล้ว)
    receiver_name: 'นายสมศักดิ์ มั่นใจ',
    claim_date: '2025-01-13 14:00:00',
    picture: 'evidence.jpg',
    remark: 'มารับด้วยตัวเอง'
  }
]