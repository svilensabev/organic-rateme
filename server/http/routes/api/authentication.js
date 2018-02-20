const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
const jwtAccess = require('../../../helpers/jwt-access')

module.exports = function (plasma, dna, helpers) {
  return {
    'POST': function (req, res, next) {
      var loggedUser

      // find user by email and return JWT token
      User.findOne({
        'email': req.body.email
      }).exec()

      // get user roles and permissions
      .then(function (user) {
        loggedUser = user
        if (loggedUser !== null && loggedUser._id !== null) {
          return Role.find({'_id': {'$in': loggedUser.roles}}).populate('permissions').exec()
        } else {
          throw new Error('User not found.')
        }
      })

      // generate token for valid user
      .then(function (roles) {
        if (roles !== null && roles.length > 0) {
          loggedUser.rolesNames = []
          loggedUser.permissions = []
          _.each(roles, function (role, i, list) {
            loggedUser.rolesNames.push(role.name)
            _.each(role.permissions, function (perm, j, list2) {
              if (!_.contains(loggedUser.permissions, perm.name)) {
                loggedUser.permissions.push(perm.name)
              }
            })
          })
        }
        // define token payload
        var params = {
          userId: loggedUser._id,
          roles: loggedUser.rolesNames,
          permissions: loggedUser.permissions
        }
        var token = jwtAccess.generateJwtToken(params, dna.jwt_secret)
        res.body = token
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.status(403)
        res.body = {message: err.message, error: err.name}
        next(err)
      })
    }
  }
}
