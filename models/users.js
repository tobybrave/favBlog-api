const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    uniqueCaseInsensitive: true,
    minlength: 3,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }]
})

mongoose.plugin(uniqueValidator)

mongoose.set('toJSON', {
  transform: (doc, resultObjectId) => {
    resultObjectId.id = resultObjectId._id
    delete resultObjectId._id
    delete resultObjectId.__v
    delete resultObjectId.passwordHash
  }
})

module.exports = mongoose.model('User', userSchema)