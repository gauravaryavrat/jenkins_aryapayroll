'use strict';

var dwolla = require('dwolla-v2');
var Promise = require('bluebird');
var config = require('../server/config');
const logger = require('../utils/logger')(module);

var options = {
    key: config.dwolla.key,
    secret: config.dwolla.secret,
    environment: config.dwolla.environment,
};

var client = new dwolla.Client(options);

// export the Dwolla Client
module.exports.client = client;

/**
 * @summary Fetch application access token
 */
const getAppToken = function () {
    return new Promise(function (resolve, reject) {

        var currentTimeStamp = Math.floor(Date.now() / 1000);
        var timeStampBeforeOneHourAgo = currentTimeStamp - 3540; //59 minutes

        if (global.dwollaAppToken && global.dwollaAppToken.timestamp > timeStampBeforeOneHourAgo) {
            logger.info('used app token from globals');
            resolve(global.dwollaAppToken.token);
        } else {
            client.auth.client()
                .then(function (appToken) {

                    global.dwollaAppToken = {
                        token: appToken,
                        timestamp: currentTimeStamp,
                    }
                    logger.info('created new app token');
                    resolve(appToken);
                }).catch(function (error) {
                    reject(error);
                });
        }
    });
}

module.exports.getAppToken = getAppToken;

/**
 * @summary Get Account URL from application access token
 */
