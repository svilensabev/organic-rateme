const User = require('../../../server/models/user')
const Role = require('../../../server/models/role')
const data = require('./data/users.js')
const _ = require('underscore')

var createUsers = async function () {
  var res = []
  var dataInstance = JSON.parse(JSON.stringify(data))

  var roles
  roles = await Role.find().select('_id').exec()

  for (let element of dataInstance) {
    // sets random role from the roles array
    element.roles = _.sample(roles)
    const user = new User(element)
    await user.save()
    res.push(user)
  }
  return {message: 'Users created.', users: res}
}

module.exports = createUsers
