const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const morgan = require('morgan')
const { info, error } = require('./utils/logger')
const { unknownEndpoint, errorHandler, tokenExtractor } = require('./utils/middleware')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')


morgan.token('body', (req) => JSON.stringify(req.body))

mongoose.set('strictQuery', false) // tallentaa db:ghen myös muut kentät requestin mukana, ei vain schemassa määritellyt. kts. https://www.mongodb.com/community/forums/t/deprecationwarning-mongoose-the-strictquery/209637
info('*** Connecting to:', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => info('Connected to MongoDB'))
  .catch((errormsg) => error('ERROR connecting to mongodb', errormsg.message))

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body')) 
app.use(tokenExtractor)
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/users', userRouter)

// e2e testejä varten
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(unknownEndpoint)
app.use(errorHandler)


module.exports = app