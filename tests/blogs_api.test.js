const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helpers = require('./test_helpers')
const Blog = require('../models/blog')
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
    await helpers.addTestUser()
  })

  test('a new blog post is not added if token missing', async () => {
    const token = ''
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect({ error: { name: 'TokenMissing', message: 'Unauthorized.' }})
      .expect(401)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)
  })

  test('a new blog post is not added if token is invalid', async () => {
    const token = 'R5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpZCI6IjY2ODgxNDZiNWFlNDk1MmZiNzk3NjExOCIsImlhdCI6MTcyMDIwMzI2MH0.VGSxQwAsx8284O_xMAAg-y29ts8wPFW0aJiUlvtb1yI'
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect({ error: {name: 'JsonWebTokenError', message:'Invalid token.' }})
      .expect(400)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)
  })

  test('a new blog post is not added if token isn not users', async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJpZCI6IjY2ODgxNDZiNWFlNDk1MmZiNzk3NjExOCIsImlhdCI6MTcyMDIwMzI2MH0.VGSxQwAsx8284O_xMAAg-y29ts8wPFW0aJiUlvtb1yI'
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect({ error: { name: 'Unauthorized', messgae:'Unauthorized. User not found.' }})
      .expect(401)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)
  })

  test('a new blog post is added', async () => {
    const token = await helpers.getUserToken()
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
      likes: 1
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].title, 'New Test Blog 1')
    assert.strictEqual(response.body[0].likes, 1)
  })

  test('a new blog post is added with zero likes', async () => {
    const token = await helpers.getUserToken()
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].title, 'New Test Blog 1')
    assert.strictEqual(response.body[0].likes, 0)
  })

  test('a new blog without title not added', async () => {
    const token = await helpers.getUserToken()
    const newBlog = {
      author: 'Supertesti Testaaja',
      url: 'www.supertestthat.test',
    }

    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect(400)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)
  })

  test('a new blog without url not added', async () => {
    const token = await helpers.getUserToken()
    const newBlog = {
      title: 'New Test Blog 1',
      author: 'Supertesti Testaaja',
    }
    await api
      .post('/api/blogs')
      .auth(token, {type: 'bearer'})
      .send(newBlog)
      .expect(400)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 0)
  })
})

describe('DELETE tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helpers.test_blogs)
    await helpers.addTestUser()
  })
  test('a certain blog post is deleted', async () => {
    const deleteId = helpers.test_blogs[0]._id
    const token = await helpers.getUserToken()
    await api
      .delete(`/api/blogs/${deleteId}`)
      .auth(token, {type: 'bearer'})
      .expect(204)
    
    const response = await api.get('/api/blogs')
    const ids = response.body.map(item => item.id)
    assert.strictEqual(response.body.length, helpers.test_blogs.length - 1)
    assert(!ids.includes(deleteId))
  })
  test('trying to delete a blog which doesnt exist', async () => {
    const nonExistingId = '12345677899'
    const token = await helpers.getUserToken()
    await api
      .delete(`/api/blogs/${nonExistingId}`)
      .auth(token, {type: 'bearer'})
      .expect({ error: { name: 'TokenNotMatch', message: 'Unauthorized.' }})
      .expect(401)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helpers.test_blogs.length)
  })
  test('trying to delete a blog with missing token.', async () => {
    const deleteId = helpers.test_blogs[0]._id
    const token =''
    await api
      .delete(`/api/blogs/${deleteId}`)
      .auth(token, {type: 'bearer'})
      .expect({ error: { name: 'TokenMissing', message: 'Unauthorized.' }})
      .expect(401)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helpers.test_blogs.length)
  })

  test('trying to delete a blog with unmathinc token.', async () => {
    const deleteId = helpers.test_blogs[1]._id
    const token =await helpers.getUserToken()
    await api
      .delete(`/api/blogs/${deleteId}`)
      .auth(token, {type: 'bearer'})
      .expect({ error: { name: 'TokenNotMatch', message: 'Unauthorized.' }})
      .expect(401)
    
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helpers.test_blogs.length)
  })

})

describe('PUT tests', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helpers.test_blogs)
  })
  test('a certain blog post likes updated', async () => {
    const blog  = { ...helpers.test_blogs[0],likes:helpers.test_blogs[0].likes +1 }
    await api
      .put(`/api/blogs/${blog._id}`)
      .send(blog)
      .expect(200)
    
    const response = await api.get('/api/blogs')
    const updatedBlog = response.body.find(obj => obj.id === blog._id)
    assert.strictEqual(response.body.length, helpers.test_blogs.length)
    assert.strictEqual(updatedBlog.likes, helpers.test_blogs[0].likes +1)
  })
  test('handeling non-existing blogs update', async () => {
    const blog  = { ...helpers.test_blogs[0],likes:helpers.test_blogs[0].likes +1 }
    const nonExistingId = `${blog._id}AAA`
    await api
      .put(`/api/blogs/${nonExistingId}`)
      .send(blog)
      .expect(400)
    
    const response = await api.get('/api/blogs')
    const updatedBlog = response.body.find(obj => obj.id === nonExistingId)
    const ids = response.body.map(item => item.id)
    assert.equal(updatedBlog, undefined)
    assert.strictEqual(response.body.length, helpers.test_blogs.length)
    assert(!ids.includes(nonExistingId))
  })
})


// suljetaan yhteys
after(async () => {
  await mongoose.connection.close()
})
