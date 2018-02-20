var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const Permission = require('../../../server/models/permission')

var loggedUser, testPermission

describe('/api/permissions', function () {
  this.timeout(0)

  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    console.log('test')
    // Test on random user from database
    User.count()
    .then(function (count) {
      // Get a random entry
      var random = Math.floor(Math.random() * count)
      return User.findOne().skip(random).populate('roles')
    })
    /*
    Role.find({name: 'admin'}).select('_id').exec()
    .then(function (role) {
      return User.findOne({roles: role}).populate('roles')
    })
    */
    .then(function (result) {
      loggedUser = result
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
      console.log(loggedUser.name)
      console.log(loggedUser.roles[0].name)
      next()
    })
  })

  it('GET filtered list', function (next) {
    var params = {
      // name: 'admin',
      // title: 'admin',
      sort: 'name',
      order: 'asc',
    }
    request({
      uri: test.variables.apiendpoint + '/permissions',
      method: 'GET',
      qs: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'admin') {
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('array')
      } else {
        expect(res.statusCode).to.eq(403)
        expect(body).to.have.property('message')
      }
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/permissions',
      method: 'GET',
      qs: {id: loggedUser.roles[0].id},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'admin') {
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('array')
        expect(body).to.have.lengthOf(1)
        expect(body[0]).to.have.property('name')
        expect(body[0]).to.have.property('title')
      } else {
        expect(res.statusCode).to.eq(403)
        expect(body).to.have.property('message')
      }
      next()
    })
  })

  it('POST', function (next) {
    var params = {
      name: 'testPermission',
      title: 'test Permission'
    }
    request({
      uri: test.variables.apiendpoint + '/permissions',
      method: 'POST',
      body: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'admin') {
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('name')
        expect(body).to.have.property('title')
        expect(body.name).to.eq(params.name)
      } else {
        expect(res.statusCode).to.eq(403)
        expect(body).to.have.property('message')
      }
      // save this role for additional tests
      testPermission = res.body
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: 'testPermission modified',
      title: 'test Permission modified'
    }
    // if loggedUser is admin then testPermission was saved and could be tested
    // otherwise test on existing permission from loggedUser
    var permissionId
    if (loggedUser.roles[0].name === 'admin') {
      permissionId = testPermission._id.toString()
    } else {
      permissionId = loggedUser.roles[0].permissions[0].toString()
    }

    request({
      uri: test.variables.apiendpoint + '/permissions',
      method: 'PUT',
      body: params,
      qs: {id: permissionId},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'admin') {
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('name')
        expect(body).to.have.property('title')
        expect(body.name).to.eq(params.name)
      } else {
        expect(res.statusCode).to.eq(403)
        expect(body).to.have.property('message')
      }
      next()
    })
  })

  it('DELETE', function (next) {
    // if loggedUser is admin then testPermission was saved and could be tested
    // otherwise test on existing permission from loggedUser
    var permissionId
    if (loggedUser.roles[0].name === 'admin') {
      permissionId = testPermission._id.toString()
    } else {
      permissionId = loggedUser.roles[0].permissions[0].toString()
    }

    request({
      uri: test.variables.apiendpoint + '/permissions',
      method: 'DELETE',
      qs: {id: permissionId},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
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
