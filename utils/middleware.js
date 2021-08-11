const invalidEndpoint = (request, response) => response.status(404).end()

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    response.status(400).json({
      error: 'malformed id'
    })
  } else if (error.name === 'ValidationError') {
    response.status(400).json({
      error: error.message
    })
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).json({
      error: 'Invalid token'
    })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  request.token = null
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer')) {
    request.token = authorization.substring(7)
  }
  next()
}

module.exports = { invalidEndpoint, errorHandler, tokenExtractor }