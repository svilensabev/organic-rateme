const createPermissions = require('../../test/helpers/suites/create-permissions')
const createRoles = require('../../test/helpers/suites/create-roles')
const createUsers = require('../../test/helpers/suites/create-users')
const createProjects = require('../../test/helpers/suites/create-projects')
const createRateRequests = require('../../test/helpers/suites/create-rate-requests')

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
