import Topic from '../models/Topic.model.js'
import Document from '../models/Document.model.js'

export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find({ userId: req.user._id })
    res.json(topics)
  } catch {
    res.status(500).json({ message: 'Error al obtener temáticas' })
  }
}

export const createTopic = async (req, res) => {
  try {
    const { name, parentId } = req.body
    if (!name) return res.status(400).json({ message: 'Nombre requerido' })

    // Validar máximo 2 niveles
    if (parentId) {
      const parent = await Topic.findById(parentId)
      if (!parent) return res.status(404).json({ message: 'Temática padre no encontrada' })
      if (parent.parentId) return res.status(400).json({ message: 'Solo se permiten 2 niveles de temáticas' })
    }

    const topic = await Topic.create({ name, userId: req.user._id, parentId: parentId || null })
    res.status(201).json(topic)
  } catch {
    res.status(500).json({ message: 'Error al crear temática' })
  }
}

export const deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id })
    if (!topic) return res.status(404).json({ message: 'Temática no encontrada' })

    // Verificar que no tenga documentos
    const hasDocs = await Document.findOne({ topicId: topic._id })
    if (hasDocs) return res.status(400).json({ message: 'La temática tiene documentos, elimínalos primero' })

    // Verificar que no tenga subtemáticas
    const hasChildren = await Topic.findOne({ parentId: topic._id })
    if (hasChildren) return res.status(400).json({ message: 'Elimina las subtemáticas primero' })

    await topic.deleteOne()
    res.json({ message: 'Temática eliminada' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar temática' })
  }
}