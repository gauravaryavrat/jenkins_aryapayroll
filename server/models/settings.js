'use strict';
var mongoose = require('mongoose');

var settingsSchema = mongoose.Schema({
  parentUserId:{type:String},
  postingHours: formattedHoursSchema,
  createdBy:{type:String},
  createdAt:{type:Date,default:Date.now()},
});

module.exports = mongoose.model('Settings', settingsSchema);
