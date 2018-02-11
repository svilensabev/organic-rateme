var jwt = require('jsonwebtoken')
var jwtUtils = {}

/*
 * sign with default (HMAC SHA256)
 */
jwtUtils.generateJwtToken = function (params, secret) {
  // TODO async error handling
  var token = jwt.sign(params, secret)
  return token
}

/*
 * verify JWT
 */
jwtUtils.verifyJwtToken = function (token, secret) {
  // TODO async error handling
  var decoded = jwt.verify(token, secret)
  return decoded
}

module.exports = jwtUtils
