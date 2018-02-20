var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const Project = require('../../../server/models/project')
const RateRequest = require('../../../server/models/rate_request')
const FeedbackResponse = require('../../../server/models/feedback_response')
var faker = require('faker')

var loggedUser, testProject, createdRateRequest

describe('/api/rate_requests', function () {
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
      // project_id: 'ObjectId',
      // user_id: 'ObjectId',
      offset: 0,
      limit: 10,
    }
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
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
      project: testProject.id,
      user: loggedUser.id,
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
      method: 'POST',
      body: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body.rate_request).to.have.property('project')
      expect(body.rate_request).to.have.property('user')
      expect(body.rate_request).to.have.property('request')
      expect(body.rate_request).to.have.property('description')
      expect(body.rate_request.createdAt).to.exist
      expect(body.rate_request.project).to.eq(params.project)
      // save this rate request for additional tests
      createdRateRequest = res.body.rate_request
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      project: testProject.id,
      user: loggedUser.id,
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
      method: 'PUT',
      body: params,
      qs: {id: createdRateRequest._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('project')
      expect(body).to.have.property('user')
      expect(body).to.have.property('request')
      expect(body).to.have.property('description')
      expect(body.createdAt).to.exist
      expect(body.project).to.eq(params.project)
      expect(body.request).to.eq(params.request)
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
      method: 'GET',
      qs: {id: createdRateRequest._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      expect(body).to.have.lengthOf(1)
      expect(body[0]).to.have.property('project')
      expect(body[0]).to.have.property('request')
      expect(body[0].project._id.toString()).to.eq(createdRateRequest.project.toString())
      next()
    })
  })

  it('DELETE', function (next) {
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
      method: 'DELETE',
      qs: {id: createdRateRequest._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      // TODO test
      if (loggedUser.roles[0].name === 'admin') {
        expect(res.statusCode).to.eq(200)
      } else {
        expect(res.statusCode).to.eq(403)
      }
      expect(body).to.have.property('message')
      next()
    })
  })
})
