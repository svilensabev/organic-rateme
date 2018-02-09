const ProjectUser = require('../../../models/project_user')
const Project = require('../../../models/project')
const User = require('../../../models/user')
const _ = require('underscore')
const utils = require('../../../helpers/utils')

module.exports = function (plasma, dna, helpers) {
  return {
    'GET': function (req, res, next) {
      var params = req.query

      // define mongoose query
      var query = ProjectUser.find({})
      if (params.project_id) {
        utils.sqlLike(query, 'project', params.project_id)
      }
      if (params.user_id) {
        utils.sqlLike(query, 'user', params.user_id)
      }
      utils.sqlPaging(query, params)
      utils.sqlSort(query, params)
      utils.sqlCount(query, params)

      // execute query
      query.populate('project')
        .populate('user')
        .then(project_users => {
          res.status(200)
          res.body = project_users
          next()
        })
    },
    'POST': function (req, res, next) {
      var newProjectUser
      // disallow other fields besides those listed below
      newProjectUser = new ProjectUser(_.pick(req.body, 'project', 'user'))
      newProjectUser.save(function (err) {
        if (!err) {
          res.status(201)
          res.body = newProjectUser
        } else {
          res.status(403)
          res.body = err
        }
        next()
      })
    },
    'PUT': function (req, res, next) {
      ProjectUser.findById(req.query.id, function (err, project_user) {
        if (!err) {
          if (project_user !== null) {
            var newAttributes

            // modify resource with allowed attributes
            newAttributes = _.pick(req.body, 'project', 'user')
            if (newAttributes.project.length > 0) {
              Project.find({'name': {'$in': newAttributes.project}}).select('_id').then(project => {
                newAttributes.project = project

                if (newAttributes.user.length > 0) {
                  User.find({'name': {'$in': newAttributes.user}}).select('_id').then(user => {
                    newAttributes.user = user

                    project_user = _.extend(project_user, newAttributes)
                    project_user.save(function (err) {
                      if (!err) {
                        res.status(200)
                        res.body = project_user
                      } else {
                        res.status(403)
                        res.body = err
                      }
                      next()
                    })
                  })
                }
              })
            }
          } else {
            res.body = {message: 'Record not found.'}
          }
        } else {
          res.status(403)
          res.body = err
        }
      })
    },
    'DELETE': function (req, res, next) {
      ProjectUser.findById(req.query.id, function (err, project_user) {
        if (!err) {
          if (project_user !== null) {
            project_user.remove()
            res.body = {message: 'User has been deleted from project.'}
          } else {
            res.body = {message: 'User not found in project.'}
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
