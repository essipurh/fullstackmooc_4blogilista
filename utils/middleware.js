const logger = require('./logger')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = ( error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'error.malformaddedId', message:'Malformatted id.' })
  } else if (error.name ==='ValidationError') {
    return response.status(400).json({ error: error.errors })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'MongoServerError.keyError', message: 'Username must be unique.'})
  } else if (error.name === 'TypeError') {    
    return response.status(400).json({ error: 'TypeError.nullId', message: 'User not found.'})
  } else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: 'Invalid token.' })
  }
  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      request.token = authorization.replace('Bearer ', '')
    } 
  next()
}

const userExtractor = async (request, response, next) => {
  if (!request.token) {
    return response.status(401).json({ error: 'Unauthorized.' })
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken) {
    return response.status(400).json({ error: 'Invalid token.' })
  }
  const userWanted = await User.findById(decodedToken.id)
  if (!userWanted) {
    return response.status(401).json({ error: 'Unauthorized. User not found.' })
  }
  request.user = userWanted
  next()
}

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}