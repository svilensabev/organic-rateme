var faker = require('faker')

function dummyRateRequests () {
  var data = []
  var total = 10
  var object = {}

  for (var i = 0; i < total; i++) {
    object = {
      project: '',
      user: '',
      request: faker.lorem.sentence(),
      description: faker.lorem.paragraph()
    }
    data.push(object)
  }
  return data
}

module.exports = dummyRateRequests()
