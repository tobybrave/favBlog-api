const userRouter = require('express').Router()
const bcrypt = require('bcryptjs')
const User = require('../models/users')

userRouter.get('/', async (request, response) => {
  const allUsers = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1
  })
  const result = allUsers.length
    ? allUsers
    : 'No users yet'
  response.json(result)
})

userRouter.post('/', async (request, response) => {
  const { username, password, name } = request.body
  if (!(username && password)) {
    return response.status(400).json({
      error: 'Invalid username or password'
    })
  }
  if (password.length < 3) {
    return response.status(400).json({
      error: 'Password should be at least 3 characters long'
    })
  }
  const saltRound = 10
  const passwordHash = await bcrypt.hash(password, saltRound)
  const users = new User({
    username, passwordHash, name
  })
  const savedUser = await users.save()
  return response.status(201).json(savedUser.toJSON())
})

module.exports = userRouter