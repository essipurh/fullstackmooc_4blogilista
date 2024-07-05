const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helpers = require('./test_helpers')
const Blog = require('../models/blog')
const { log } = require('node:console')

const api = supertest(app) // superagent olio


describe('GET tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helpers.test_blogs)
  })
  test('blogposts returned as jsons', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 6)
  })
  
  test('blogs returned are the ones inserted', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body[0].id, '5a422a851b54a676234d17f7')
  })
  
  test('blog identifying tag is id not _id', async () => {
    const response = await api.get('/api/blogs')
    assert.equal(Object.keys(response.body[0]).includes('id'), true)
  })
})

describe('POST tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
  })

  test('a new blog post is added', async () => {
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, 1)
      assert.strictEqual(response.body[0].title, 'New Test Blog 1')
      assert.strictEqual(response.body[0].likes, 1)
  })

  test('a new blog post is added with zero likes', async () => {
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test'
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, 1)
      assert.strictEqual(response.body[0].title, 'New Test Blog 1')
      assert.strictEqual(response.body[0].likes, 0)
  })

  test('a new blog without title not added', async () => {
    const newBlog = {
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, 0)
  })
  
  test('a new blog without url not added', async () => {
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
    
      const response = await api.get('/api/blogs')
      assert.strictEqual(response.body.length, 0)
  })
})


// suljetaan yhteys
after(async () => {
  await mongoose.connection.close()
})
