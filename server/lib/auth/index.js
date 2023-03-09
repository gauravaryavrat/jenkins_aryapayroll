'use strict';

var logger = require('../../utils/logger')(module);
var config = require('../../config');
const ObjectID = require('mongodb').ObjectID
    // Login Strategies:
var localLogin = require('./local-login-strategy');
var facebookLogin = require('./facebook-login-strategy');
var facebookLoginMb = require('./facebook-loginmobile-strategy');

var googleLogin = require('./google-login-strategy');
var googleLoginMb = require('./google-loginmobile-strategy');
var UserDevice = require('../../models/user-device')
var User = require('../../models/user');
const Company = require('../../models/company');
const commonFunction = require('../../commonFunctions');

var passport = require('passport');

var exports = module.exports = {};
if (!Object.entries)
    Object.entries = function(obj) {
        var ownProps = Object.keys(obj),
            i = ownProps.length,
            resArray = new Array(i); // preallocate the Array
        while (i--)
            resArray[i] = [ownProps[i], obj[ownProps[i]]];

        return resArray;
    };

///////////////////////////////////////////////////////////
// Keep configuration localized here instead of server.js
//
// Set up Auth middleware
//////////////////////////////////////
exports.configureMiddleware = function(app) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, done);
    });

    // Install Login Strategies:
    localLogin(passport);
    facebookLogin(passport);
    facebookLoginMb(passport);
    googleLogin(passport);
    googleLoginMb(passport);

    app.use(passport.initialize());
    app.use(passport.session());
    logger.info('Auth middleware configured.')
};

// Pass Through the Auth routes:
exports.authenticate = {
    // Email/Password:
    localLogin: function(req, res, next) {
        return passport.authenticate('local-login', authenticationStrategyCallback(req, res, next))(req, res, next);
    },
    restaurantLoginAPI: function(req, res, next) {
        return passport.authenticate('local-login', authenticationStrategyCallbackRestaurantAPI(req, res, next))(req, res, next);
    },
    // Facebook:
    facebookLogin: passport.authenticate('facebook', {
        authType: 'rerequest',
        scope: ['email', 'user_friends']
    }),
    facebookLoginCb: function(req, res, next) {
        return passport.authenticate('facebook', authenticationStrategyCallback(req, res, next))(req, res, next);
    },
    facebookLoginMb: function(req, res, next) {
        return passport.authenticate('local-facebook', authenticationStrategyCallback(req, res, next))(req, res, next);
    },
    // Google:
    googleLogin: passport.authenticate('google', { scope: 'profile email' }),
    googleLoginCb: function(req, res, next) {
        return passport.authenticate('google', authenticationStrategyCallback(req, res, next))(req, res, next);
    },
    googleLoginMb: function(req, res, next) {
        return passport.authenticate('local-google', authenticationStrategyCallback(req, res, next))(req, res, next);
    },
    // Etc.
};
/*
* Disable for Social Media Module
exports.authenticationRequired = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    if (!req.xhr) req.session.redirectTo = req.originalUrl;
    res.redirect(ROUTES.USERS.LOGIN_PATH);
  }
}
*/
// Check User Authenticated or Not
exports.CheckAuthentication = function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.status(200).send({ status: 200, data: 'Authenticated' });
        } else {
            return res.status(401).send({ status: 401, data: 'NotAuthenticated' });
        }
    }
    //////////////////////////////////////
    // END Set up Auth middleware
    //////////////////////////////////////

/**
 * Enforces group permissions for required routes
 * @param {Array} routePermissions
 * @returns {Function} route handler to process request
 * @Example use: permisssionsRequire(["PlateRate Admin"])
 */
/*
* Disable for Social Media Module
exports.isAuthorized = (routePermissions = []) => {
  return (req, res, next) => {
    if (req.session.user) {
      if (req.session.user.profile) {
        const userPermissions = req.session.user.profile.permissionGroups;
        const userHasPermission = userPermissions.reduce((isGranted, userPermission) => {
          if (routePermissions.includes(userPermission)) isGranted = true;
          return isGranted;
        }, false);

        if (userHasPermission) next();
        else res.status(403).render('403');

      } else {
        res.redirect(ROUTES.USERS.PROFILE_PATH)
      }
    } else {
      res.redirect(ROUTES.USERS.LOGIN_PATH);
    }
  }
};
*/

