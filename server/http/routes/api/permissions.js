const Permission = require('../../../models/permission')
const _ = require('underscore')
const jwtAccess = require('../../../helpers/jwt-access')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': [
      function (req, res, next) {
        return jwtAccess.check('admin', req, res, next)
      },
      function (req, res, next) {
        var params = req.query

        Permission.search(params)

        // send the response back
        .then(function (permissions) {
          res.body = permissions
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
        return jwtAccess.check('admin', req, res, next)
      },
      function (req, res, next) {
        var newPermission

        // disallow other fields besides those listed below
        newPermission = new Permission(_.pick(req.body, 'name', 'title'))
        newPermission.save()

        // send the response back
        .then(function (permission) {
          res.body = permission
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
        return jwtAccess.check('admin', req, res, next)
      },
      function (req, res, next) {
        var permission
        var newAttributes

        // load the user
        Permission.findById(req.query.id).exec()

        // find ids of selected permissions
        .then(function (permissionFromDb) {
          permission = permissionFromDb
          if (permission === null) {
            throw new Error('Permission not found.')
          }
          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'title')
          permission = _.extend(permission, newAttributes)
          return permission.save()
        })

        // send the response back
        .then(function (permission) {
          res.body = permission
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
        Permission.findById(req.query.id).exec()

        .then(function (permission) {
          if (permission !== null) {
            return permission.remove()
          } else {
            throw new Error('Permission not found.')
          }
        })

        // send the response back
        .then(function (permission) {
          res.body = {message: 'Permission has been deleted.'}
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
