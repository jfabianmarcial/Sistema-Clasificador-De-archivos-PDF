import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  topicName: { type: String, default: 'Sin clasificar' },
  keywords: [{ type: String }],
  path: { type: String, required: true },
  size: { type: Number },
}, { timestamps: true })

export default mongoose.model('Document', documentSchema)