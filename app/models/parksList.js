const mongoose = require('mongoose')

const parksListSchema = new mongoose.Schema({
  list: {
    type: Array,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('ParksList', parksListSchema)
