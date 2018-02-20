const Project = require('../../../server/models/project')
const User = require('../../../server/models/user')
const ProjectUser = require('../../../server/models/project_user')
const data = require('./data/projects.js')
const _ = require('underscore')
var faker = require('faker')

var createProjects = async function () {
  var res = []
  var dataInstance = JSON.parse(JSON.stringify(data))

  var users
  users = await User.find().select('_id').exec()

  for (let element of dataInstance) {
    const project = new Project(element)
    await project.save();
    // sets random users (between 0 and 3) from the users array
    var randomAuthor = _.sample(users, 1)
    var randomUsers = _.sample(users, _.random(4))
    var randomProjectUsers = []
    for (let user of randomUsers) {
      var project_user = {
        project: project._id,
        user: user._id,
        position: faker.name.jobTitle(),
        price: faker.finance.amount()
      }
      var newProjectUser = new ProjectUser(project_user)
      await newProjectUser.save()
      randomProjectUsers.push(newProjectUser._id)
    }
    project.author = randomAuthor[0]._id
    project.users = randomProjectUsers
    await project.save()
    res.push(project)
  }
  return {message: 'Projects created.', projects: res}
}

module.exports = createProjects
