'use strict'
var Promise = require('bluebird');

// *************** USE THIS ONE WHEN GO LIVE
// var taxjar = require('taxjar')(process.env.TAXJAR_API_KEY);

var taxjar = require('../lib/taxjar-sandbox/taxjar')(process.env.TAXJAR_API_SANDBOX_KEY);


module.exports.taxRateGet = function (postalCode) {
	return new Promise(function(resolve, reject){
		taxjar.ratesForLocation((postalCode))
		.then(function(response){
			resolve(response); 
		})
		.catch(function(error){
			reject(error);
		});
	});
};
