'use strict';

var Yelp = require('yelp-fusion'); //Yelp API
var Promise = require('bluebird');

//pRate Yelp credentials
const apiKey = process.env.YELP_API_KEY;
var yelp = Yelp.client(apiKey);


//getBusiness function
module.exports.getBusiness = function(businessId){
  return yelp.business(businessId).then(res => {
    return res.jsonBody;
  })
  .catch(err => {
    return err;
  });
};


module.exports.search = function(params){
  return yelp.search(params).then(res => {
    return res.jsonBody;
  })
  .catch(err => {
    return err;
  });
};

module.exports.phoneSearch = function(params){
  return yelp.phoneSearch(params).then(res => {
    return res.jsonBody;
  })
  .catch(err => {
    return err;
  });
};
