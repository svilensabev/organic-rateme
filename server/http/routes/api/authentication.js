const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
const jwtUtils = require('../../../helpers/jwt-utils')

module.exports = function (plasma, dna, helpers) {
  return {
    'POST': function (req, res, next) {
      // find user by name and email and return JWT token
      User.findOne({
        'name': req.body.name,
        'email': req.body.email
      }).exec()

      // generate token for valid user
      .then(function (user) {
        if (user !== null && user._id !== null) {
          // define token payload
          var params = {
            userId: user._id,
            roles: user.roles
          }
          var token = jwtUtils.generateJwtToken(params, dna.jwt_secret)
          res.body = token
          next()
        } else {
          throw new Error('User not found.')
        }
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.body = {message: err.message, error: err.name}
        next()
      })
    }
  }
}
