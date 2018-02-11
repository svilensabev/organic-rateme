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
  var decoded = jwt.verify(token, secret)
  return decoded
}

/*
 * verify JWT
 */
jwtUtils.asyncVerifyJwtToken = function (token, secret) {
  return new Promise(
    function (resolve, reject) {
      jwt.verify(token, secret, function (err, decoded) {
        if (!err) {
          resolve(decoded)
        } else {
          reject(err)
        }
      })
    }
  )
}

module.exports = jwtUtils
