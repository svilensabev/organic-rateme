const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  rateRequest: {type: Schema.Types.ObjectId, ref: 'RateRequest'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  state: {type: String, required: true},
  feedback: {type: String},
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
})

schema.statics.search = function search (params) {
  var query = this.model('FeedbackResponse').find()

  // filters query by any provided parameter
  if (params.id) {
    query.find({'_id': params.id})
  }
  if (params.rate_id) {
    query.find({'rateRequest': params.rate_id})
  }
  if (params.user_id) {
    query.find({'user': params.user_id})
  }
  if (params.state) {
    query.find({'state': {'$in': params.state}})
  }
  dbUtils.sqlLike(query, 'feedback', params.feedback)

  // sets date filters, paging, sort and count parameters
  dbUtils.sqlDates(query, 'createdAt', params)
  dbUtils.sqlDates(query, 'respondedAt', params)
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('rateRequest')
  query.populate('user')
  return query.exec()
}

const FeedbackResponse = mongoose.model('FeedbackResponse', schema)
module.exports = FeedbackResponse
