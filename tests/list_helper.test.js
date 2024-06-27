const { test, describe } = require('node:test')
const assert = require('node:assert')
const blogs  = require('./test_data')

const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('single blog likes', () => {
    const testBlogs = [blogs()[0]]
    const result = listHelper.totalLikes(testBlogs)
    assert.strictEqual(result,7)
  })
  test('blogs total likes', () => {
    const testBlogs = blogs()
    const result = listHelper.totalLikes(testBlogs)
    assert.strictEqual(result,36)
  })
  test('zero blogs', () => {
    const testBlogs = []
    const result = listHelper.totalLikes(testBlogs)
    assert.strictEqual(result,0)
  })
})

describe('favorite blog', () => {
  test('no blogs', () => {
    assert.strictEqual(listHelper.favoriteBlog([]), null)
  })
  test('fave blog', () => {
    const testBlogs = blogs()
    const result = listHelper.favoriteBlog(testBlogs)
    assert.strictEqual(result._id, "5a422b3a1b54a676234d17f9")
    assert.strictEqual(result.title, "Canonical string reduction")
    assert.strictEqual(result.author,"Edsger W. Dijkstra")
    assert.strictEqual(result.likes,12)
  })
})

describe('author with most blogs', () => {
  test('no blogs', () => {
    assert.strictEqual(listHelper.mostBlogs([]), null)
  })
  test('most blogs', () => {
    assert.deepEqual(listHelper.mostBlogs(blogs()), ['Robert C. Martin', 3])
  })
})

describe('author with most likes', () => {
  test('no blogs', () => {
    assert.strictEqual(listHelper.mostLikes([]), null)
  })
  test('most likes', () => {
    assert.deepEqual(listHelper.mostLikes(blogs()), ["Edsger W. Dijkstra", 17])
  })
})
