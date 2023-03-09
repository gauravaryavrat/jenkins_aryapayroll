'use strict';

var config     	= require('../config_qbo'),
QuickBooks 		= require('../server/index'),
qbo        		= new QuickBooks(config),
Promise 		= require('bluebird');

module.exports.findAccounts = function(query){
    return new Promise(function(resolve, reject){
    	console.log(query);
        qbo.findAccounts(query, function(error, accounts) {
            if (error) { reject(error); }
            else { resolve(accounts); }
        });
    });
};

module.exports.createSalesReceipt = function(salesReceipt){
	return new Promise(function(resolve, reject){
	    qbo.createSalesReceipt(salesReceipt, function(error, response){
		    if (error) {reject(error);}
		    else { resolve(response); }
		});
	});
};
//getSalesReceipt
module.exports.getSalesReceipt = function(id){
	return new Promise(function(resolve, reject){
		qbo.getSalesReceipt(id, function(error, salesReceipt) {
			if (error) { reject(error); }
			else { resolve(salesReceipt); }
		});
	});
};


module.exports.findSalesReceipts = function(query){
	return new Promise(function(resolve, reject){
		qbo.findSalesReceipts(query, function(error, salesReceipts) {
			if (error) { reject(error); }
			else { resolve(salesReceipts); }
		});
	});
};

//findPaymentMethods
module.exports.findPaymentMethods = function(query){
	return new Promise(function(resolve, reject){
		qbo.findPaymentMethods(query, function(error, paymentMethods) {
			if (error) { reject(error); }
			else { resolve(paymentMethods); }
		});
	});
};

//findItems
module.exports.findItems = function(query){
	return new Promise(function(resolve, reject){
		qbo.findItems(query, function(error, productsServices) {
			if (error) { reject(error); }
			else { resolve(productsServices); }
		});
	});
};

// getItem
module.exports.getItem = function(id){
	return new Promise(function(resolve, reject){
		qbo.getItem(id, function(error, productsServices) {
			if (error) { reject(error); }
			else { resolve(productsServices); }
		});
	});
};

//findClasses
module.exports.findClasses = function(query){
	return new Promise(function(resolve, reject){
		qbo.findClasses(query, function(error, classes) {
			if (error) { reject(error); }
			else { resolve(classes); }
		});
	});
};

// getClass
module.exports.getClass = function(id){
	return new Promise(function(resolve, reject){
		qbo.getClass(id, function(error, classes) {
			if (error) { reject(error); }
			else { resolve(classes); }
		});
	});
};
//findCustomers
module.exports.findCustomers = function(query){
	return new Promise(function(resolve, reject){
		qbo.findCustomers(query, function(error, customers) {
			if (error) { reject(error); }
			else { resolve(customers); }
		});
	});
};

// getCustomer
module.exports.getCustomer = function(id){
	return new Promise(function(resolve, reject){
		qbo.getCustomer(id, function(error, customer) {
			if (error) { reject(error); }
			else { resolve(customer); }
		});
	});
};

//createCustomer
module.exports.createCustomer = function(customer){
	return new Promise(function(resolve, reject){
		qbo.createCustomer(customer, function(error, response) {
			if (error) { reject(error); }
			else { resolve(response); }
		});
	});
};

//Bill
module.exports.findBills = function(query){
	return new Promise(function(resolve, reject){
		qbo.findBills(query, function(error, Bills) {
			if (error) { reject(error); }
			else { resolve(Bills); }
		});
	});
};

module.exports.getBill = function(id){
	return new Promise(function(resolve, reject){
		qbo.getBill(id, function(error, Bill) {
			if (error) { reject(error); }
			else { resolve(Bill); }
		});
	});
};

module.exports.createBill = function(Bill){
	return new Promise(function(resolve, reject){
		qbo.createBill(Bill, function(error, response) {
			if (error) { reject(error); }
			else { resolve(response); }
		});
	});
};

//findVendors
module.exports.findVendors = function(query){
	return new Promise(function(resolve, reject){
		qbo.findVendors(query, function(error, vendors) {
			if (error) { reject(error); }
			else { resolve(vendors); }
		});
	});
};

//createVendors
module.exports.createVendor = function(vendor){
	return new Promise(function(resolve, reject){
		qbo.createVendor(vendor, function(error, response) {
			if (error) { reject(error); }
			else { resolve(response); }
		});
	});
};

//createVendors
module.exports.getVendor = function(vendor){
	return new Promise(function(resolve, reject){
		qbo.getVendor(vendor, function(error, response) {
			if (error) { reject(error); }
			else { resolve(response); }
		});
	});
};


