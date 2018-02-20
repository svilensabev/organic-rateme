var mongoose = require('mongoose')
var asyncSeedDB = require('../server/helpers/seed.js')

module.exports = function (angel) {
  angel.on('db-seed', function () {
    require('organic-dna-loader')(function (err, dna) {
      if (err) throw err
      mongoose.connect('localhost', dna.server.database.name, function (err) {
        if (err) throw err
        // drop db initially
        mongoose.connection.db.dropDatabase(function (err) {
          if (err) throw err
        })
        // call execute method
        module.exports.execute(function (err, res) {
          if (err) {
            res = {message: err.message, error: err.name}
          }
          console.log(JSON.stringify(res, null, 2))
          process.exit(0)
        })
      })
    })
  })
  .example('angel db-seed')
  .description('1. imports valid | dummy data into database')
}

module.exports.execute = function (next) {
  asyncSeedDB()
  // send the response back
  .then(function (res) {
    next(null, res)
  })

  // catch all errors and call the error handler
  .catch(function (err) {
    next(err)
  })
}
