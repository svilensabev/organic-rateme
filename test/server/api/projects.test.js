var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const Project = require('../../../server/models/project')
var faker = require('faker')

var loggedUser, testProject, createdProject

describe('/api/projects', function () {
  this.timeout(0)

  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    // Test on random user AND project from database
    User.count()
    .then(function (count) {
      // Get a random entry
      var random = Math.floor(Math.random() * count)
      return User.findOne().skip(random).populate('roles')
    })
    /*
    Role.find({name: 'client'}).select('_id').exec()
    .then(function (role) {
      return User.findOne({roles: role}).populate('roles')
    })*/
    .then(function (result) {
      loggedUser = result
      return Project.count()
    })
    .then(function (count) {
      var random = Math.floor(Math.random() * count)
      return Project.findOne().skip(random).populate('author').populate('users')
    })
    .then(function (result) {
      testProject = result
      next()
    })
    .catch(function (err) {
      next(err)
    })
  })

  it('POST authentication', function (next) {
    var params = {
      email: loggedUser.email,
    }

    request({
      uri: test.variables.apiendpoint + '/authentication',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.a.jwt
      expect(body).to.be.signedWith(test.variables.dna.secrets.jwt_secret)
      // attach token to loggedUser
      loggedUser.token = res.body
      console.log(loggedUser.email)
      console.log(loggedUser.roles[0].name)
      next()
    })
  })

  it('GET filtered list', function (next) {
    var params = {
      // name: 'project', // filter by project name simular to sql like
      // author_id: 'ObjectId', // filter by user
      offset: 0,
      limit: 10,
      sort: 'name',
      order: 'asc',
      // before: '2018-02-10',
      // after: '2018-02-10',
    }
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'GET',
      qs: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      next()
    })
  })

  it('POST', function (next) {
    var params = {
      name: faker.company.companyName(),
      author: loggedUser._id,
      users: [],
      clientFeedback: faker.random.boolean()
    }
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'POST',
      body: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('name')
      expect(body).to.have.property('author')
      expect(body).to.have.property('users')
      expect(body.users).to.be.an('array')
      expect(body.createdAt).to.exist
      expect(body.name).to.eq(params.name)
      // save this project for additional tests
      createdProject = res.body
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: faker.company.companyName(),
      author: loggedUser._id,
      users: [
        loggedUser.email
      ],
      clientFeedback: faker.random.boolean()
    }
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'PUT',
      body: params,
      qs: {id: createdProject._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('name')
      expect(body).to.have.property('author')
      expect(body).to.have.property('users')
      expect(body.users).to.be.an('array')
      expect(body.users).to.have.lengthOf(1)
      expect(body.createdAt).to.exist
      expect(body.name).to.eq(params.name)
      // save this project for additional tests
      createdProject = res.body
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'GET',
      qs: {id: createdProject._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      expect(body).to.have.lengthOf(1)
      expect(body[0]).to.have.property('name')
      expect(body[0].name).to.eq(createdProject.name)
      next()
    })
  })

  it('DELETE', function (next) {
    // seeded testProject has rate requests and feedbacks,
    // so we could test gracefull delete on real project
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'DELETE',
      qs: {id: testProject._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      console.log(testProject.author.id)
      console.log(loggedUser.id)
      console.log(res.statusCode)
      if ((loggedUser.roles[0].name === 'client' && testProject.author.id === loggedUser.id) ||
          loggedUser.roles[0].name !== 'client') {
        expect(res.statusCode).to.eq(200)
      } else {
        expect(res.statusCode).to.eq(403)
      }
      expect(body).to.have.property('message')
      next()
    })
  })
})
