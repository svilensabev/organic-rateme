var request = require('request')
const RateRequest = require('../../../server/models/rate_request')
const FeedbackResponse = require('../../../server/models/feedback_response')
const Project = require('../../../server/models/project')
const User = require('../../../server/models/user')
var url = require('url')
var faker = require('faker')

var rate_request

describe('/api/rate_requests', function () {
  before(test.startServer)
  after(test.stopServer)

  it('GET filtered list', function (next) {
    var params = {
      offset: 0,
      limit: 10,
      sort: 'createdAt',
      order: 'desc',
    }
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
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
      project: faker.company.companyName(),
      user: faker.internet.email(),
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }

    rate_request = new RateRequest(params)
    rate_request.save()

    .then(function (rate_request) {
      request({
        uri: test.variables.apiendpoint + '/rate_requests',
        method: 'GET',
        qs: {id: rate_request._id.toString()},
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
      project: faker.company.companyName(),
      user: faker.internet.email(),
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }
    request({
      uri: test.variables.apiendpoint + '/rate_requests',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('project')
      expect(body).to.have.property('user')
      expect(body).to.have.property('request')
      expect(body.createdAt).to.exist
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      project: faker.company.companyName(),
      user: faker.internet.email(),
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }

    rate_request = new RateRequest(params)
    rate_request.save()

    .then(function (rate_request) {
      request({
        uri: test.variables.apiendpoint + '/rate_requests',
        method: 'PUT',
        body: params,
        qs: {id: rate_request._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('project')
        expect(body).to.have.property('user')
        expect(body).to.have.property('request')
        expect(body.createdAt).to.exist
        next()
      })
    })
  })

  it('DELETE', function (next) {
    var params = {
      project: faker.company.companyName(),
      user: faker.internet.email(),
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }

    rate_request = new RateRequest(params)
    rate_request.save()

    .then(function (rate_request) {
      request({
        uri: test.variables.apiendpoint + '/rate_requests',
        method: 'DELETE',
        qs: {id: rate_request._id.toString()},
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
