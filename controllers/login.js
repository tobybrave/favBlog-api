const loginRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/users')
const config = require('../utils/config')
const logger = require('../utils/logger')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  if (!(username && password)) {
    return response.status(400).json({
      error: 'Invalid username or password'
    })
  }

  const user = await User.findOne({ username })
  const isPasswordCorrect = !user
    ? false
    : await bcrypt.compare(password, user.passwordHash)
  if (!(isPasswordCorrect && user)) {
    return response.status(400).json({
      error: 'Username or password is incorrect'
    })
  }
  const credentialsForToken = {
    username: user.username,
    id: user._id
  }
  const token = jwt.sign(credentialsForToken, config.TOKEN)
  return response.json({token, name: user.name})
})

module.exports = loginRouter