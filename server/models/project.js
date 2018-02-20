const mongoose = require('mongoose')
const ProjectUser = require('./project_user')
const FeedbackResponse = require('./feedback_response')
const RateRequest = require('./rate_request')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'ProjectUser'
  }],
  createdAt: { type: Date, default: Date.now },
  clientFeedback: { type: Boolean }
})

schema.pre('remove', function (next) {
  var self = this
  ProjectUser.find({'project': self._id}).remove().exec()
  .then(function () {
    return RateRequest.find({'project': self._id}).select('_id').exec()
  })
  .then(function (rate_requests) {
    if (rate_requests !== undefined && rate_requests.length > 0) {
      RateRequest.find({'_id': {'$in': rate_requests}}).remove().exec()
      return FeedbackResponse.find({'rateRequest': {'$in': rate_requests}}).remove().exec()
    } else {
      return []
    }
  })
  .then(function (feedback_responses) {
    next()
  })
  .catch(function (err) {
    next(err)
  })
})

schema.statics.search = function search (params) {
  var query = this.model('Project').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'name', params.name)
  if (params.id) {
    query.find({'_id': params.id})
  }
  if (params.author_id) {
    query.find({'author': params.author_id})
  }
  if (params.user_id) {
    // TODO how to filter by user_id.
    // users[] store projectUserIds and gets populated from ProjectUser model
    // inside ProjectUser there is user._id
    // (unwind|aggregate)
    query.find({'users': params.user_id})
  }

  // sets date filters, paging, sort and count parameters
  dbUtils.sqlDates(query, 'createdAt', params)
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('author')
  query.populate('users')
  return query.exec()
}

const Project = mongoose.model('Project', schema)
module.exports = Project
