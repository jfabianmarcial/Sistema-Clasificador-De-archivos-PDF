import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TopicTree from './components/topics/TopicTree'
import UploadDocument from './components/documents/UploadDocument'
import DocumentList from './components/documents/DocumentList'
import AdminPage from './pages/AdminPage'

function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#4f46e5' }}>DocuFlow</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Hola, {user.username}</span>
          <button onClick={logout} style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.85rem', marginTop: 0 }}>
            Salir
          </button>
        </div>
      </div>
      <TopicTree />
      <div style={{ marginTop: '1.5rem' }}>
        <UploadDocument />
        <DocumentList />
      </div>
    </div>
  )
}


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}