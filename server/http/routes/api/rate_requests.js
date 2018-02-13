const RateRequest = require('../../../models/rate_request')
// const FeedbackResponse = require('../../../models/feedback_response')
// const Project = require('../../../models/project')
// const User = require('../../../models/user')
// const ProjectUser = require('../../../models/project_user')
const _ = require('underscore')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      RateRequest.search(params)

      // send the response back
      .then(function (rate_request) {
        res.body = rate_request
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'POST': function (req, res, next) {
      var newRateRequest

      // disallow other fields besides those listed below
      newRateRequest = new RateRequest(_.pick(req.body, 'project', 'user', 'request', 'description'))
      newRateRequest.save()

      // send the response back
      .then(function (rate_request) {
        res.body = rate_request
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'PUT': function (req, res, next) {
      var rate_request
      var newAttributes

      // load the rate request
      RateRequest.findById(req.query.id).exec()

      .then(function (rateFromDb) {
        rate_request = rateFromDb
        if (rate_request === null) {
          throw new Error('Rate request not found.')
        }
        // modify resource with allowed attributes
        newAttributes = _.pick(req.body, 'project', 'user', 'request', 'description')
        rate_request = _.extend(rate_request, newAttributes)
        // save rate request
        return rate_request.save()
      })

      // send the response back
      .then(function (rate_request) {
        res.body = rate_request
        next()
      })
      // catch all errors and call the error handler
      .catch(function (err) {
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'DELETE': function (req, res, next) {
      RateRequest.findById(req.query.id).exec()

      .then(function (rate_request) {
        if (rate_request !== null) {
          return rate_request.remove()
        } else {
          throw new Error('Rate request not found.')
        }
      })

      // send the response back
      .then(function (rate_request) {
        res.body = {message: 'Rate request has been deleted.'}
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    }
  }
}
