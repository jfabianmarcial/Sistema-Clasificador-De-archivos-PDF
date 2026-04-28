import { useState, useEffect } from 'react'
import api from '../services/api'

export function useDocuments(topicId = null) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = topicId ? { topicId } : {}
      const { data } = await api.get('/documents', { params })
      setDocuments(data)
    } catch {
      setError('Error al cargar documentos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDocuments() }, [topicId])

  const uploadDocument = async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
    setDocuments(prev => [...prev, data])
    return data
  }

  const downloadDocument = async (id, filename) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const deleteDocument = async (id) => {
    await api.delete(`/documents/${id}`)
    setDocuments(prev => prev.filter(d => d._id !== id))
  }

  return { documents, loading, error, uploadDocument, downloadDocument, deleteDocument, refetch: fetchDocuments }
}