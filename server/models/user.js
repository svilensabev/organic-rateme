const mongoose = require('mongoose')
var Schema = mongoose.Schema
const dbUtils = require('../helpers/db-utils')

const schema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  roles: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  createdAt: { type: Date, default: Date.now },
  rateUpdatedAt: { type: Date },
  rateNotificationAt: { type: Date }
})

schema.statics.search = function search (params) {
  var query = this.model('User').find()

  // filters query by any provided parameter
  dbUtils.sqlLike(query, 'name', params.name)
  dbUtils.sqlLike(query, 'email', params.email)

  // sets date filters, paging, sort and count parameters
  dbUtils.sqlDates(query, 'createdAt', params)
  dbUtils.sqlPaging(query, params)
  dbUtils.sqlSort(query, params)
  dbUtils.sqlCount(query, params)

  // executes query
  query.populate('roles')
  return query.exec()
}

const User = mongoose.model('User', schema)
module.exports = User
