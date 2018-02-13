const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }]
})

schema.statics.search = function search (params) {
  var query = this.model('Role').find()

  // filters query by any provided parameter
  if (params.id) {
    query.find({'_id': params.id})
  }
  if (params.permission_id) {
    query.find({'permissions': params.permission_id})
  }
  dbUtils.sqlLike(query, 'name', params.name)

  // sets paging, sort and count parameters
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('permissions')
  return query.exec()
}

const Role = mongoose.model('Role', schema)
module.exports = Role
