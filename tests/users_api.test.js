const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helpers = require('./test_helpers')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app) // superagent olio


describe('user db testing', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('salasana1', 10)
    const user = new User({ username: 'testi1', name: 'testi testaaja1', passwordHash: passwordHash })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const initUsers = await helpers.usersInDb()

    const newUser = {
      username: 'testi2',
      name: 'Testi Testaaja 2',
      password: 'salainen2',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await helpers.usersInDb()
    assert.strictEqual(usersAfter.length, initUsers.length + 1)

    const usernames = usersAfter.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('get users', async () => {

    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].username, 'testi1')
  })
})

// suljetaan yhteys
after(async () => {
  await mongoose.connection.close()
})
