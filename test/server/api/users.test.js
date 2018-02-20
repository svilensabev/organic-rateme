var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
var faker = require('faker')

var loggedUser, testUser

describe('/api/users', function () {
  this.timeout(0)

  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    // Test on random user from database
    User.count()
    .then(function (count) {
      // Get a random entry
      var random = Math.floor(Math.random() * count)
      return User.findOne().skip(random).populate('roles')
    })
    /*
    Role.find({name: 'member'}).select('_id').exec()
    .then(function (role) {
      return User.findOne({roles: role}).populate('roles')
    })*/
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
      // name: 'john', // filter by user name simular to sql like
      // email: 'john@example.com', // filter by user name simular to sql like
      // role_id: ObjectId,
      offset: 0,
      limit: 10,
      sort: 'name',
      order: 'asc',
      // before: '2018-02-10',
      // after: '2018-02-10',
    }
    console.log('get')
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'GET',
      qs: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      console.log('get res')
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'GET',
      qs: {id: loggedUser.id},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      expect(body).to.have.lengthOf(1)
      expect(body[0]).to.have.property('name')
      expect(body[0].email).to.eq(loggedUser.email)
      next()
    })
  })

  it('POST', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: []
    }
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('name')
      expect(body).to.have.property('email')
      expect(body).to.have.property('roles')
      expect(body.roles).to.be.an('array')
      expect(body.createdAt).to.exist
      // save this user for additional tests
      testUser = res.body
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: [
        'member',
        'admin'
      ]
    }
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'PUT',
      body: params,
      qs: {id: testUser._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'client') {
        expect(res.statusCode).to.eq(403)
        expect(body).to.have.property('message')
      } else {
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('name')
        expect(body).to.have.property('email')
        expect(body).to.have.property('roles')
        expect(body.roles).to.be.an('array')
        expect(body.roles).to.have.lengthOf(2)
        expect(body.createdAt).to.exist
        expect(body.email).to.eq(params.email)
      }
      next()
    })
  })

  it('DELETE', function (next) {
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'DELETE',
      qs: {id: testUser._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      if (loggedUser.roles[0].name === 'client') {
        expect(res.statusCode).to.eq(403)
      } else {
        expect(res.statusCode).to.eq(200)
      }
      expect(body).to.have.property('message')
      next()
    })
  })
})
