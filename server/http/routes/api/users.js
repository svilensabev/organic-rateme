const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
const jwtAccess = require('../../../helpers/jwt-access')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': [
      function (req, res, next) {
        return jwtAccess.check('user:read', req, res, next)
      },
      function (req, res, next) {
        var params = req.query
        console.log(params)
        User.search(params)

        // send the response back
        .then(function (users) {
          res.body = users
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
        // allow public user registration
        return next()
        // return jwtAccess.check('user:create', req, res, next)
      },
      function (req, res, next) {
        var newUser

        // disallow other fields besides those listed below
        newUser = new User(_.pick(req.body, 'name', 'email', 'roles', 'rateUpdatedAt', 'rateNotificationAt'))
        newUser.save()

        // send the response back
        .then(function (user) {
          res.body = user
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
        return jwtAccess.check('user:update', req, res, next)
      },
      function (req, res, next) {
        var user
        var newAttributes

        // load the user
        User.findById(req.query.id).exec()

        // find ids of selected roles
        .then(function (userFromDb) {
          user = userFromDb
          if (user === null) {
            throw new Error('User not found.')
          }
          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'email', 'roles', 'rateUpdatedAt', 'rateNotificationAt')
          if (newAttributes.roles !== undefined && newAttributes.roles.length > 0) {
            return Role.find({'name': {'$in': newAttributes.roles}}).select('_id').exec()
          } else {
            return []
          }
        })

        // save the user with role ids
        .then(function (roles) {
          newAttributes.roles = roles
          user = _.extend(user, newAttributes)
          return user.save()
        })

        // send the response back
        .then(function (user) {
          res.body = user
          next()
        })
        // catch all errors and call the error handler
        .catch(function (err) {
          console.log(err)
          res.status(403)
          res.body = {message: err.message, error: err.name}
          next(err)
        })
      }
    ],
    'DELETE': [
      function (req, res, next) {
        return jwtAccess.check('user:delete', req, res, next)
      },
      function (req, res, next) {
        User.findById(req.query.id).exec()

        .then(function (user) {
          if (user !== null) {
            return user.remove()
          } else {
            throw new Error('User not found.')
          }
        })

        // send the response back
        .then(function (user) {
          res.body = {message: 'User has been deleted.'}
          next()
        })

        // catch all errors and call the error handler
        .catch(function (err) {
          console.log(err)
          res.status(403)
          res.body = {message: err.message, error: err.name}
          next(err)
        })
      }
    ]
  }
}
