const Project = require('../../../models/project')
const User = require('../../../models/user')
const ProjectUser = require('../../../models/project_user')
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

        Project.search(params)

        // send the response back
        .then(function (projects) {
          res.body = projects
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
        var newProject
        if (req.body.author === undefined) {
          req.body.author = req.user.userId
        }
        // disallow other fields besides those listed below
        newProject = new Project(_.pick(req.body, 'name', 'author', 'users', 'clientFeedback'))
        newProject.save()

        // send the response back
        .then(function (project) {
          res.body = project
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
        var project
        var newAttributes

        if (req.body.author === undefined) {
          req.body.author = req.user.userId
        }

        // load the project
        Project.findById(req.query.id).exec()

        // find ids of selected users
        .then(function (projectFromDb) {
          project = projectFromDb
          if (project === null) {
            throw new Error('Project not found.')
          }
          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'author', 'users', 'clientFeedback')
          if (newAttributes.users !== undefined && newAttributes.users.length > 0) {
            return User.find({'email': {'$in': newAttributes.users}}).select('_id').exec()
          } else {
            return []
          }
        })

        // loop and save new row in ProjectUser collection
        // promise.all in action
        .then(function (users) {
          return Promise.all(users.map(user => {
            var project_user = {
              project: project._id,
              user: user,
              position: '',
              price: ''
            }
            var newProjectUser = new ProjectUser(project_user)
            return newProjectUser.save()
            .then(ProjectUser => {
              return ProjectUser._id
            })
          }))
        })

        // save the project with projectUser ids
        .then(function (projectUserIds) {
          newAttributes.users = projectUserIds
          project = _.extend(project, newAttributes)
          return project.save()
        })

        // send the response back
        .then(function (project) {
          res.body = project
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
        Project.findById(req.query.id).exec()

        .then(function (project) {
          if (project !== null) {
            return project.remove()
          } else {
            throw new Error('Project not found.')
          }
        })

        // send the response back
        .then(function (project) {
          res.body = {message: 'Project has been deleted.'}
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
