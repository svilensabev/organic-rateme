module.exports = function (app, dna) {
  // default not found handler
  app.use(function (req, res, next) {
    res.status(404)
    if (dna.views) {
      res.render('404')
    } else {
      res.end()
    }
  })
  // default error handler
  app.use(function (err, req, res, next) {
    if (err.code === 'permission_denied') {
      res.status(401).send('Insufficient permissions')
    }
    res.body = {message: err.message, error: err.name}
    res.status(403)
    return res.json(res.body)
  })
}
