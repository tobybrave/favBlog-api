const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/users')
const {
  blogsList, blogsInDb, usersInDb, blogTester, invalidId
} = require('./test_helper')

const api = supertest(app)
let token

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogs = blogsList.map((blog) => new Blog(blog))
  const blogsPromise = blogs.map((blog) => blog.save())
  await Promise.all(blogsPromise)

  const result = await api
    .post('/api/login')
    .send({
      username: 'bobby',
      password: 'bobbybboh'
    })
  token = result.body.token
})

describe('GET:/api/blogs', () => {
  test('blogs are returned in json format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('total amount of blogs is returned', async () => {
    const result = await api.get('/api/blogs')
    expect(result.body).toHaveLength(blogsList.length)
  })

  test('verify id property is defined', async () => {
    const result = await api.get('/api/blogs')
    result.body.forEach((blog) => expect(blog.id).toBeDefined())
  })
})

describe('POST:/api/blogs', () => {
  test('new blog is saved', async () => {
    const beforeSavingNewBlog = await blogsInDb()
    const newBlog = blogTester
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    const afterSavingNewBlog = await blogsInDb()
    const titles = afterSavingNewBlog.map((blog) => blog.title)

    expect(afterSavingNewBlog).toHaveLength(beforeSavingNewBlog.length + 1)
    expect(titles).toContain(newBlog.title)
  })

  test('default is zero when no likes is given', async () => {
    const newBlogWithoutLikes = { ...blogTester }
    delete newBlogWithoutLikes.likes
    await api
      .post('/api/blogs')
      .send(newBlogWithoutLikes)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)

    const allBlogs = await blogsInDb()
    const newUserLikes = allBlogs[allBlogs.length - 1].likes
    expect(newUserLikes).toBe(0)
  })

  test('when url and title is missing in data', async () => {
    const newBlogWithoutUrlAndTitle = {
      author: 'Estefania Cassingena Navone',
      likes: 15
    }
    await api
      .post('/api/blogs')
      .send(newBlogWithoutUrlAndTitle)
      .expect(400)
  })

  test('should require authorization', async () => {
    const newBlog = blogTester
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('DELETE: /api/blogs/:id', () => {
  let blog
  beforeEach(async () => {
    const result = await api
      .post('/api/blogs')
      .send(blogTester)
      .set('Authorization', `Bearer ${token}`)
    blog = result.body
  })

  test('deleting a specific blog', async () => {
    const blogToRemove = blog
    const beforeDeletingBlog = await Blog.find({})
    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    const afterDeletingBlog = await Blog.find({})
    expect(afterDeletingBlog).toHaveLength(beforeDeletingBlog.length - 1)
    expect(afterDeletingBlog).not.toContainEqual(blogToRemove)
  })

  test('when blog has been removed', async () => {
    const blogToRemove = blog
    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .expect(404)
  })

  test('deleting blog that doesnt exist', async () => {
    const wrongId = await invalidId()
    await api
      .delete(`/api/blogs/${wrongId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('attempt to delete blog user didnt create', async () => {
    const allBlogs = await blogsInDb()
    const randomBlog = allBlogs[3]
    await api
      .delete(`/api/blogs/${randomBlog._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('when blog id format is invalid', async () => {
    await api
      .delete('/api/blogs/an_invalid_id_890')
      .expect(400)
  })
})

describe('PUT: /api/blogs/:id', () => {
  test('update likes of a specific blog', async () => {
    const beforeUpdatingBlog = await blogsInDb()
    const blogToUpdate = {
      ...beforeUpdatingBlog[0].toJSON(),
      likes: 8
    }
    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes })
      .expect('Content-Type', /application\/json/)
    const afterUpdatingBlog = await blogsInDb()
    expect(afterUpdatingBlog).toHaveLength(beforeUpdatingBlog.length)
    expect(afterUpdatingBlog[0].likes).toBe(blogToUpdate.likes)
    expect(afterUpdatingBlog[0].toJSON()).toEqual(blogToUpdate)
  })

  test('updating likes of an invalid id throws an error with status code 404', async () => {
    const wrongId = await invalidId()
    await api
      .put('/api/blogs/')
      .send({ likes: 23 })
      .expect(404)
  })
})

describe('POST: /api/users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('bobbybboh', 10)
    const users = new User({
      passwordHash,
      username: 'bobby',
      name: 'Dave Dellinger'
    })
    await users.save()
  })

  test('new user is saved', async () => {
    const beforeAddingUser = await usersInDb()
    const newUser = {
      username: 'tobybrave',
      password: 'areallylongpassword:)',
      name: 'Toby Brave'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const afterAddingUser = await usersInDb()
    const usernames = afterAddingUser.map(({ username }) => username)
    expect(afterAddingUser).toHaveLength(beforeAddingUser.length + 1)
    expect(afterAddingUser.map(({ username }) => username)).toContain(newUser.username)
  })

  test('Invalid users are not created and returns status code 400', async () => {
    const beforeAddingUser = await usersInDb()
    const invalidUser = {
      name: 'Oxlade'
    }
    const response = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
    const afterAddingUser = await usersInDb()

    expect(afterAddingUser).toHaveLength(beforeAddingUser.length)
    expect(response.body.error).toBe('Invalid username or password')
  })

  test('username and password lower than 3 characters are not created and 400 status code returned', async () => {
    const userWithLesserCharString = {
      username: 'ox',
      password: 'us',
      name: 'Oxlade Austin'
    }
    const response = await api
      .post('/api/users')
      .send(userWithLesserCharString)
      .expect(400)

    expect(response.body.error).toBe('Password should be at least 3 characters long')
  })

  test('when username already exist', async () => {
    const response = await api
      .post('/api/users')
      .send({
        username: 'bobby',
        password: 'PRIVATE',
        name: 'Bobby Seal'
      })
      .expect(400)
    expect(response.body.error).toContain('Error, expected `username` to be unique')
  })
})

afterAll(() => {
  mongoose.connection.close()
})