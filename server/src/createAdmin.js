import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

await mongoose.connect(process.env.MONGO_URI)

const hash = await bcrypt.hash('admin123', 10)
console.log('Hash generado:', hash)

await mongoose.connection.collection('users').updateOne(
  { username: 'admin' },
  { $set: { password: hash, role: 'admin' } }
)

console.log('Admin actualizado correctamente')
await mongoose.disconnect()