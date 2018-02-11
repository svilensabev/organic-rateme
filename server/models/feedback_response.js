const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  rateRequest: {type: Schema.Types.ObjectId, ref: 'RateRequest'},
  state: {type: String, required: true},
  feedback: {type: String},
  createdAt: { type: Date, default: Date.now }
})

schema.statics.search = function search (params) {
  var query = this.model('FeedbackResponse').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'rateRequest', params.rate_id)
  dbUtils.sqlLike(query, 'state', params.state)
  dbUtils.sqlLike(query, 'feedback', params.feedback)

  // sets paging, sort and count parameters
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('rateRequest')
  return query.exec()
}

const FeedbackResponse = mongoose.model('FeedbackResponse', schema)
module.exports = FeedbackResponse
