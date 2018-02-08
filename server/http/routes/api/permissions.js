const Permission = require('../../../models/permission')
const _ = require('underscore')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      Permission.find({}).then(permissions => {
        res.status(200)
        res.body = permissions
        next()
      })
    },
    'POST': function (req, res, next) {
      var newPermission
      // disallow other fields besides those listed below
      newPermission = new Permission(_.pick(req.body, 'name', 'title'))
      newPermission.save(function (err) {
        if (!err) {
          res.status(201)
          res.body = newPermission
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    },
    'PUT': function (req, res, next) {
      Permission.findById(req.query._id, function (err, permission) {
        if (!err) {
          if (permission !== null) {
            var newAttributes

            // modify resource with allowed attributes
            newAttributes = _.pick(req.body, 'name', 'title')
            permission = _.extend(permission, newAttributes)

            permission.save(function (err) {
              if (!err) {
                res.status(200)
                res.body = permission
              } else {
                res.status(403)
                res.body = err
              }
              next()
            })
          } else {
            res.body = {message: 'Permission not found.'}
          }
        } else {
          res.status(403)
          res.body = err
        }
      })
    },
    'DELETE': function (req, res, next) {
      Permission.findById(req.query._id, function (err, permission) {
        if (!err) {
          if (permission !== null) {
            permission.remove()
            res.body = {message: 'Permission has been deleted.'}
          } else {
            res.body = {message: 'Permission not found.'}
          }
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    }
  }
}
