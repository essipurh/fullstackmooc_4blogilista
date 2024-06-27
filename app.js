const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const { info } = require('./utils/logger')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blogs')

mongoose.set('strictQuery', false) // tallentaa db:ghen myös muut kentät requestin mukana, ei vain schemassa määritellyt. kts. https://www.mongodb.com/community/forums/t/deprecationwarning-mongoose-the-strictquery/209637
info('*** Connecting to:', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI)
  .then(() => info('Connected to MongoDB'))
  .catch(error => info('ERROR connecting to mongodb', error.message))

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsRouter)

module.exports = app