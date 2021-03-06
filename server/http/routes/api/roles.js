const Role = require('../../../models/role')
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

        Role.search(params)

        // send the response back
        .then(function (roles) {
          res.body = roles
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
        var newRole

        // disallow other fields besides those listed below
        newRole = new Role(_.pick(req.body, 'name', 'permissions'))
        newRole.save()

        // send the response back
        .then(function (role) {
          res.body = role
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
        var role
        var newAttributes

        // load the role
        Role.findById(req.query.id).exec()

        // find ids of selected permissions
        .then(function (roleFromDb) {
          role = roleFromDb
          if (role === null) {
            throw new Error('Role not found.')
          }
          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'permissions')
          if (newAttributes.permissions !== undefined && newAttributes.permissions.length > 0) {
            return Permission.find({'name': {'$in': newAttributes.permissions}}).select('_id').exec()
          } else {
            return []
          }
        })

        // save the role with permission ids
        .then(function (permissions) {
          newAttributes.permissions = permissions
          role = _.extend(role, newAttributes)
          return role.save()
        })

        // send the response back
        .then(function (role) {
          res.body = role
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
        Role.findById(req.query.id).exec()

        .then(function (role) {
          if (role !== null) {
            return role.remove()
          } else {
            throw new Error('Role not found.')
          }
        })

        // send the response back
        .then(function (role) {
          res.body = {message: 'Role has been deleted.'}
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
