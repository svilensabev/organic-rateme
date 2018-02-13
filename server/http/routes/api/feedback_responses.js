// const RateRequest = require('../../../models/rate_request')
const FeedbackResponse = require('../../../models/feedback_response')
// const Project = require('../../../models/project')
// const User = require('../../../models/user')
// const ProjectUser = require('../../../models/project_user')
const _ = require('underscore')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      FeedbackResponse.search(params)

      // send the response back
      .then(function (feedback_response) {
        res.body = feedback_response
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
      var newFeedbackResponse

      // disallow other fields besides those listed below
      newFeedbackResponse = new FeedbackResponse(_.pick(req.body, 'rateRequest', 'state', 'feedback'))
      newFeedbackResponse.save()

      // send the response back
      .then(function (feedback_response) {
        res.body = feedback_response
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
      var feedback_response
      var newAttributes

      // load the rate request
      FeedbackResponse.findById(req.query.id).exec()

      .then(function (feedbackFromDb) {
        feedback_response = feedbackFromDb
        if (feedback_response === null) {
          throw new Error('Feedback response not found.')
        }
        // modify resource with allowed attributes
        newAttributes = _.pick(req.body, 'rateRequest', 'state', 'feedback')
        feedback_response = _.extend(feedback_response, newAttributes)
        // save feedback response
        return feedback_response.save()
      })

      // send the response back
      .then(function (feedback_response) {
        res.body = feedback_response
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
      FeedbackResponse.findById(req.query.id).exec()

      .then(function (feedback_response) {
        if (feedback_response !== null) {
          return feedback_response.remove()
        } else {
          throw new Error('Feedback response not found.')
        }
      })

      // send the response back
      .then(function (feedback_response) {
        res.body = {message: 'Feedback response has been deleted.'}
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
