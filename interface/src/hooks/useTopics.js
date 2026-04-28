import { useState, useEffect } from 'react'
import api from '../services/api'

export function useTopics() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/topics')
      setTopics(data)
    } catch {
      setError('Error al cargar temáticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTopics() }, [])

  const addTopic = async (name) => {
    const { data } = await api.post('/topics', { name, parentId: null })
    setTopics(prev => [...prev, data])
    return data
  }

  const addSubtopic = async (name, parentId) => {
    const { data } = await api.post('/topics', { name, parentId })
    setTopics(prev => [...prev, data])
    return data
  }

  const deleteTopic = async (id) => {
    await api.delete(`/topics/${id}`)
    setTopics(prev => prev.filter(t => t._id !== id))
  }

  return { topics, loading, error, addTopic, addSubtopic, deleteTopic, refetch: fetchTopics }
}