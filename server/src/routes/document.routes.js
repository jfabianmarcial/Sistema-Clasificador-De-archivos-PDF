import { Router } from 'express'
import multer from 'multer'
import { protect } from '../middleware/auth.middleware.js'
import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../controllers/document.controller.js'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
})
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true)
  else cb(new Error('Solo se permiten PDFs'))
}})

const router = Router()
router.use(protect)

router.get('/', getDocuments)
router.post('/upload', upload.single('file'), uploadDocument)
router.get('/:id/download', downloadDocument)
router.delete('/:id', deleteDocument)

export default router