////////////////////////////////////
// PRIVATE METHODS
////////////////////////////////////
function authenticationStrategyCallback(req, res, next) {
    // Wrapping this anonymous function to pass req, res, and next:
    return (err, user, info) => {
        if (err) {
            return res.send({ status: 404, message: err });
        }
        // Check User's Profile and registration status:
        if (user) {
            if (user.employeeProfile) {
                var loginuser = user;
                var permisssionStatus = commonFunction.permissionStatus(user.local.email);
                //Update the user last Login date
                User.updateLastLogin(user.id);
                var returnUserData = {
                    userData: {
                        userId: user._id,
                        firstName: user.profile.contactInfo.firstName,
                        lastName: user.profile.contactInfo.lastName,
                        timeZone: user.profile.timeZone,
                        isActive: user.isActive,
                        email: user.local.email,
                        phone: user.employeeProfile.contactDetails.personal.phone,
                        companyId: user.employeeProfile.companyId,
                        permissions: permisssionStatus,
                    }
                }

                if (user.profile.imageUrl !== `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`) {
                    returnUserData.userData.imageUrl = `http://${req.headers.host}${user.profile.imageUrl.substr(user.profile.imageUrl.indexOf('public')+6)}`
                } else {
                    returnUserData.userData.imageUrl = user.profile.imageUrl
                }

                return Company.findOne({ _id: ObjectID(user.employeeProfile.companyId) }).then((foundCompany) => {
                        if (foundCompany) {
                            returnUserData.userData.company_name = foundCompany.name;
                        } else {
                            returnUserData.userData.company_name = "Company Not Found";
                        }
                        return (returnUserData)
                    }).catch(function(err) {
                        return res.send({ status: 'error', message: err.message });
                    })
                    .then(async(userData) => {
                        var parentDetails = await commonFunction.parentUserIdDetails(loginuser);
                        var isParentStatus = await commonFunction.isParentStatus(loginuser._id);
                        userData.isParent = isParentStatus;
                        userData.parentUserIds = parentDetails;
                        return (userData)
                    }).catch(function(err) {
                        return res.send({ status: 'error', message: err.message });
                    })
                    .then((userData) => {
                        if (loginuser.registrationToken) {
                            var errMsg = loginuser.registrationToken.isExpired ?
                                'We are sorry - your previous registration has expired.  Please register again and confirm the email before logging in.' :
                                'We are sorry - you must confirm your registration by clicking on the link in your mailbox.  ' + 'If you no longer have it, please use the lost password functionality.';

                            return res.send({ 'status': 'error', 'message': errMsg });
                        }
                        req.logIn(user, async function(err) {
                            if (err) {
                                return res.send({ status: 'error', 'message': err.message });
                            }
                            let data = {
                                cloudInfo: {
                                    cloud_key_to_notify: req.body.cloud_key_to_notify,
                                    cloud_key_last_error: '',
                                    cloud_key_error: ''
                                },
                                osInfo: {
                                    os_type: req.body.os_type,
                                    os_ver: '',
                                    os_kernal_ver: '',
                                    os_build_num: ''
                                },
                                remote_device_id: req.body.remote_device_id,
                                user_id: user._id,
                            };
                            let foundUserDevice = await UserDevice.findOne({ "user_id": ObjectID(user._id) }).lean();
                            if (foundUserDevice == null || foundUserDevice == undefined) {
                                await UserDevice.addDevice(data);
                            } else {
                                await UserDevice.findOneAndUpdate({ "user_id": ObjectID(user._id) }, {
                                    "cloudInfo": data.cloudInfo,
                                    "osInfo": data.osInfo,
                                    "remote_device_id": data.remote_device_id
                                });
                            }
                        });
                        return res.send({ 'status': 'success', message: 'Login Successfully', data: userData });
                    }).catch(function(err) {
                        return res.send({ status: 'error', message: err.message });
                    }) // if user have no Employee profile
            } else {
                //Update the user last Login date
                User.updateLastLogin(user.id);

                if (user.registrationToken) {
                    var errMsg = user.registrationToken.isExpired ?
                        'We are sorry - your previous registration has expired.  Please register again and confirm the email before logging in.' :
                        'We are sorry - you must confirm your registration by clicking on the link in your mailbox.  ' + 'If you no longer have it, please use the lost password functionality.';

                    return res.send({ 'status': 'error', 'message': errMsg });
                }

                req.logIn(user, function(err) {
                    if (err) {
                        return res.send({ 'status': 'error', 'message': err.message });
                    }
                });
                return res.send({ 'status': 'success', message: 'Login Successfully', user: user });
            }
        } else {
            return next('No User Data. Not sure why.');
        }
    }
}