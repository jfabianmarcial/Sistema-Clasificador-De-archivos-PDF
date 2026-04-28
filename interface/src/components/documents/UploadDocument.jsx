import { useState } from 'react'
import { useDocuments } from '../../hooks/useDocuments'

export default function UploadDocument({ onUploaded }) {
  const { uploadDocument } = useDocuments()
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected && selected.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF')
      setFile(null)
      return
    }
    setError('')
    setFile(selected)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return setError('Selecciona un archivo PDF')
    setUploading(true)
    setError('')
    setSuccess('')
    try {
      const doc = await uploadDocument(file, setProgress)
      setSuccess(`"${doc.name}" subido y clasificado en: ${doc.topicName || 'General'}`)
      setFile(null)
      setProgress(0)
      if (onUploaded) onUploaded(doc)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el documento')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-card">
      <h3>Subir documento</h3>
      <form onSubmit={handleUpload}>
        <label className="file-label">
          {file ? file.name : 'Seleccionar PDF...'}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        {uploading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span>{progress}%</span>
          </div>
        )}

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <button type="submit" disabled={uploading || !file}>
          {uploading ? 'Subiendo...' : 'Subir PDF'}
        </button>
      </form>
    </div>
  )
}