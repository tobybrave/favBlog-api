const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (doc, resultObjectId) => {
    resultObjectId.id = resultObjectId._id
    delete resultObjectId._id
    delete resultObjectId.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)