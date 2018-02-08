const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
  rateRequest: {type: Schema.Types.ObjectId, ref: 'RateRequest'},
  state: {type: String, required: true},
  feedback: {type: String},
  createdAt: { type: Date, default: Date.now }
}
const FeedbackResponse = mongoose.model('FeedbackResponse', schema)
module.exports = FeedbackResponse
