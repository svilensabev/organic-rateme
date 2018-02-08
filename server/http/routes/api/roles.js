const Role = require('../../../models/role')
const _ = require('underscore')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      Role.find({}).then(roles => {
        res.status(200)
        res.body = roles
        next()
      })
    },
    'POST': function (req, res, next) {
      var newRole
      // disallow other fields besides those listed below
      newRole = new Role(_.pick(req.body, 'name', 'permissions'))
      newRole.save(function (err) {
        if (!err) {
          res.status(201)
          res.body = newRole
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    },
    'PUT': function (req, res, next) {
      Role.findById(req.query._id, function (err, role) {
        if (!err) {
          if (role !== null) {
            var newAttributes

            // modify resource with allowed attributes
            newAttributes = _.pick(req.body, 'name', 'permissions')
            role = _.extend(role, newAttributes)

            role.save(function (err) {
              if (!err) {
                res.status(200)
                res.body = role
              } else {
                res.status(403)
                res.body = err
              }
              next()
            })
          } else {
            res.body = {message: 'Role not found.'}
          }
        } else {
          res.status(403)
          res.body = err
        }
      })
    },
    'DELETE': function (req, res, next) {
      Role.findById(req.query._id, function (err, role) {
        if (!err) {
          if (role !== null) {
            role.remove()
            res.body = {message: 'Role has been deleted.'}
          } else {
            res.body = {message: 'Role not found.'}
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
