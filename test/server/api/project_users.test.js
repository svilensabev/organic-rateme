var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const Project = require('../../../server/models/project')
const ProjectUser = require('../../../server/models/project_user')
var faker = require('faker')

var loggedUser, testProject, createdProjectUser

describe('/api/project_users', function () {
  this.timeout(0)

  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    console.log('test')
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
      console.log(loggedUser.id)
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
      uri: test.variables.apiendpoint + '/project_users',
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
      position: faker.name.jobTitle(),
      price: faker.finance.amount()
    }
    request({
      uri: test.variables.apiendpoint + '/project_users',
      method: 'POST',
      body: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('project')
      expect(body).to.have.property('user')
      expect(body).to.have.property('position')
      expect(body).to.have.property('price')
      expect(body.assignedAt).to.exist
      expect(body.project).to.eq(params.project)
      // save this project for additional tests
      createdProjectUser = res.body
      console.log('createdProjectUser')
      console.log(createdProjectUser)
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      project: testProject.name,
      user: loggedUser.email,
      position: faker.name.jobTitle(),
      price: faker.finance.amount()
    }
    request({
      uri: test.variables.apiendpoint + '/project_users',
      method: 'PUT',
      body: params,
      qs: {id: createdProjectUser._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('project')
      expect(body).to.have.property('user')
      expect(body).to.have.property('position')
      expect(body).to.have.property('price')
      expect(body.assignedAt).to.exist
      expect(body.project._id.toString()).to.eq(createdProjectUser.project.toString())
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/project_users',
      method: 'GET',
      qs: {id: createdProjectUser._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      expect(body).to.have.lengthOf(1)
      expect(body[0]).to.have.property('project')
      expect(body[0]).to.have.property('position')
      expect(body[0].project._id.toString()).to.eq(createdProjectUser.project.toString())
      next()
    })
  })

  it('DELETE', function (next) {
    request({
      uri: test.variables.apiendpoint + '/project_users',
      method: 'DELETE',
      qs: {id: createdProjectUser._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      // TODO test
      if ((loggedUser.roles[0].name === 'client' && createdProjectUser.user === loggedUser.id) ||
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
