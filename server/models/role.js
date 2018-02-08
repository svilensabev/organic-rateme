const mongoose = require('mongoose')
var Schema = mongoose.Schema

const schema = {
  name: {
    type: String,
    required: true
  },
  permissions: [{
    type: Schema.Types.ObjectId,
    ref: 'Permission'
  }]
}
const Role = mongoose.model('Role', schema)
module.exports = Role
