const mongoose = require('mongoose')

const schema = {
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
  }
}
const Permission = mongoose.model('Permission', schema)
module.exports = Permission
