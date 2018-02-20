const RateRequest = require('../../../models/rate_request')
const FeedbackResponse = require('../../../models/feedback_response')
const Project = require('../../../models/project')
// const User = require('../../../models/user')
// const ProjectUser = require('../../../models/project_user')
const _ = require('underscore')
const jwtAccess = require('../../../helpers/jwt-access')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': [
      function (req, res, next) {
        return jwtAccess.check('project:read', req, res, next)
      },
      function (req, res, next) {
        var params = req.query

        RateRequest.search(params)

        // send the response back
        .then(function (rate_requests) {
          res.body = rate_requests
          next()
        })

        // catch all errors and call the error handler
        .catch(function (err) {
          res.status(403)
          res.body = {message: err.message, error: err.name}
          next(err)
        })
      }
    ],
    'POST': [
      function (req, res, next) {
        return jwtAccess.check('rate:create', req, res, next)
      },
      function (req, res, next) {
        var newRateRequest, projectFromDb

        if (req.body.user === undefined) {
          req.body.user = req.user.userId
        }

        // disallow other fields besides those listed below
        newRateRequest = new RateRequest(_.pick(req.body, 'project', 'user', 'request', 'description'))
        newRateRequest.save()

        // load project from db
        .then(function (rate_request) {
          newRateRequest = rate_request
          return Project.findOne({'_id': newRateRequest.project.toString()}).populate('users').exec()
        })

        // create feedback responses for this rate request
        .then(function (project) {
          projectFromDb = project
          // do not create feedback responses for logged user
          // TODO fix
          var projectUsers = []
          for (let user of projectFromDb.users) {
            if (user.user.toString() !== req.body.user) {
              projectUsers.push(user.user)
            }
          }
          return Promise.all(projectUsers.map(user => {
            var feedback_response = {
              rateRequest: newRateRequest._id,
              user: user,
              state: 'empty',
              feedback: ''
            }
            var newFeedbackResponse = new FeedbackResponse(feedback_response)
            return newFeedbackResponse.save()
            .then(FeedbackResponse => {
              return FeedbackResponse
            })
          }))
        })

        // send the response back
        .then(function (feedback_responses) {
          res.body = {project: projectFromDb, rate_request: newRateRequest, feedback_responses: feedback_responses}
          next()
        })

        // catch all errors and call the error handler
        .catch(function (err) {
          res.status(403)
          res.body = {message: err.message, error: err.name}
          next(err)
        })
      }
    ],
    'PUT': [
      function (req, res, next) {
        return jwtAccess.check('rate:create', req, res, next)
      },
      function (req, res, next) {
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
          newAttributes = _.pick(req.body, 'request', 'description')
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
          next(err)
        })
      }
    ],
    'DELETE': [
      function (req, res, next) {
        return jwtAccess.check('admin', req, res, next)
      },
      function (req, res, next) {
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
          next(err)
        })
      }
    ]
  }
}
