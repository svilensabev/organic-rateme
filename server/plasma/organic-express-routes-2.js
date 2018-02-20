var path = require('path')
var glob = require('glob-stream')
var sort = require('sort-stream')
var methods = require('methods').map(function (m) {
  return m.toUpperCase()
})

var loadHelpers = function (app, plasma, dna, done) {
  var helpers = {}
  var routesHelpersRootPath = path.join(process.cwd(), dna.helpers)
  // glob for action helpers
  glob.create(path.join(routesHelpersRootPath, dna.pattern))
    .on('data', function (file) {
      var helperId = file.path.split(routesHelpersRootPath).pop()
        .replace(path.sep, '')
        .replace(/\//g, path.sep)
      var sep = (path.sep === '\\' ? '\\\\' : path.sep)
      helperId = helperId.replace(path.extname(file.path), '')
        .replace(new RegExp(sep, 'g'), '/')
      helpers[helperId] = require(file.path)
      if (dna.log) {
        console.log('loaded helper', helperId, '->',
          file.path.split(routesHelpersRootPath).pop())
      }
    })
    .on('error', console.error)
    .on('end', function () {
      done(helpers)
    })
}

var wrapAsyncFunctions = function (app, method, url, fn) {
  if (!Array.isArray(fn) && fn.constructor && fn.constructor.name === 'AsyncFunction') {
    app[method](url, function (req, res, next) {
      fn(req, res).then(next).catch(next)
    })
  } else
  if (Array.isArray(fn)) {
    app[method](url, fn.map(f => {
      if (f.constructor && f.constructor.name === 'AsyncFunction') {
        return function (req, res, next) {
          f(req, res).then(next).catch(next)
        }
      } else {
        return f
      }
    }))
  } else {
    app[method](url, fn)
  }
}

var loadActions = function (app, plasma, dna, helpers, done) {
  var routesRootPath = path.join(process.cwd(), dna.path)
  // glob for action handlers
  glob.create(path.join(routesRootPath, dna.pattern)).pipe(sort(function (a, b) {
    if (a.path.indexOf('index') !== -1 && b.path.indexOf('index') === -1) {
      return -1
    }
    if (a.path.indexOf('index') === -1 && b.path.indexOf('index') !== -1) {
      return 1
    }
    if (a.path.indexOf('index') !== -1 && b.path.indexOf('index') !== -1) {
      return 0
    }
    if (a.path.indexOf('index') === -1 && b.path.indexOf('index') === -1) {
      return 0
    }
  }))
  .on('data', function (file) {
    var builder = require(file.path)
    if (typeof builder !== 'function') return
    var api = builder(plasma, dna, helpers)
    for (var key in api) {
      if (key.indexOf(' ') !== -1 || methods.indexOf(key) !== -1) {
        var method = key.split(' ').shift()
        var url = file.path.split(routesRootPath).pop()
        var sep = path.sep === '\\' ? '\\\\' : path.sep
        url = url.replace(path.extname(file.path), '')
          .replace(new RegExp(sep, 'g'), '/')
        if (key.indexOf(' ') !== -1) {
          url += key.split(' ').pop()
        }
        if (url.indexOf('/index') !== -1) {
          url = url.replace('/index', '')
        }
        if (url.indexOf('/_') !== -1) {
          url = url.replace(new RegExp('/_', 'g'), '/:')
        }
        if (dna.mount) {
          url = dna.mount + url
        }
        if (url === '') {
          url = '/'
        }
        if (method === '*') {
          wrapAsyncFunctions(app, 'all', url, api[key])
        } else {
          wrapAsyncFunctions(app, method.toLowerCase(), url, api[key])
        }
        if (dna.log) {
          console.log('mounted action ', '-', method, '-', url, '->',
            file.path.split(routesRootPath).pop())
        }
      }
    }
  })
  .on('error', console.error)
  .on('end', function () {
    done()
  })
}

module.exports = function (plasma, dna) {
  plasma.on(dna.reactOn, function (c) {
    var app = c.data
    if (dna.helpers && dna.path) {
      loadHelpers(app, plasma, dna, function (helpers) {
        loadActions(app, plasma, dna, helpers, function () {
          if (dna.emitReady) {
            plasma.emit(dna.emitReady, true)
          }
        })
      })
    } else
    if (dna.path) {
      loadActions(app, plasma, dna, {}, function () {
        if (dna.emitReady) {
          plasma.emit(dna.emitReady, true)
        }
      })
    }
  })
}
