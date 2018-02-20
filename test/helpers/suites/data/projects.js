var faker = require('faker')

function dummyProjects () {
  var data = []
  var total = 10
  var object = {}

  for (var i = 0; i < total; i++) {
    object = {
      name: faker.company.companyName(),
      users: [],
      clientFeedback: faker.random.boolean()
    }
    data.push(object)
  }
  return data
}

module.exports = dummyProjects()
