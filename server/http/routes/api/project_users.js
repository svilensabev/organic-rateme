const ProjectUser = require('../../../models/project_user')
const Project = require('../../../models/project')
const User = require('../../../models/user')
const _ = require('underscore')
const jwtAccess = require('../../../helpers/jwt-access')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': [
      function (req, res, next) {
        return jwtAccess.check('project:read', req, res, next)
      },
      function (req, res, next) {
        var params = req.query

        ProjectUser.search(params)

        // send the response back
        .then(function (project_users) {
          res.body = project_users
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
        return jwtAccess.check('project:create', req, res, next)
      },
      function (req, res, next) {
        var newProjectUser

        // disallow other fields besides those listed below
        newProjectUser = new ProjectUser(_.pick(req.body, 'project', 'user', 'position', 'price'))
        newProjectUser.save()

        // send the response back
        .then(function (project_user) {
          res.body = project_user
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
        return jwtAccess.check('project:update', req, res, next)
      },
      function (req, res, next) {
        var project_user
        var newAttributes

        ProjectUser.findById(req.query.id).exec()

        // find id of selected project
        .then(function (FromDb) {
          project_user = FromDb
          if (project_user === null) {
            throw new Error('Record not found.')
          }
          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'project', 'user', 'position', 'price')
          if (newAttributes.project) {
            return Project.findOne({'name': newAttributes.project}).select('_id').exec()
          }
        })

        // find id of selected user
        .then(function (project) {
          newAttributes.project = project

          if (newAttributes.user) {
            return User.findOne({'email': newAttributes.user}).select('_id').exec()
          }
        })

        // update the record
        .then(function (user) {
          newAttributes.user = user

          project_user = _.extend(project_user, newAttributes)
          return project_user.save()
        })

        // send the response back
        .then(function (project_user) {
          res.body = project_user
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
        return jwtAccess.check('project:delete', req, res, next)
      },
      function (req, res, next) {
        ProjectUser.findById(req.query.id).exec()

        .then(function (project_user) {
          if (project_user !== null) {
            return project_user.remove()
          } else {
            throw new Error('User not found in project.')
          }
        })

        // send the response back
        .then(function (project_user) {
          res.body = {message: 'User has been deleted from project.'}
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
