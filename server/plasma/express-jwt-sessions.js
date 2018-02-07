var expressJwt = require('express-jwt');
var _ = require("underscore")

module.exports = function(plasma, dna) {
  plasma.on(dna.reactOn, function(c){
    var app = c.data || c[0].data

    var jwt = expressJwt({
          secret: dna.jwt_secret,
          credentialsRequired: false,
          getToken: function fromHeaderOrQuerystring (req) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                return req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query.token) {
              return req.query.token;
            }
            return null;
          }
        });

    app.use(jwt);

    plasma.on(dna.closeOn || "kill", function(c, next){

    })
  })
}
