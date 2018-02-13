const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
const jwtUtils = require('../../../helpers/jwt-utils')
// var guard = require('express-jwt-permissions')()

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query
      var loggedUser

      if (params.token) {
        jwtUtils.asyncVerifyJwtToken(params.token, dna.jwt_secret)

        .then(function (decoded) {
          loggedUser = decoded
          if (loggedUser.userId) {
            // execute query
            return User.search(params)
          } else {
            throw new Error('User not found for provided token.')
          }
        })

        // send the response back
        .then(function (users) {
          res.body = users
          next()
        })

        // catch all errors and call the error handler
        .catch(function (err) {
          res.status(403)
          res.body = {message: err.message, error: err.name}
          next()
        })
      } else {
        var err = new Error('Token not provided.')
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      }
    },
    'POST': function (req, res, next) {
      var newUser

      // disallow other fields besides those listed below
      newUser = new User(_.pick(req.body, 'name', 'email'))
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
        next()
      })
    },
    'PUT': function (req, res, next) {
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
        newAttributes = _.pick(req.body, 'name', 'email', 'roles')
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
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'DELETE': function (req, res, next) {
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
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next()
      })
    }
  }
}
