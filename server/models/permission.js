const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
  }
})

schema.statics.search = function search (params) {
  var query = this.model('Permission').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'name', params.name)

  // sets paging, sort and count parameters
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  return query.exec()
}

const Permission = mongoose.model('Permission', schema)
module.exports = Permission
