import User from '../models/User.model.js'
import Topic from '../models/Topic.model.js'
import Document from '../models/Document.model.js'
import fs from 'fs'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password')
    const usersWithTopics = await Promise.all(
      users.map(async (u) => {
        const topics = await Topic.find({ userId: u._id, parentId: null })
        return { ...u.toObject(), topics }
      })
    )
    res.json(usersWithTopics)
  } catch {
    res.status(500).json({ message: 'Error al obtener usuarios' })
  }
}

export const createUser = async (req, res) => {
  try {
    const { username, password } = req.body
    const exists = await User.findOne({ username })
    if (exists) return res.status(400).json({ message: 'El usuario ya existe' })
    const user = await User.create({ username, password })
    res.status(201).json({ _id: user._id, username: user.username, role: user.role })
  } catch {
    res.status(500).json({ message: 'Error al crear usuario' })
  }
}

export const updateUser = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    if (username) user.username = username
    if (password) user.password = password
    await user.save()

    res.json({ _id: user._id, username: user.username, role: user.role })
  } catch {
    res.status(500).json({ message: 'Error al actualizar usuario' })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    // Eliminar documentos físicos
    const docs = await Document.find({ userId: user._id })
    docs.forEach(doc => { if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path) })

    await Document.deleteMany({ userId: user._id })
    await Topic.deleteMany({ userId: user._id })
    await user.deleteOne()

    res.json({ message: 'Usuario eliminado' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar usuario' })
  }
}

export const deleteUserTopic = async (req, res) => {
  try {
    const { userId, topicId } = req.params
    const topic = await Topic.findOne({ _id: topicId, userId })
    if (!topic) return res.status(404).json({ message: 'Temática no encontrada' })

    // Mover documentos a General
    await Document.updateMany(
      { topicId },
      { topicId: null, topicName: 'General' }
    )

    // Eliminar subtemáticas
    const subtopics = await Topic.find({ parentId: topicId })
    for (const sub of subtopics) {
      await Document.updateMany({ topicId: sub._id }, { topicId: null, topicName: 'General' })
      await sub.deleteOne()
    }

    await topic.deleteOne()
    res.json({ message: 'Temática eliminada' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar temática' })
  }
}