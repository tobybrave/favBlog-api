const { blogsList } = require('./test_helper')
const {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
} = require('../utils/list_helper')

test('dummy returns one', () => {
  expect(dummy([])).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(totalLikes([])).toBe(0)
  })
  test('when list has one blog, equals to likes of that', () => {
    expect(totalLikes([blogsList[0].likes])).toBe(7)
  })
  test('of a bigger list is calculated right', () => {
    const likes = blogsList.map((blog) => blog.likes)
    expect(totalLikes(likes)).toBe(36)
  })
})

describe('favorite blog', () => {
  test('when no blog details is provided', () => {
    expect(favoriteBlog([])).toEqual({})
  })
  test('when only one blog detail is provided, it outputs itself', () => {
    expect(favoriteBlog([blogsList[4]])).toEqual({
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      likes: 0
    })
  })

  test('when numerous blog details are provided, it outputs itself', () => {
    expect(favoriteBlog(blogsList)).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })
})

describe('author with most blogs', () => {
  test('when no blog is provided', () => {
    expect(mostBlogs([])).toEqual({})
  })

  test('when only one blog is given, the result is itself', () => {
    expect(mostBlogs([blogsList[0]])).toEqual({
      author: 'Michael Chan',
      blogs: 1
    })
  })

  test('when an array of blogs is provided', () => {
    expect(mostBlogs(blogsList)).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    })
  })
})

describe('author with most blogs like', () => {
  test('when no blog is provided', () => {
    expect(mostLikes([])).toEqual({})
  })

  test('when only one blog is given, the result is itself', () => {
    expect(mostLikes([blogsList[1]])).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('when an array of blogs is provided', () => {
    expect(mostLikes(blogsList)).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})