const getAccountUrl = function (appToken) {
    return new Promise(function (resolve, reject) {
        appToken.get('/').then(function (res) {
            resolve(res.body._links.account.href);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getAccountUrl = getAccountUrl;


const getAccountDetails = function (appToken, accountUrl) {
    return new Promise(function (resolve, reject) {
        appToken.get(accountUrl).then(function (res) {
            resolve(res.body);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getAccountDetails = getAccountDetails;


const getFundingSources = function (appToken, accountUrl) {
    return new Promise(function (resolve, reject) {
        appToken.get(`${accountUrl}/funding-sources`).then(function (res) {
            resolve(res.body._embedded['funding-sources']);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getFundingSources = getFundingSources;

const getCustomerFundingSources = function (appToken, fundingSourcesUrl) {
    return new Promise(function (resolve, reject) {
        appToken.get(fundingSourcesUrl).then(function (res) {
            resolve(res.body._embedded['funding-sources']);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getCustomerFundingSources = getCustomerFundingSources;


const getFundingSourceDetail = function (appToken, fundingSourceUrl) {
    return new Promise(function (resolve, reject) {
        appToken.get(fundingSourceUrl).then(function (res) {
            resolve(res.body);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getFundingSourceDetail = getFundingSourceDetail;

const getFundingSourceDetailById = function (appToken, fundingSourceId) {
    return new Promise(function (resolve, reject) {
        appToken.get(`funding-sources/${fundingSourceId}`).then(function (res) {
            resolve(res.body);
        }).catch(function (error) {
            reject(error);
        });
    });
}

module.exports.getFundingSourceDetailById = getFundingSourceDetailById;


const createFundingSource = function (appToken, data) {
    return new Promise(function (resolve, reject) {
        var fundingSource = {
            routingNumber: data.routingNumber,
            accountNumber: data.accountNumber,
            type: data.type,
            name: data.name
        };
        appToken.post('funding-sources', fundingSource)
            .then(function (res) {
                resolve(res.headers.get('location'));
            }).catch(function (error) {
                reject(error._embedded.errors[0].message);
            });
    });
}

module.exports.createFundingSource = createFundingSource;


const createCustomerFundingSource = function (appToken, customerUrl, data) {
    return new Promise(function (resolve, reject) {
        var fundingSource = {
            routingNumber: data.routingNumber,
            accountNumber: data.accountNumber,
            bankAccountType: data.type,
            name: data.name
        };
        appToken.post(customerUrl, fundingSource)
            .then(function (res) {
                resolve(res.headers.get('location'));
            }).catch(function (error) {
                let err = error.toString().replace("Error: ", "");
                reject(JSON.parse(err));
            });
    });
}

module.exports.createCustomerFundingSource = createCustomerFundingSource;


const updateCustomerFundingSource = function (appToken, fundingSourceUrl, data) {
    return new Promise(function (resolve, reject) {
        var fundingSource = {
            routingNumber: data.routingNumber,
            accountNumber: data.accountNumber,
            type: data.type,
            name: data.name
        };        
        appToken.post(fundingSourceUrl, fundingSource)
            .then(function (res) {
                resolve(fundingSourceUrl);
            }, function(error) {
                let err = error.toString().replace("Error: ", "");
                reject(JSON.parse(err));
            });
    });
}

module.exports.updateCustomerFundingSource = updateCustomerFundingSource;



const createCustomer = function (appToken, customerData) {
    return new Promise(function (resolve, reject) {
        var requestBody = {
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            email: customerData.email,
            ipAddress: customerData.ipAddress,
            "type": "receive-only",
        };

        appToken.post('customers', requestBody)
            .then(function (res) {
                resolve(res.headers.get('location'));
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.createCustomer = createCustomer;


/**
 * @param email customer email to search
 * @param appToken Dwolla appToken
 * @summary Check exists on dwolla or not
 * @returns Bool
 */
const checkCustomerExists = function (appToken, email) {
    return new Promise(function (resolve, reject) {
        appToken.get(`customers?search=${email}`)
            .then(function (res) {
                if (res.body.total > 0) {
                    resolve(res.body._embedded.customers[0]);
                } else {
                    resolve(false)
                }
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.checkCustomerExists = checkCustomerExists;


/**
 * @param email customer email to search
 * @param appToken Dwolla appToken
 * @summary Search Customers with email
 * @returns list of customers
 */
const searchCustomer = function (appToken, email) {
    return new Promise(function (resolve, reject) {
        appToken.get(`customers?search=${email}`)
            .then(function (res) {
                resolve(res.body.customers);
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.searchCustomer = searchCustomer;


const createTransfer = function (appToken, data) {
    return new Promise(function (resolve, reject) {
        var requestBody = {
            "_links": {
                "source": {
                    "href": data.source
                },
                "destination": {
                    "href": data.destination
                }
            },
            "amount": {
                "currency": "USD",
                "value": data.amount
            }
        };

        console.log('transfer data ', requestBody);
        appToken.post('transfers', requestBody)
            .then(function (res) {
                resolve(res.headers.get('location'));
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.createTransfer = createTransfer;

const verifyGatewaySignature = function (proposed_signature, webhook_secret, payload_body) {
    var crypto = require('crypto');

    var hash = crypto.createHmac('sha256', webhook_secret).update(payload_body).digest('hex');

    return proposed_signature === hash;
}

module.exports.verifyGatewaySignature = verifyGatewaySignature;

const createMassPayment = function (appToken, data) {
    return new Promise(function (resolve, reject) {
        var requestBody = {
            "_links": {
                "source": {
                    "href": data.adminFundingSourceUrl
                }
            },
            "items": data.paymentLineItems,   
            "metadata": {
                "correlationID": data.paymentCorrelationID
            }         
        };
        console.log(requestBody)
        appToken.post('mass-payments', requestBody)
            .then(function (res) {
                resolve(res.headers.get('location'));
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.createMassPayment = createMassPayment;


const getMassPaymentDetail = function (appToken, massPaymentUrl) {
    return new Promise(function (resolve, reject) {
        appToken.get(massPaymentUrl)
            .then(function (res) {
                resolve(res.body);
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.getMassPaymentDetail = getMassPaymentDetail;


const getMassPaymentItems = function (appToken, massPaymentItemsUrl) {
    return new Promise(function (resolve, reject) {        
        appToken.get(massPaymentItemsUrl)
            .then(function (res) {
                console.log(res.body);
                resolve(res.body._embedded.items);
            }).catch(function (error) {
                reject(error);
            });
    });
}

module.exports.getMassPaymentItems = getMassPaymentItems;