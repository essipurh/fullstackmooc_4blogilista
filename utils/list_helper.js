const fp = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((acc, blog) => acc + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  const maxLikes = Math.max(...blogs.map(blog => blog.likes))
  return blogs.find(blog => blog.likes === maxLikes )
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  // find most common occurence in a list, not the cleanest solution :/ if two same will return the last one
  return Object.entries(fp.countBy(blogs, "author")).reduce((prev,curr) => prev[1] > curr[1] ? prev : curr)
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  // ugly, but works...
  return Object.entries(blogs.reduce((likesDict, obj) => {likesDict[obj.author] = likesDict[obj.author] + obj.likes || obj.likes; return likesDict}, {})).reduce((prev,curr) => prev[1] > curr[1] ? prev : curr)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}