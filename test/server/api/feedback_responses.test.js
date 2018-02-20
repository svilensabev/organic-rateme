var request = require('request')
const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const RateRequest = require('../../../server/models/rate_request')
const FeedbackResponse = require('../../../server/models/feedback_response')
var faker = require('faker')

var loggedUser, testRateRequest, createdFeedbackResponse

describe('/api/feedback_responses', function () {
  this.timeout(0)

  before(test.startServer)
  after(test.stopServer)

  before(function (next) {
    console.log('test')
    // Test on random user AND project from database
    /*
    User.count()
    .then(function (count) {
      // Get a random entry
      var random = Math.floor(Math.random() * count)
      return User.findOne().skip(random).populate('roles')
    })
    */
    Role.find({name: 'admin'}).select('_id').exec()
    .then(function (role) {
      return User.findOne({roles: role}).populate('roles')
    })
    .then(function (result) {
      loggedUser = result
      return RateRequest.count()
    })
    .then(function (count) {
      var random = Math.floor(Math.random() * count)
      return RateRequest.findOne().skip(random).populate('project').populate('user')
    })
    .then(function (result) {
      testRateRequest = result
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
      // rate_id: 'ObjectId',
      // user_id: 'ObjectId',
      offset: 0,
      limit: 10,
    }
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
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
      rateRequest: testRateRequest.id,
      user: loggedUser.id,
      state: 'empty',
      feedback: faker.lorem.paragraph()
    }
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
      method: 'POST',
      body: params,
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.have.property('rateRequest')
      expect(body).to.have.property('user')
      expect(body).to.have.property('state')
      expect(body).to.have.property('feedback')
      expect(body.createdAt).to.exist
      expect(body.rateRequest).to.eq(params.rateRequest)
      // save this feedback response for additional tests
      createdFeedbackResponse = res.body
      next()
    })
  })

  it('PUT', function (next) {
    var params = {
      rateRequest: testRateRequest.id,
      user: loggedUser.id,
      state: 'yes-now',
      feedback: faker.lorem.paragraph(),
      respondedAt: Date.now()
    }
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
      method: 'PUT',
      body: params,
      qs: {id: createdFeedbackResponse._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('object')
      expect(body).to.have.property('rateRequest')
      expect(body).to.have.property('user')
      expect(body).to.have.property('state')
      expect(body).to.have.property('feedback')
      expect(body.createdAt).to.exist
      expect(body.rateRequest).to.eq(params.rateRequest)
      next()
    })
  })

  it('GET :id', function (next) {
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
      method: 'GET',
      qs: {id: createdFeedbackResponse._id.toString()},
      headers: {Authorization: ' Bearer ' + loggedUser.token},
      json: true
    }, function (err, res, body) {
      if (err) return next(err)
      expect(res.statusCode).to.eq(200)
      expect(body).to.be.an('array')
      expect(body).to.have.lengthOf(1)
      expect(body[0]).to.have.property('rateRequest')
      expect(body[0]).to.have.property('state')
      expect(body[0].rateRequest._id.toString()).to.eq(createdFeedbackResponse.rateRequest.toString())
      next()
    })
  })

  it('DELETE', function (next) {
    request({
      uri: test.variables.apiendpoint + '/feedback_responses',
      method: 'DELETE',
      qs: {id: createdFeedbackResponse._id.toString()},
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
