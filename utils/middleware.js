const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = ( error, request, response, next) => {
  console.log('here')
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'error.malformaddedId', message:'Malformatted id.' })
  } else if (error.name ==='ValidationError') {
    return response.status(400).json({ error: error.errors })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'MongoServerError.keyError', message: 'Username must be unique.'})
  } else if (error.name === 'TypeError') {    
    return response.status(400).json({ error: 'TypeError.nullId', message: 'User not found.'})
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}