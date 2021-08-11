const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/users')
const config = require('../utils/config')
const logger = require('../utils/logger')

blogRouter.get('/', async (request, response, next) => {
  const allBlogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  const result = allBlogs.length
    ? allBlogs
    : 'No blog enlisted yet!'
  response.json(result)
})

blogRouter.post('/', async (request, response, next) => {
  const {
    title, author, url, likes
  } = request.body
  if (!title && !url) {
    return response.status(400).json({
      error: 'title and url data is missing'
    })
  }

  const decodedToken = jwt.verify(request.token, config.TOKEN)
  const user = await User.findById(decodedToken.id)
  const blogs = new Blog({
    title,
    author,
    url,
    user: decodedToken.id,
    likes: !likes ? 0 : likes
  })
  const savedBlog = await blogs.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  return response.status(201).json(savedBlog.toJSON())
})

blogRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params
  const blogToDelete = await Blog.findById(id)
  if (!blogToDelete) {
    return response.status(404).json({
      error: 'blog does not exist'
    })
  }
  const decodedToken = jwt.verify(request.token, config.TOKEN)
  if (JSON.stringify(blogToDelete.user) === JSON.stringify(decodedToken.id)) {
    const user = await User.findById(decodedToken.id)
    await Blog.findByIdAndDelete(blogToDelete.id)
    user.blogs = user.blogs.filter((blog) => blog.id !== id)
    await user.save()
    return response.status(204).end()
  }
  return response.status(404).end()
})

blogRouter.put('/:id', async (request, response, next) => {
  const { id } = request.params
  const { likes } = request.body
  const blog = await Blog.findById(id)
  if (!blog) {
    return response.status(404).json({
      error: 'blog does not exist'
    })
  }
  const updatedBlog = await Blog.findByIdAndUpdate(blog.id, { likes }, { new: true })
  return response.status(202).json(updatedBlog.toJSON())
})

module.exports = blogRouter