const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = ( error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).send({ error:'error.malformaddedId', message:'Malformatted id.' })
  } else if (error.name ==='ValidationError') {
    return res.status(400).json({ error: error.errors })
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler
}