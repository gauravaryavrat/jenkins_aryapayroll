'use strict';

var config = require('../config');
var ObjectID = require('mongodb').ObjectID;


module.exports.listAll = function (req, res) {
  res.send({status: 'success',message:"Account List Success"})
}

module.exports.addAccount = function (req, res) {
  res.send({status: 'success',message:"Account added successfully"})
}

module.exports.editAccount = function (req, res) {
  res.send({status: 'success',message:"Account updated successfully"})
}

module.exports.deleteAccount = function (req, res) {
  res.send({status: 'success',message:"Account deleted successfully"})
}