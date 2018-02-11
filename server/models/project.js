const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'ProjectUser'
  }],
  createdAt: { type: Date, default: Date.now },
  clientFeedback: { type: Boolean }
})

schema.statics.search = function search (params) {
  var query = this.model('Project').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'name', params.name)

  if (params.user_id) {
    // TODO how to filter by user_id.
    // users[] store projectUserIds and gets populated from ProjectUser model
    // inside ProjectUser there is user._id
    // (unwind|aggregate)
    query.find({'users': params.user_id})
  }

  // sets paging, sort and count parameters
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('users')
  return query.exec()
}

const Project = mongoose.model('Project', schema)
module.exports = Project
