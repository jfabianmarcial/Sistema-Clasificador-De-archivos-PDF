import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newUser, setNewUser] = useState({ username: '', password: '' })
  const [editingUser, setEditingUser] = useState(null)
  const [success, setSuccess] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/admin/users')
      setUsers(data)
    } catch {
      setError('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/admin/users', newUser)
      setUsers(prev => [...prev, data])
      setNewUser({ username: '', password: '' })
      setSuccess('Usuario creado correctamente')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario y todos sus documentos?')) return
    setError('')
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u._id !== id))
      setSuccess('Usuario eliminado')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar usuario')
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const { data } = await api.put(`/admin/users/${editingUser._id}`, {
        username: editingUser.username,
        password: editingUser.password || undefined,
      })
      setUsers(prev => prev.map(u => u._id === data._id ? data : u))
      setEditingUser(null)
      setSuccess('Usuario actualizado')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar usuario')
    }
  }

  const handleDeleteTopic = async (userId, topicId) => {
    if (!confirm('¿Eliminar esta temática aunque tenga documentos?')) return
    setError('')
    try {
      await api.delete(`/admin/users/${userId}/topics/${topicId}`)
      setSuccess('Temática eliminada')
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar temática')
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>DocuFlow <span>Admin</span></h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="admin-username">{user.username}</span>
          <button className="btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn-sm btn-outline" onClick={logout}>Salir</button>
        </div>
      </div>

      {error && <p className="error" style={{ marginBottom: '1rem' }}>{error}</p>}
      {success && <p className="success" style={{ marginBottom: '1rem' }}>{success}</p>}

      {/* Crear usuario */}
      <div className="admin-card">
        <h2>Crear usuario</h2>
        <form className="admin-form" onSubmit={handleCreate}>
          <input
            placeholder="Nombre de usuario"
            value={newUser.username}
            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={newUser.password}
            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <button type="submit" className="btn-sm">Crear</button>
        </form>
      </div>

      {/* Lista de usuarios */}
      <div className="admin-card">
        <h2>Usuarios registrados</h2>
        {loading && <p className="loading">Cargando...</p>}
        <ul className="user-list">
          {users.map(u => (
            <li key={u._id} className="user-item">
              {editingUser?._id === u._id ? (
                /* Formulario de edición inline */
                <form className="edit-form" onSubmit={handleEdit}>
                  <input
                    value={editingUser.username}
                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                    placeholder="Nuevo nombre"
                    required
                  />
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="Nueva contraseña (opcional)"
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="submit" className="btn-sm">Guardar</button>
                    <button type="button" className="btn-sm btn-outline" onClick={() => setEditingUser(null)}>Cancelar</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="user-info">
                    <span className="user-name">{u.username}</span>
                    <span className="user-role">{u.role}</span>
                  </div>
                  <div className="user-actions">
                    <button className="btn-sm" onClick={() => setEditingUser({ ...u, password: '' })}>
                      Editar
                    </button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(u._id)}>
                      Eliminar
                    </button>
                  </div>
                </>
              )}

              {/* Temáticas del usuario */}
              {u.topics && u.topics.length > 0 && (
                <div className="user-topics">
                  <p className="topics-label">Temáticas:</p>
                  <ul className="topics-mini">
                    {u.topics.map(t => (
                      <li key={t._id}>
                        <span>{t.name}</span>
                        <button
                          className="btn-xs btn-danger"
                          onClick={() => handleDeleteTopic(u._id, t._id)}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
        {users.length === 0 && !loading && (
          <p className="empty">No hay usuarios registrados</p>
        )}
      </div>
    </div>
  )
}   