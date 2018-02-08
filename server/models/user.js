const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
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
}
const User = mongoose.model('User', schema)
module.exports = User
