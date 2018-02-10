const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
const utils = require('../../../helpers/utils')

module.exports = function (plasma, dna, helpers) {
  return {
    'POST': function (req, res, next) {
      var newUser
      // disallow other fields besides those listed below
      newUser = new User(_.pick(req.body, 'name', 'email'))
      newUser.save(function (err) {
        if (!err) {
          var params = {
            userId: newUser._id
          }
          var token = utils.generateJwtToken(params, dna.jwt_secret)
          res.status(201)
          res.body = token
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    }
  }
}
