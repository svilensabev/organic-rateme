var dbUtils = {}

dbUtils.sqlLike = function (query, field, val) {
  return (field) ? query.regex(field, new RegExp(val, 'i')) : query
}

dbUtils.sqlPaging = function (query, params) {
  query.skip(Number((params.offset ? params.offset : 0)))
  query.limit(Number((params.limit ? params.limit : 15)))
  return query
}

dbUtils.sqlSort = function (query, params) {
  return (params.sort) ? query.sort((params.order === 'asc' ? '' : (params.order === 'desc' ? '-' : '')) + params.sort) : query
}

dbUtils.sqlCount = function (query, params) {
  return (params.count) ? query.count() : query
}

dbUtils.sqlDates = function (query, field, params) {
  if (params.before) {
    query.find({[field]: {'$lte': params.before}})
  }
  if (params.after) {
    query.find({[field]: {'$gte': params.after}})
  }
  return query
}

module.exports = dbUtils
