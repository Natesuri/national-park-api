const mongoose = require('mongoose')

const favoriteParksSchema = new mongoose.Schema({
  list: {
    type: Array,
    required: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('FavoriteParks', favoriteParksSchema)
