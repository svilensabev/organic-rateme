var request = require('request')
const FeedbackResponse = require('../../../server/models/feedback_response')
const RateRequest = require('../../../server/models/rate_request')
const Project = require('../../../server/models/project')
const User = require('../../../server/models/user')
var faker = require('faker')

var feedback_response

describe('/api/feedback_responses', function () {
  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    name = faker.name.findName()
    email = faker.internet.email()
    next()
  })

  it('GET filtered list', function (next) {
    var params = {
      offset: 0,
      limit: 10,
      sort: 'createdAt',
      order: 'asc',
    }
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
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
      rateRequest: 'ObjectId',
      state: faker.lorem.word(),
      feedback: faker.lorem.sentence()
    }

    feedback_response = new FeedbackResponse(params)
    feedback_response.save()

    .then(function (feedback_response) {
      request({
        uri: test.variables.apiendpoint + '/feedback_responses',
        method: 'GET',
        qs: {id: feedback_response._id.toString()},
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
      rateRequest: 'ObjectId',
      state: faker.lorem.word(),
      feedback: faker.lorem.sentence()
    }
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
      method: 'POST',
      body: params,
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('rateRequest')
      expect(body).to.have.property('state')
      expect(body).to.have.property('feedback')
      expect(body.createdAt).to.exist
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      rateRequest: 'ObjectId',
      state: faker.lorem.word(),
      feedback: faker.lorem.sentence()
    }

    feedback_response = new FeedbackResponse(params)
    feedback_response.save()

    .then(function (feedback_response) {
      request({
        uri: test.variables.apiendpoint + '/feedback_responses',
        method: 'PUT',
        body: params,
        qs: {id: feedback_response._id.toString()},
        json: true
      }, function (err, res, body) {
        if (err) return next(err)
        expect(res.statusCode).to.eq(200)
        expect(body).to.be.an('object')
        expect(body).to.have.property('rateRequest')
        expect(body).to.have.property('state')
        expect(body).to.have.property('feedback')
        expect(body.createdAt).to.exist
        next()
      })
    })
  })

  it('DELETE', function (next) {
    var params = {
      rateRequest: 'ObjectId',
      state: faker.lorem.word(),
      feedback: faker.lorem.sentence()
    }

    feedback_response = new FeedbackResponse(params)
    feedback_response.save()

    .then(function (feedback_response) {
      request({
        uri: test.variables.apiendpoint + '/feedback_responses',
        method: 'DELETE',
        qs: {id: feedback_response._id.toString()},
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
