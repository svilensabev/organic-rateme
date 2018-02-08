const User = require('../../../models/user')
const Role = require('../../../models/role')
const _ = require('underscore')
let log = console.log

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      User.find({}).then(users => {
        res.status(200)
        res.body = users
        next()
      })
    },
    'POST': function (req, res, next) {
      var newUser
      // disallow other fields besides those listed below
      newUser = new User(_.pick(req.body, 'name', 'email', 'roles'))
      newUser.save(function (err) {
        if (!err) {
          res.status(201)
          res.body = newUser
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    },
    'PUT': function (req, res, next) {
      User.findById(req.query._id, function (err, user) {
        if (!err) {
          if (user !== null) {
            var newAttributes

            // modify resource with allowed attributes
            newAttributes = _.pick(req.body, 'name', 'email', 'roles')
            user = _.extend(user, newAttributes)

            user.save(function (err) {
              if (!err) {
                res.status(200)
                res.body = user
              } else {
                res.status(403)
                res.body = err
              }
              next()
            })
          } else {
            res.body = {message: 'User not found.'}
          }
        } else {
          res.status(403)
          res.body = err
        }
      })
    },
    'DELETE': function (req, res, next) {
      User.findById(req.query._id, function (err, user) {
        if (!err) {
          if (user !== null) {
            user.remove()
            res.body = {message: 'User has been deleted.'}
          } else {
            res.body = {message: 'User not found.'}
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
