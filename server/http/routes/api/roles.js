const Role = require('../../../models/role')
const Permission = require('../../../models/permission')
const _ = require('underscore')
const utils = require('../../../helpers/utils')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      // define mongoose query
      var query = Role.find({})
      if (params.name) {
        utils.sqlLike(query, 'name', params.name)
      }
      utils.sqlPaging(query, params)
      utils.sqlSort(query, params)
      utils.sqlCount(query, params)

      // execute query
      query.populate('permissions')
        .then(roles => {
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
      Role.findById(req.query.id, function (err, role) {
        if (!err) {
          if (role !== null) {
            var newAttributes

            // modify resource with allowed attributes
            newAttributes = _.pick(req.body, 'name', 'permissions')
            if (newAttributes.permissions.length > 0) {
              Permission.find({'name': {'$in': newAttributes.permissions}}).select('_id')
              .then(permissions => {
                newAttributes.permissions = permissions

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
              })
            }
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
      Role.findById(req.query.id, function (err, role) {
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
