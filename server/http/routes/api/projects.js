const Project = require('../../../models/project')
const User = require('../../../models/user')
const ProjectUser = require('../../../models/project_user')
const _ = require('underscore')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      Project.search(params)

      // send the response back
      .then(function (project) {
        res.body = project
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'POST': function (req, res, next) {
      var newProject

      // disallow other fields besides those listed below
      newProject = new Project(_.pick(req.body, 'name', 'clientFeedback'))
      newProject.save()

      // send the response back
      .then(function (project) {
        res.body = project
        next()
      })

      // catch all errors and call the error handler
      .catch(function (err) {
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'PUT': function (req, res, next) {
      var project
      var newAttributes

      // load the project
      Project.findById(req.query.id).exec()

      // find ids of selected users
      .then(function (projectFromDb) {
        project = projectFromDb
        if (project === null) {
          throw new Error('Project not found.')
        }
        // modify resource with allowed attributes
        newAttributes = _.pick(req.body, 'name', 'users', 'clientFeedback')
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
          var newProjectUser = new ProjectUser({project: project._id, user: user})
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
        res.body = {message: err.message, error: err.name}
        next()
      })
    },
    'DELETE': function (req, res, next) {
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
        res.body = {message: err.message, error: err.name}
        next()
      })
    }
  }
}
