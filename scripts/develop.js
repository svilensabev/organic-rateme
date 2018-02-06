module.exports = function (angel) {
  angel.on('develop', function (angel, next) {
    process.env.CELL_MODE = process.env.CELL_MODE || '_development'
    var parallel = require('organic-stem-devtools/lib/parallel-exec')
    parallel([
      'node ./node_modules/.bin/angel watch',
      'node ./node_modules/.bin/nodemon ./index.js'
    ])
  })
  .example('angel develop')
  .description('1. runs "angel watch" which builds and watches the client impl. for changes\n' +
               '2. starts the server and monitors for changes')

  angel.on('develop :part', function (angel, next) {
    process.env.CELL_MODE = process.env.CELL_MODE || '_development'
    var parallel = require('organic-stem-devtools/lib/parallel-exec')
    parallel([
      'node ./node_modules/.bin/angel watch "' + angel.cmdData.part + '"',
      'node ./node_modules/.bin/nodemon ./index.js'
    ])
  })
  .example('angel develop :part')
  .description('1. runs "angel watch :part" which builds and watches for changes the ":part" client impl.\n' +
               '2. starts the server and monitors for changes')
}
