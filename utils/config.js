require('dotenv').config()

const { PORT, NODE_ENV, TOKEN } = process.env
let { MONGODB_URI } = process.env

if (NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = { MONGODB_URI, PORT, TOKEN }