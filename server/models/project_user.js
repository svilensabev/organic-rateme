const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  position: String,
  price: Number,
  assignedAt: { type: Date, default: Date.now },
})

schema.statics.search = function search (params) {
  var query = this.model('ProjectUser').find()

  // filters query by any provided parameter
  if (params.project_id) {
    query.find({'project': params.project_id})
  }
  if (params.user_id) {
    query.find({'user': params.user_id})
  }

  // sets paging, sort and count parameters
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('project')
  query.populate('user')
  return query.exec()
}

const ProjectUser = mongoose.model('ProjectUser', schema)
module.exports = ProjectUser
