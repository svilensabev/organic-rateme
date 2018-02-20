const mongoose = require('mongoose')
const FeedbackResponse = require('./feedback_response')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  request: {type: String, required: true},
  description: {type: String},
  createdAt: { type: Date, default: Date.now }
})

schema.pre('remove', function (next) {
  var self = this
  FeedbackResponse.find({'rateRequest': self._id}).remove().exec()
  .then(function (feedback_responses) {
    next()
  })
  .catch(function (err) {
    next(err)
  })
})

schema.statics.search = function search (params) {
  var query = this.model('RateRequest').find()

  // filters query by any provided parameter
  if (params.id) {
    query.find({'_id': params.id})
  }
  if (params.project_id) {
    query.find({'project': params.project_id})
  }
  if (params.user_id) {
    query.find({'user': params.user_id})
  }

  dbUtils.sqlDates(query, 'createdAt', params)
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('project')
  query.populate('user')
  return query.exec()
}

const RateRequest = mongoose.model('RateRequest', schema)
module.exports = RateRequest
