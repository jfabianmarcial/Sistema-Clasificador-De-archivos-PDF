import { useState } from 'react'
import { useDocuments } from '../../hooks/useDocuments'

export default function DocumentList() {
  const { documents, loading, error, downloadDocument, deleteDocument } = useDocuments()
  const [deleting, setDeleting] = useState(null)

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    setDeleting(id)
    try {
      await deleteDocument(id)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <p className="loading">Cargando documentos...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div className="doc-list">
      <h3>Mis documentos</h3>
      {documents.length === 0 && (
        <p className="empty">No hay documentos aún. ¡Sube el primero!</p>
      )}
      <ul>
        {documents.map(doc => (
          <li key={doc._id} className="doc-item">
            <div className="doc-info">
              <span className="doc-name">📄 {doc.name}</span>
              <span className="doc-topic">{doc.topicName || 'General'}</span>
            </div>
            <div className="doc-actions">
              <button
                className="btn-download"
                onClick={() => downloadDocument(doc._id, doc.name)}
              >
                ↓ Descargar
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(doc._id)}
                disabled={deleting === doc._id}
              >
                {deleting === doc._id ? '...' : '✕'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}