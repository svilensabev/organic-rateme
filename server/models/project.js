const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
  name: {
    type: String,
    required: true,
    index: true
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'ProjectUser'
  }],
  createdAt: { type: Date, default: Date.now },
  clientFeedback: { type: Boolean }
}
const Project = mongoose.model('Project', schema)
module.exports = Project
