var jwt = require('jsonwebtoken')

var utils = global.utils = {}

utils.sqlLike = function (query, field, val) {
  return (field) ? query.regex(field, new RegExp(val, 'i')) : query
}

utils.sqlPaging = function (query, params) {
  query.skip(Number((params.offset ? params.offset : 0)))
  query.limit(Number((params.limit ? params.limit : 15)))
  return query
}

utils.sqlSort = function (query, params) {
  return (params.sort) ? query.sort((params.order === 'asc' ? '' : (params.order === 'desc' ? '-' : '')) + params.sort) : query
}

utils.sqlCount = function (query, params) {
  return (params.count) ? query.count() : query
}

/*
 * sign with default (HMAC SHA256)
 */
utils.generateJwtToken = function (params, secret) {
  var token = jwt.sign(params, secret)
  return token
}

/*
 * verify JWT
 */
utils.verifyJwtToken = function (token, secret) {
  var decoded = jwt.verify(token, secret)
  return decoded
}

module.exports = utils
