const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  request: {type: String, required: true},
  description: {type: String},
  createdAt: { type: Date, default: Date.now }
}
const RateRequest = mongoose.model('RateRequest', schema)
module.exports = RateRequest
