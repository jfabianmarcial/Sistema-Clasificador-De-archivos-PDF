import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  getTopics,
  createTopic,
  deleteTopic,
} from '../controllers/topic.controller.js'

const router = Router()

router.use(protect)
router.get('/', getTopics)
router.post('/', createTopic)
router.delete('/:id', deleteTopic)

export default router