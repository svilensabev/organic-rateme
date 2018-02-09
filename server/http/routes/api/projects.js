const Project = require('../../../models/project')
const User = require('../../../models/user')
const ProjectUser = require('../../../models/project_user')
const _ = require('underscore')
const utils = require('../../../helpers/utils')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      // define mongoose query
      var query = Project.find({})
      if (params.name) {
        utils.sqlLike(query, 'name', params.name)
      }
      if (params.user_id) {
        // todo join?
        utils.sqlLike(query, 'users', params.user_id)
      }
      utils.sqlPaging(query, params)
      utils.sqlSort(query, params)
      utils.sqlCount(query, params)

      // execute query
      query.populate('users')
        .then(projects => {
          res.status(200)
          res.body = projects
          next()
        })
    },
    'POST': function (req, res, next) {
      var newProject
      // disallow other fields besides those listed below
      newProject = new Project(_.pick(req.body, 'name', 'clientFeedback'))
      newProject.save(function (err) {
        if (!err) {
          res.status(201)
          res.body = newProject
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    },
    'PUT': function (req, res, next) {
      var project
      // load the project
      Project.findById(req.query.id).exec()

      // save the project with limited attributes
      .then(function (projectFromDb) {
        project = projectFromDb
        if (project !== null) {
          var newAttributes

          // modify resource with allowed attributes
          newAttributes = _.pick(req.body, 'name', 'clientFeedback')
          project = _.extend(project, newAttributes)
          return project.save()
        } else {
          // throw an error
          throw new Error('Project not found')
        }
      })

      // find ids of selected users
      .then(function (project) {
        return User.find({'name': {'$in': req.body.users}}).select('_id').exec()
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
        project.users = projectUserIds
        return project.save()
      })

      // send the response back
      .then(function (project) {
        res.body = project
        return res.body
      })
      // catch all errors and call the error handler;
      .then(null, next)
    },
    'DELETE': function (req, res, next) {
      Project.findById(req.query.id, function (err, project) {
        if (!err) {
          if (project !== null) {
            project.remove()
            res.body = {message: 'Project has been deleted.'}
          } else {
            res.body = {message: 'Project not found.'}
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
