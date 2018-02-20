var faker = require('faker')

function dummyUsers () {
  var data = []
  var total = 10
  var object = {}

  for (var i = 0; i < total; i++) {
    object = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      roles: [],
      rateUpdatedAt: Date.now(),
      rateNotificationAt: faker.date.future()
    }
    data.push(object)
  }
  return data
}

module.exports = dummyUsers()
