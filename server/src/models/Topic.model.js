import mongoose from 'mongoose'

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
}, { timestamps: true })

export default mongoose.model('Topic', topicSchema)