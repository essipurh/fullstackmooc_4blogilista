const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const userExtractor = require('../utils/middleware').userExtractor


// helper function

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1})
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body
  const user =  request.user
  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  const blogWithUser = await savedBlog.populate('user', { username: 1, name: 1})
  response.status(201).json(blogWithUser)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const blogToBeDeletedId = request.params.id
  const userBlogs = request.user.blogs.map(blog => blog.toString())
  if (!userBlogs.includes(blogToBeDeletedId)) {
    return response.status(401).json({ error: {name: 'TokenNotMatch', message: 'Unauthorized.' }})
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' }).populate('user', { username: 1, name: 1})
  response.json(updatedBlog)
})

module.exports = blogsRouter