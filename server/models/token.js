'use strict';
var mongoose = require('mongoose');
var crypto = require('../lib/crypto');

var tokenSchema = mongoose.Schema({
  token: {
    type: String,
    default: crypto.randomString
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireHours: {
    type: Number,
    default: 24
  }
});

tokenSchema.virtual('expireMilliseconds').get(function() {
  return(this.expireHours * 60 * 60 * 1000);
});

tokenSchema.virtual('isExpired').get(function() {
  var ageMillis = Date.now - this.createdAt;
  return(this.expireMilliseconds < ageMillis);
});

module.exports = mongoose.model('Token', tokenSchema);
