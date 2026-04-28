import mongoose from 'mongoose'
import User from '../models/User.model.js'

const initAdmin = async () => {
  const exists = await User.findOne({ username: 'admin' })
  if (!exists) {
    await User.create({ username: 'admin', password: 'admin123', role: 'admin' })
    console.log('Admin creado automáticamente — user: admin / pass: admin123')
  }
}

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB conectado')
    await initAdmin()
  } catch (error) {
    console.error('Error conectando MongoDB:', error.message)
    process.exit(1)
  }
}