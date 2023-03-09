'use strict';

var Promise = require('bluebird');

module.exports.restaurantGet = function(param){
  var db = param.db;
  var venueId = param.venueId;

  return new Promise(function(resolve, reject){
    db.collection('venueMenus').findOne({"venueId": venueId}, function(error, data){
      if (error) { reject(error); }
      else { 
      	var restaurant = {
      		venueId: venueId,
      		name: data.name,
      		address: data.location.address,
      		crossStreet: data.location.crossStreet,
      		postalCode: data.location.postalCode,
      		city: data.location.city,
      		state: data.location.state,
      		cc: data.location.cc,
      		country: data.location.country
      	};

      	resolve(restaurant); 
      }
    });
  });
};
