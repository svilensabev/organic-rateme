const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
  project: {type: Schema.Types.ObjectId, ref: 'Project'},
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  position: String,
  price: Number,
  assignedAt: { type: Date, default: Date.now },
}
const ProjectUser = mongoose.model('ProjectUser', schema)
module.exports = ProjectUser
