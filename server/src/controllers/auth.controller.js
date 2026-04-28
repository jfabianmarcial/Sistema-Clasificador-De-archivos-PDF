import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

export const register = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ message: 'Usuario y contraseña requeridos' })

    const exists = await User.findOne({ username })
    if (exists)
      return res.status(400).json({ message: 'El usuario ya existe' })

    const user = await User.create({ username, password })
    res.status(201).json({
      token: generateToken(user._id),
      user: { _id: user._id, username: user.username, role: user.role },
    })
  } catch (error) {
    console.error('ERROR REGISTER:', error)
    res.status(500).json({ message: 'Error al registrar usuario' })
  }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' })

    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, username: user.username, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' })
  }
}