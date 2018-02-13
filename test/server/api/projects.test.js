var request = require('request')
const Project = require('../../../server/models/project')
var url = require('url')
var faker = require('faker')

var name, email, uri, project

describe('/api/projects', function () {
  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    name = faker.name.findName()
    email = faker.internet.email()
    next()
  })

  it('GET filtered list', function (next) {
    var params = {
      // name: 'p 1', // filter by project name simular to sql like
      offset: 0,
      limit: 10,
      sort: 'name',
      order: 'asc',
      before: '2018-02-10',
      after: '2018-02-10',
    }
    request({
      uri: test.variables.apiendpoint + '/projects',
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
      name: faker.company.companyName(),
      users: [],
      clientFeedback: faker.random.boolean()
    }

    project = new Project(params)
    project.save()

    .then(function (project) {
      request({
        uri: test.variables.apiendpoint + '/projects',
        method: 'GET',
        qs: {id: project._id.toString()},
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
      name: faker.company.companyName(),
      clientFeedback: faker.random.boolean()
    }
    request({
      uri: test.variables.apiendpoint + '/projects',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('name')
      expect(body).to.have.property('clientFeedback')
      expect(body).to.have.property('users')
      expect(body.users).to.be.an('array')
      expect(body.createdAt).to.exist
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      name: faker.company.companyName(),
      users: [],
      clientFeedback: faker.random.boolean()
    }

    project = new Project(params)
    project.save()

    .then(function (project) {
      params.users = [
        'svilensabev@gmail.com',
        'svilen@gmail.com'
      ]

      request({
        uri: test.variables.apiendpoint + '/projects',
        method: 'PUT',
        body: params,
        qs: {id: project._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('name')
        expect(body).to.have.property('clientFeedback')
        expect(body).to.have.property('users')
        expect(body.users).to.be.an('array')
        expect(body.createdAt).to.exist
        next()
      })
    })
  })

  it('DELETE', function (next) {
    var params = {
      name: faker.company.companyName(),
      users: [],
      clientFeedback: faker.random.boolean()
    }

    project = new Project(params)
    project.save()

    .then(function (project) {
      request({
        uri: test.variables.apiendpoint + '/projects',
        method: 'DELETE',
        qs: {id: project._id.toString()},
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
