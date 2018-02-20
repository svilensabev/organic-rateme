const Permission = require('../../../server/models/permission')
const data = require('./data/permissions.json')

var createPermissions = async function () {
  var res = []
  var dataInstance = JSON.parse(JSON.stringify(data))

  for (let element of dataInstance) {
    const permission = new Permission(element)
    await permission.save()
    res.push(permission)
  }
  return {message: 'Permissions created.', permissions: res}
}

module.exports = createPermissions
