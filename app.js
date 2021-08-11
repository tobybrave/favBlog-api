require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const requestLogger = require('morgan')
const config = require('./utils/config')
const blogController = require('./controllers/blog')
const usersController = require('./controllers/users')
const loginController = require('./controllers/login')
const logger = require('./utils/logger')
const {
  invalidEndpoint,
  errorHandler,
  tokenExtractor
} = require('./utils/middleware')

const app = express()

logger.info('connecting to database')
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then((result) => logger.info('connected to database'))
  .catch((error) => logger.error('could not connect to database ', error))

app.use(cors())
app.use(express.json())
app.use(tokenExtractor)
app.use(requestLogger('dev'))
app.use('/api/login', loginController)
app.use('/api/blogs', blogController)
app.use('/api/users', usersController)
app.use(invalidEndpoint)
app.use(errorHandler)

module.exports = app