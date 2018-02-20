const Role = require('../../../server/models/role')
const Permission = require('../../../server/models/permission')
const data = require('./data/roles.json')

var createRoles = async function () {
  var res = []
  var dataInstance = JSON.parse(JSON.stringify(data))

  for (let element of dataInstance) {
    var permissions = await Permission.find({'name': {'$in': element.permissions}}).select('_id').exec()
    element.permissions = permissions
    const role = new Role(element)
    await role.save()
    res.push(role)
  }
  return {message: 'Roles created.', roles: res}
}

module.exports = createRoles
