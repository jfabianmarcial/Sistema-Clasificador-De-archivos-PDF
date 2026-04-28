import { Router } from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  deleteUserTopic,
} from '../controllers/admin.controller.js'

const router = Router()
router.use(protect, adminOnly)

router.get('/users', getUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)
router.delete('/users/:userId/topics/:topicId', deleteUserTopic)

export default router