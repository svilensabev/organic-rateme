const RateRequest = require('../../../server/models/rate_request')
const FeedbackResponse = require('../../../server/models/feedback_response')
const Project = require('../../../server/models/project')
const data = require('./data/rate_requests.js')
const _ = require('underscore')
var faker = require('faker')

var createRateRequests = async function () {
  var res = []
  var dataInstance = JSON.parse(JSON.stringify(data))

  var projects
  projects = await Project.find().populate('users').exec()

  for (let element of dataInstance) {
    var rate_request
    var feedbackStates = [
      'empty',
      'yes',
      'yes-now',
      'no',
      'not-now',
    ]
    // sets random project and one of its members randomly
    var randomProject = _.sample(projects)
    if (randomProject.users.length > 0) {
      element.project = randomProject._id
      // note that randomProject.users points to projectUser collection
      // we must get userId not projectUserId
      var user = _.sample(randomProject.users)
      element.user = user.user
      // saves rate request
      rate_request = new RateRequest(element)
      await rate_request.save()
      for (let user of randomProject.users) {
        if (element.user.toString() !== user.user.toString()) {
          var feedback_response = {
            rateRequest: rate_request._id,
            user: user.user,
            state: _.sample(feedbackStates),
            feedback: faker.lorem.paragraph()
          }
          var newFeedbackResponse = new FeedbackResponse(feedback_response)
          await newFeedbackResponse.save()
        }
      }
    }
    res.push(rate_request)
  }
  return {message: 'Rate requests created.', rate_request: res}
}

module.exports = createRateRequests
