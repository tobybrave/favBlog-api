const _ = require('lodash')

const max = (array, key) => {
  const highest = Math.max(...array.map((item) => item[key]))
  return array.find((item) => highest === item[key])
}

const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((accum, blogLikes) => accum + blogLikes, 0)

const favoriteBlog = (blogs) => {
  const blogsCopy = []
  if (blogs.length) {
    blogs.forEach((blog) => {
      const tempCopy = { ...blog }
      delete tempCopy._id
      delete tempCopy.url
      delete tempCopy.__v
      blogsCopy.push(tempCopy)
    })
    return max(blogsCopy, 'likes')
  }
  return {}
}

const mostBlogs = (blogs) => {
  if (blogs.length) {
    const authorOfEachBlog = _.sortBy(_.map(blogs, 'author'), 'author')
    const authors = _.sortedUniq(authorOfEachBlog)
    const blogsCount = (author) => {
      const range = _.lastIndexOf(authorOfEachBlog, author) - _.indexOf(authorOfEachBlog, author)
      return { author, blogs: range + 1 }
    }
    const authorsAndTotalBlogs = _.map(authors, blogsCount)
    return _.find(authorsAndTotalBlogs, _.maxBy(authorsAndTotalBlogs, 'blogs'))
  }
  return {}
}

const mostLikes = (blogs) => {
  if (blogs.length) {
    const blogAuthorAndLikes = blogs.map((blog) => ({ author: blog.author, likes: blog.likes }))
    const authors = _.map(_.uniqBy(blogAuthorAndLikes, 'author'), 'author')
    const authorsAndTotalLikes = _.map(authors, (author) => {
      let likes = 0
      blogAuthorAndLikes.forEach((blog) => {
        if (author === blog.author) {
          likes += blog.likes
        }
      })
      return {
        author,
        likes
      }
    })
    return _.find(authorsAndTotalLikes, _.maxBy(authorsAndTotalLikes, 'likes'))
  }
  return {}
}

module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}