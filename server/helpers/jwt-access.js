const Project = require('../models/project')
const ProjectUser = require('../models/project_user')
const RateRequest = require('../models/rate_request')
const FeedbackResponse = require('../models/feedback_response')
var jwt = require('jsonwebtoken')
var guard = require('express-jwt-permissions')()
const _ = require('underscore')

var jwtAccess = {}

/*
 * sign with default (HMAC SHA256)
 */
jwtAccess.generateJwtToken = function (params, secret) {
  var token = jwt.sign(params, secret)
  return token
}

/*
 * verify JWT
 */
jwtAccess.verifyJwtToken = function (token, secret) {
  var decoded = jwt.verify(token, secret)
  return decoded
}

/*
 * verify JWT
 */
jwtAccess.asyncVerifyJwtToken = function (token, secret) {
  return new Promise(
    function (resolve, reject) {
      jwt.verify(token, secret, function (err, decoded) {
        if (!err) {
          resolve(decoded)
        } else {
          reject(err)
        }
      })
    }
  )
}

/*
 * middleware to check access based on user permissions or roles
   TODO `/rate_requests` => Create rate requests on projects where logged user is member
        permission is rate:create
   TODO `/feedback_responses` => Create feedback  on projects where logged user is member
        permission is feedback:create
 */
jwtAccess.check = function (permission, req, res, next) {
  // pass if user has `admin` role no matter of permissions
  if (_.contains(req.user.roles, 'admin')) {
    return next()
  }

  // pass if user has `admin` permission
  if (_.contains(req.user.permissions, 'admin')) {
    return next()
  }

  // guard.check logged user for requested permissions
  if (_.contains(req.user.permissions, permission)) {
    // TODO resolve issue on guard check and timeout
    // Error: Timeout of 10000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
    //console.log(req.user)
    //console.log(permission)
    return next()
    // return guard.check(permission)
  } else {
    // check user for ownership `own` permissions on requested path, context and action
    var chunks = permission.split(':')
    var context = chunks[0]
    var action = chunks[1]
    chunks.splice(1, 0, 'own')
    var ownPermission = chunks.join(':')
    console.log(ownPermission)
    if (_.contains(req.user.permissions, ownPermission)) {
      switch (context) {
        // `user:own:action`
        case 'user':
          switch (action) {
            case 'read':
              req.query.id = req.user.userId
              return next()
              break
            case 'update':
            case 'delete':
            console.log(req.query.id)
            console.log(req.user.userId)
              if (req.query.id === req.user.userId) {
                return next()
              }
              break
          }
          break

        // `project:own:action`
        case 'project':
          switch (action) {
            case 'read':
              // TODO `/projects` => Filter projects where logged user is member
              // `/projects` => Filter projects where logged user is author
              if (req.path === '/api/projects') {
                req.query.author_id = req.user.userId
              }

              // `/project_users` => Filter project members where logged user is set
              // `/rate_requests` => Filter rate requests where logged user is set
              // `/feedback_responses` => Filter feedback responses where logged user is set
              if (req.path === '/api/project_users' ||
                  req.path === '/api/rate_requests' ||
                  req.path === '/api/feedback_responses') {
                req.query.user_id = req.user.userId
              }
              return next()
              break

            case 'update':
            case 'delete':
              // TODO `/projects` => Update projects where logged user is member
              // `/projects` => Update projects where logged user is author
              if (req.path === '/api/projects') {
                Project.search({'id': req.query.id})
                .then(function (projects) {
                  if (projects[0].author.id === req.user.userId) {
                    return next()
                  } else {
                    throw new Error('Insufficient permissions')
                  }
                })
                .catch(function (err) {
                  return next(err)
                })
              }

              // `/project_users` => Update project members where logged user is set
              if (req.path === '/api/project_users') {
                ProjectUser.search({'id': req.query.id})
                .then(function (project_users) {
                  if (project_users[0].user.id === req.user.userId) {
                    return next()
                  } else {
                    throw new Error('Insufficient permissions')
                  }
                })
                .catch(function (err) {
                  return next(err)
                })
              }
              break
          }
          break

        // `feedback:own:action`
        case 'feedback':
          switch (action) {
            case 'create':
              // TODO `/feedback_responses` => Create feedback responses on projects where logged user is member
              return next()
              break
        }
        break
      }
    } else {
      return next(new Error('Insufficient permissions'))
    }
  }
}

module.exports = jwtAccess
