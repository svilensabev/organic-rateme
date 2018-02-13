var request = require('request')
const User = require('../../../server/models/user')
var url = require('url')
var faker = require('faker')

var name, email, uri, user

describe('/api/users', function () {
  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    name = faker.name.findName()
    email = faker.internet.email()
    next()
  })

  it('GET filtered list', function (next) {
    var params = {
      // name: 'john', // filter by user name simular to sql like
      // email: 'john@example.com', // filter by user name simular to sql like
      offset: 0,
      limit: 10,
      sort: 'name',
      order: 'asc',
      before: '2018-02-10',
      after: '2018-02-10',
    }
    request({
      uri: test.variables.apiendpoint + '/users',
      method: 'GET',
      qs: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      next()
    })
  })

  it('GET id', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: []
    }

    user = new User(params)
    user.save()

    .then(function (user) {
      request({
        uri: test.variables.apiendpoint + '/users',
        method: 'GET',
        qs: {id: user._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        uri = url.parse(res.request.uri.href, true)
        // console.log(body)
        // console.log(uri.query.id)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('array')
        next()
      })
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
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: []
    }

    user = new User(params)
    user.save()

    .then(function (user) {
      params.roles = [
        'member',
        'admin'
      ]

      request({
        uri: test.variables.apiendpoint + '/users',
        method: 'PUT',
        body: params,
        qs: {id: user._id.toString()},
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
        next()
      })
    })
  })

  it('DELETE', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: []
    }

    user = new User(params)
    user.save()

    .then(function (user) {
      request({
        uri: test.variables.apiendpoint + '/users',
        method: 'DELETE',
        qs: {id: user._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.have.property('message')
        next()
      })
    })
  })

  it('POST authentication', function (next) {
    var params = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: []
    }

    user = new User(params)
    user.save()

    .then(function (user) {
      params.roles = [
        'member',
        'admin'
      ]

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
        next()
      })
    })
  })
})
