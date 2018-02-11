const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  request: {type: String, required: true},
  description: {type: String},
  createdAt: { type: Date, default: Date.now }
})

schema.statics.search = function search (params) {
  var query = this.model('RateRequest').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'project', params.project_id)
  dbUtils.sqlLike(query, 'user', params.user_id)

  // sets paging, sort and count parameters
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
