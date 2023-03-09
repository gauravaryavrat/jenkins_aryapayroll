'use strict';
var mongoose = require('mongoose');
var sanitize = require('mongo-sanitize');
var validator = require('validator');
var shortid = require('shortid');

var logger = require('../utils/logger')(module);
var ContactInfo = require('./contact-info');
var PERMISSIONS = require('../constants/permissions');


var profileSchema = mongoose.Schema({
  contactInfo: {
    type: ContactInfo.schema,
    default: new ContactInfo()
  },
  imageUrl : {
    type: String,
  },
  timeZone: {
    type: String,
    default : "Asia/Kolkata"
  },
  permissionGroups: {
    type: [String],
    default: [PERMISSIONS.GROUP_PERMISSIONS.USER],
    enum: [
    PERMISSIONS.GROUP_PERMISSIONS.USER, PERMISSIONS.GROUP_PERMISSIONS.PLATERATE_ADMIN,
    PERMISSIONS.GROUP_PERMISSIONS.SALESPERSON, PERMISSIONS.GROUP_PERMISSIONS.RESTAURANT_ADMIN,
    PERMISSIONS.GROUP_PERMISSIONS.REFERRER]
  },
  referralId : String,
  referrerId : {
    type: String,
    required: [true, 'Referrer ID must be set'],
    default: shortid.generate
  },
});


module.exports = mongoose.model('UserProfile', profileSchema);
