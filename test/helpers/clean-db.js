var mongoose = require('mongoose')

test.cleanDB = function (done) {
  const OrganicMongoose = require('organic-mongoose')
  const Plasma = require('organic-plasma')
  let dna = {database: test.variables.dna.server.database}
  let plasma = new Plasma()
  plasma.on('Mongoose', function (c) {
    mongoose.connection.db.dropDatabase(function (err) {
      console.log('dropDatabase')
      test.variables.organelles.mongoose.disconnect(null, done)
    })
  })
  test.variables.organelles.mongoose = new OrganicMongoose(plasma, dna)
}
