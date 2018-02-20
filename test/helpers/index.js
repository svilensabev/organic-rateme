/**
 * define CELL_MODE if not present
 */
process.env.CELL_MODE = process.env.CELL_MODE || '_test'

var path = require('path')
var chai = require('chai')
var _ = require('lodash')
var chaiJWT = require('chai-jwt')

global.expect = chai.expect

var test = global.test = {}
var variables = test.variables = {
  cell: null,
  dna: null,
  httpendpoint: 'http://127.0.0.1:13371',
  apiendpoint: 'http://127.0.0.1:13371/api',
  uploadsDir: path.join(process.cwd(), '/test/uploads'),
  organelles: {}
}

require('./clean-uploads')
require('./uploads')
require('./clean-db')
var asyncSeedDB = require('../../server/helpers/seed.js')

test.initTestEnv = function (done) {
  var loadDna = require('organic-dna-loader')

  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
    // application specific logging, throwing an error, or other logic here
  })

  loadDna(function (err, dna) {
    if (err) return done(err)

    test.variables.dna = dna

    test.cleanUploads(function () {
      test.cleanDB(done)
    })
    chai.use(chaiJWT)
  })
}

test.startServer = function (next) {
  test.initTestEnv(function (err) {
    if (err) return next(err)
    var cell = variables.cell = require('../../server/start')()
    var readyChemcals = _.get(test.variables, 'dna.server.processes.index.membrane.organic-express-server.expressSetupDoneOnce', ['ApiRoutesReady'])
    cell.plasma.on(readyChemcals, async function (err) {
      if (err instanceof Error) return next(err)
      console.log('startServer')
      var res = await test.asyncSeedDB()
      console.log('endAsyncSeedDB')
      next && next()
    })
  })
}

test.stopServer = function (next) {
  console.log('stopServer')
  variables.cell.plasma.emit('kill', next)
}

test.asyncSeedDB = async function () {
  console.log('asyncSeedDB')
  await asyncSeedDB()
}
