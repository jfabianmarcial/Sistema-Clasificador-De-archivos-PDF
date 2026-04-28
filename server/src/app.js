import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import topicRoutes from './routes/topic.routes.js'
import documentRoutes from './routes/document.routes.js'
import adminRoutes from './routes/admin.routes.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://sistema-clasificador-de-archivos-pd.vercel.app'
  ]
}))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${process.env.NODE_ID || 'local'}] ${req.method} ${req.path}`)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/topics', topicRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    node: process.env.NODE_ID || 'local',
    timestamp: new Date().toISOString()
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))