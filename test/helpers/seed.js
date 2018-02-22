const createPermissions = require('./suites/create-permissions')
const createRoles = require('./suites/create-roles')
const createUsers = require('./suites/create-users')
const createProjects = require('./suites/create-projects')
const createRateRequests = require('./suites/create-rate-requests')

var asyncSeedDB = async function () {
  var res = []
  try {
    console.log('startSeed')
    var permissions = await createPermissions()
    res.push(permissions)

    var roles = await createRoles()
    res.push(roles)

    var users = await createUsers()
    res.push(users)

    var projects = await createProjects()
    res.push(projects)

    var rateRequests = await createRateRequests()
    res.push(rateRequests)
    console.log('endSeed')
  } catch(e) {
      console.log(e)
  }

  return res
}

module.exports = asyncSeedDB
