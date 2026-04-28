import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import Document from '../models/Document.model.js'
import Topic from '../models/Topic.model.js'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

// Cargar modelo de embeddings
let embedder = null
const getEmbedder = async () => {
  if (!embedder) {
    console.log('Cargando modelo de embeddings...')
    const { pipeline } = await import('@xenova/transformers')
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    console.log('Modelo cargado')
  }
  return embedder
}

// Calcular similitud coseno entre dos vectores
const cosineSimilarity = (a, b) => {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Generar embedding de un texto
const getEmbedding = async (text) => {
  const model = await getEmbedder()
  const output = await model(text, { pooling: 'mean', normalize: true })
  return Array.from(output.data)
}

// Clasificar documento contra temáticas del usuario
const classifyDocument = async (text, userId) => {
  try {
    const subtopics = await Topic.find({ userId, parentId: { $ne: null } })
    const topics = await Topic.find({ userId, parentId: null })
    const allTopics = [...subtopics, ...topics]

    if (allTopics.length === 0) return null

    const textLower = text.toLowerCase()

    // Tomar muestra representativa del PDF
    const words = text.split(' ').filter(w => w.length > 3)
    const mid = Math.floor(words.length / 4)
    const shortText = words.slice(mid, mid + 200).join(' ')
    const docVector = await getEmbedding(shortText)

    let bestMatch = null
    let bestScore = 0
    const THRESHOLD = 0.35

    for (const topic of allTopics) {
      const topicVector = await getEmbedding(topic.name)
      const score = cosineSimilarity(docVector, topicVector)
      console.log(`Embeddings "${topic.name}": ${score.toFixed(3)}`)
      if (score > bestScore) {
        bestScore = score
        bestMatch = topic
      }
    }

    // Si embeddings encontró buena coincidencia
    if (bestScore >= THRESHOLD) {
      console.log(`✓ Embeddings clasificó: "${bestMatch.name}" (${bestScore.toFixed(3)})`)
      return bestMatch
    }

    // Respaldo: búsqueda de palabras clave en el texto
    console.log('Embeddings no suficiente, usando búsqueda de palabras...')
    for (const topic of allTopics) {
      const topicWords = topic.name.toLowerCase().split(' ')
      const matches = topicWords.filter(w => w.length > 3 && textLower.includes(w))
      if (matches.length > 0) {
        console.log(`✓ Palabras clave clasificó: "${topic.name}" (coincidió: ${matches.join(', ')})`)
        return topic
      }
    }

    console.log('Sin clasificar')
    return null
  } catch (error) {
    console.error('Error clasificando:', error.message)
    return null
  }
}

export const getDocuments = async (req, res) => {
  try {
    const { topicId } = req.query
    const filter = { userId: req.user._id }
    if (topicId) filter.topicId = topicId
    const documents = await Document.find(filter).sort({ createdAt: -1 })
    res.json(documents)
  } catch {
    res.status(500).json({ message: 'Error al obtener documentos' })
  }
}

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' })

    const buffer = fs.readFileSync(req.file.path)
    const data = await pdfParse(buffer)
    const text = data.text

    const words = text.toLowerCase().match(/[a-záéíóúñ]{5,}/g) || []
    const keywords = [...new Set(words)].slice(0, 20)

    const matchedTopic = await classifyDocument(text, req.user._id)

    const document = await Document.create({
      name: req.file.originalname,
      userId: req.user._id,
      topicId: matchedTopic?._id || null,
      topicName: matchedTopic?.name || 'Sin clasificar',
      keywords,
      path: req.file.path,
      size: req.file.size,
    })

    res.status(201).json(document)
  } catch (error) {
    console.error('ERROR UPLOAD:', error)
    res.status(500).json({ message: 'Error al subir documento' })
  }
}

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id })
    if (!document) return res.status(404).json({ message: 'Documento no encontrado' })

    res.download(path.resolve(document.path), document.name)
  } catch {
    res.status(500).json({ message: 'Error al descargar documento' })
  }
}

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id })
    if (!document) return res.status(404).json({ message: 'Documento no encontrado' })

    if (fs.existsSync(document.path)) fs.unlinkSync(document.path)
    await document.deleteOne()
    res.json({ message: 'Documento eliminado' })
  } catch {
    res.status(500).json({ message: 'Error al eliminar documento' })
  }
}