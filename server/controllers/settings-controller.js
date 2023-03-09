'use strict';

var config = require('../config');
var ObjectID = require('mongodb').ObjectID;


module.exports.listAll = function (req, res) {
  res.send({status: 'success',message:"Settings List Success"})
}

module.exports.save = function (req, res) {
  res.send({status: 'success',message:"Settings updated successfully"})
}