var request = require('request')
const Role = require('../../../server/models/role')
var faker = require('faker')

var role

describe('/api/roles', function () {
  before(test.startServer)
  after(test.stopServer)

  it('GET filtered list', function (next) {
    var params = {
      // name: 'member', // filter by role name simular to sql like
      offset: 0,
      limit: 10,
      sort: 'name',
      order: 'asc',
      before: '2018-02-10',
      after: '2018-02-10',
    }
    request({
      uri: test.variables.apiendpoint + '/roles',
      method: 'GET',
      qs: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      // url.parse(res.request.uri.href, true)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      next()
    })
  })

  it('GET id', function (next) {
    var params = {
      name: faker.name.jobType(),
      permissions: []
    }

    role = new Role(params)
    role.save()

    .then(function (role) {
      request({
        uri: test.variables.apiendpoint + '/roles',
        method: 'GET',
        qs: {id: role._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('array')
        next()
      })
    })
  })

  it('POST', function (next) {
    var params = {
      name: faker.name.jobType(),
      permissions: []
    }
    request({
      uri: test.variables.apiendpoint + '/roles',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('name')
      expect(body).to.have.property('permissions')
      expect(body.permissions).to.be.an('array')
      expect(body.createdAt).to.exist
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: faker.name.jobType(),
      permissions: []
    }

    role = new Role(params)
    role.save()

    .then(function (role) {
      params.permissions = [
        'user:read',
        'user:create'
      ]

      request({
        uri: test.variables.apiendpoint + '/roles',
        method: 'PUT',
        body: params,
        qs: {id: role._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('name')
        expect(body).to.have.property('permissions')
        expect(body.permissions).to.be.an('array')
        expect(body.createdAt).to.exist
        next()
      })
    })
  })

  it('DELETE', function (next) {
    var params = {
      name: faker.name.jobArea(),
      permissions: []
    }

    role = new Role(params)
    role.save()

    .then(function (role) {
      request({
        uri: test.variables.apiendpoint + '/roles',
        method: 'DELETE',
        qs: {id: role._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.have.property('message')
        next()
      })
    })
  })
})
