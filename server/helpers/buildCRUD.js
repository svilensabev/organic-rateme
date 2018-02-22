var _ = require('lodash')

module.exports = function (Model, options) {
  options = options || {}

  var actions = {
    'POST': function (req, res, next) {
      var data = req.body
      var nonEditableFields = req.nonEditableFields || options.nonEditableFields || []
      data = _.omit(data, nonEditableFields)
      if (Model.fromJSON) {
        data = Model.fromJSON(data)
      }
      Model.create(data, function (err, model) {
        if (err) return next(err)
        res.body = model
        if (options.populate) {
          model.populate(options.populate, next)
        } else {
          next()
        }
      })
    },
    'GET': function (req, res, next) {
      if (!req.pattern) req.pattern = {}
      var page = parseInt(req.query.page, 10) || parseInt(req.headers.page, 10) || 1
      var paginateOptions = {
        page: page,
        populate: options.populate,
        sort: req.query.sort || req.sort || options.sort,
        select: options.listSelect
      }

      let limit = parseInt(req.query.limit, 10)

      if (_.isNaN(limit) && req.query.limit === 'false') {
        paginateOptions.limit = Number.MAX_SAFE_INTEGER
      } else {
        paginateOptions.limit = limit || parseInt(req.headers.limit, 10) || 10
      }

      Model.paginate(req.pattern, paginateOptions, function (err, results) {
        if (err) return next(err)
        const {
            docs, page, limit, total, pages
        } = results
        res.body = {
          data: docs,
          page,
          limit,
          total,
          pages
        }
        next()
      })
    },
    'GET /:mongoId': function (req, res, next) {
      req.pattern = req.pattern || {}
      req.pattern._id = req.params.mongoId
      var singleQuery = Model.findOne(req.pattern)
      if (options.populate) {
        singleQuery.populate(options.populate)
      }
      singleQuery.exec(function (err, model) {
        if (err) return next(err)
        res.body = model
        next()
      })
    },
    'PUT /:mongoId': function (req, res, next) {
      req.pattern = req.pattern || {}
      req.pattern._id = req.params.mongoId
      var data = req.body
      var nonEditableFields = req.nonEditableFields || options.nonEditableFields || []
      data = _.omit(data, nonEditableFields)
      if (Model.fromJSON) {
        data = Model.fromJSON(data)
      }
      Model.findOne(req.pattern, function (err, model) {
        if (err) return next(err)
        if (!model) return next()
        res.body = model
        if (res.body.overrideSet) {
          res.body.overrideSet(data)
        } else {
          res.body.set(data)
        }
        res.body._id = req.pattern._id
        res.body.save(function (err) {
          if (err) return next(err)
          if (options.populate) {
            model.populate(options.populate, next)
          } else {
            next()
          }
        })
      })
    },
    'DELETE /:mongoId': function (req, res, next) {
      req.pattern = req.pattern || {}
      req.pattern._id = req.params.mongoId
      Model.findOne(req.pattern, function (err, model) {
        if (err) return next(err)
        if (!model) return next()
        res.body = model
        if (model.delete) {
          if (req.user) {
            model.delete(req.user.id, next)
          } else {
            model.delete(next)
          }
        } else {
          model.remove(next)
        }
      })
    }
  }

  var actionsMapping = {
    'create': 'POST',
    'list': 'GET',
    'retrieve': 'GET /:mongoId',
    'update': 'PUT /:mongoId',
    'remove': 'DELETE /:mongoId',
    'patch': 'PATCH /:mongoId'
  }

  var hasActionOptions = options && options.actions
  if (hasActionOptions) {
    var preActions = {}
    var postActions = {}

    for (var name in options.actions) {
      if (_.isArray(options.actions[name]) && name.indexOf('-') === -1) {
        actions[actionsMapping[name]] = options.actions[name]
        continue
      }

      if (typeof options.actions[name] === 'function' && name.indexOf('-') === -1) {
        actions[actionsMapping[name]] = options.actions[name]
        continue
      }

      if (options.actions[name] === false && name.indexOf('-') === -1) {
        delete actions[actionsMapping[name]]
        continue
      }

      if (name.split('-').shift() === 'pre' && name.split('-').pop() === '*') {
        for (var preAllName in actions) {
          preActions[preAllName] = _.flatten([preActions[preAllName] || [], options.actions[name]])
        }
        continue
      }

      if (name.split('-').shift() === 'post' && name.split('-').pop() === '*') {
        for (var postAllName in actions) {
          postActions[postAllName] = _.flatten([postActions[postAllName] || [], options.actions[name]])
        }
        continue
      }

      if (name.split('-').shift() === 'pre') {
        var preName = actionsMapping[name.split('-').pop()]
        if (!preName) throw new Error('action not found ' + name)
        preActions[preName] = _.flatten([preActions[preName] || [], options.actions[name]])
        continue
      }

      if (name.split('-').shift() === 'post') {
        var postName = actionsMapping[name.split('-').pop()]
        if (!postName) throw new Error('action not found ' + name)
        postActions[postName] = _.flatten([postActions[postName] || [], options.actions[name]])
        continue
      }
    }

    for (var actionName in actions) {
      actions[actionName] = _.flatten([
        preActions[actionName] || [],
        actions[actionName],
        postActions[actionName] || []
      ])
    }
  }

  return actions
}
