"use strict";

const config = require("../config");
const ObjectID = require("mongodb").ObjectID;
const logger = require("../utils/logger")(module);
const User = require("../models/user");
const https = require("https");
const querystring = require("querystring");
const emailGen = require("../lib/email-template-generator")
    .emailTemplateGenerator;
const emailSender = require("../lib/email-sender");
const auth = require("../lib/auth");
const commonFunction = require("../commonFunctions");
const UserGroup = require("../models/user-groups");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);
const Role = require('../models/roles');

function isEmpty(str) {
    return !str || str.trim().length == 0;
}

module.exports.defaultRoute = function(req, res) {
    res.send({ status: "success", message: "Welcome" });
};

module.exports.signupViaEmail = async function(req, res) {
    console.log(req.body, req.params);
    const userData = {
        email: req.body.email,
        origin: req.headers.host
    };
    (req.params.parentUserId) ? userData.parentUserId = req.params.parentUserId: "";
    (req.body.phone) ? userData.phone = req.body.phone: "";
    if (req.body.name) {
        userData.firstName = commonFunction.getFirstName(req.body.name);
        userData.lastName = commonFunction.getLastName(req.body.name);
        userData.roleId = req.body.roleId;
    }
    const redirectUrl = req.body.redirectUrl;
    User.newRegistration(userData)
        .then(function(registrationData) {
            const user = registrationData.user;
            const rootUrl = `${req.protocol}://${req.get("host")}`;
            const data = {
                newRegistrationUrl: `${redirectUrl}/${encodeURIComponent(
          user.registrationToken.token
        )}?on=register`,
                homeUrl: rootUrl
            };

            emailGen("user-registration", data)
                .then(function(template) {
                    logger.info("Generated [user-registration] template");
                    return template.html;
                })
                .then(function(html) {
                    var emailData = {
                        recipient: user.local.email,
                        subject: "Arya Payroll registration email",
                        message: html
                    };
                    return emailData;
                })
                .then(emailSender.sendEmail)
                .then(function(resp) {
                    logger.info("SENT: ", resp);
                    const message = `An email validation link was just emailed to you at ${req.body.email}, please verify your email and follow the instructions to complete your registration.
         We're happy to have you as part of our community!`;
                    const note = `We've been having problems with our emails going to the spam folder. Please add support@aryavratinfotech.com as a contact so our email doesn't go to spam, and check your spam folder or trash if our emails don't come to your inbox!`;
                    console.log(message);
                    res
                        .send({
                            status: "success",
                            message: message,
                            note: note
                        })
                        .end();
                })
                .catch(function(err) {
                    logger.error("Failed seding email.", err);
                    res.send({
                        status: "error",
                        message: `Failed to create new user with message: ${err.message}`
                    });
                });
        })
        .catch(function(err) {
            logger.error("Failed creating registration.", err);
            res.send({
                status: "error",
                message: `Failed to create new user with message: ${err.message}`
            });
        });
};

module.exports.userSignupViaEmail = async function(req, res) {
    const userData = {
        email: req.body.email,
        origin: req.headers.host
    };
    (req.params.parentUserId) ? userData.parentUserId = req.params.parentUserId: "";
    (req.body.phone) ? userData.phone = req.body.phone: "";
    if (req.body.name) {
        userData.firstName = commonFunction.getFirstName(req.body.name);
        userData.lastName = commonFunction.getLastName(req.body.name);
        userData.roleId = req.body.roleId;
    }
    const redirectUrl = req.body.redirectUrl;
    User.newSubUserRegistration(userData)
        .then(function(registrationData) {
            const user = registrationData.user;
            const rootUrl = `${req.protocol}://${req.get("host")}`;
            const data = {
                newRegistrationUrl: `${redirectUrl}/${encodeURIComponent(
          user.registrationToken.token
        )}?on=register`,
                homeUrl: rootUrl
            };

            emailGen("user-registration", data)
                .then(function(template) {
                    logger.info("Generated [user-registration] template");
                    return template.html;
                })
                .then(function(html) {
                    var emailData = {
                        recipient: user.local.email,
                        subject: "Arya Payroll registration email",
                        message: html
                    };
                    return emailData;
                })
                .then(emailSender.sendEmail)
                .then(function(resp) {
                    logger.info("SENT: ", resp);
                    const message = `An email validation link was just emailed to you at ${req.body.email}, please verify your email and follow the instructions to complete your registration.
         We're happy to have you as part of our community!`;
                    const note = `We've been having problems with our emails going to the spam folder. Please add support@aryavratinfotech.com as a contact so our email doesn't go to spam, and check your spam folder or trash if our emails don't come to your inbox!`;
                    console.log(message);
                    res
                        .send({
                            status: "success",
                            message: message,
                            note: note
                        })
                        .end();
                })
                .catch(function(err) {
                    logger.error("Failed seding email.", err);
                    res.send({
                        status: "error",
                        message: `Failed to create new user with message: ${err.message}`
                    });
                });
        })
        .catch(function(err) {
            logger.error("Failed creating registration.", err);
            res.send({
                status: "error",
                message: `Failed to create new user with message: ${err.message}`
            });
        });
};

module.exports.confirmRegistration = async function(req, res) {
    const token = req.body.token;
    const newPassword = req.body.password;
    const passConfirm = req.body.passwordConfirmation;
    try {
        if (isEmpty(token)) {
            throw new Error("Security token is missing from request");
        }
        if (isEmpty(newPassword) || isEmpty(passConfirm)) {
            throw new Error("Password is required.");
        }

        User.confirmRegistration(token)
            .then(function(user) {
                User.setPassword(user._id, newPassword, passConfirm)
                    .then(function(updatedUser) {
                        res.send({
                            status: "success",
                            message: `We are happy to have you as part of our community!`,
                            data: {
                                userId: user.id
                            }
                        });
                    })
                    .catch(function(err) {
                        res.send({
                            status: "error",
                            message: err.message,
                            data: {}
                        });
                    });
            })
            .catch(function(err) {
                logger.error(
                    "userController.confirmRegistration REMOVING TOKEN...",
                    err
                );
                res.send({
                    status: "error",
                    message: err.message,
                    data: {}
                });
            });
    } catch (error) {
        res
            .send({
                message: error.message,
                status: "error"
            })
            .end();
    }
};

module.exports.setPassword = async function(req, res) {
    const token = req.body.token;
    const newPassword = req.body.password;
    const passConfirm = req.body.passwordConfirmation;
    try {
        if (isEmpty(token)) {
            throw new Error("Security token is missing from request");
        }
        if (isEmpty(newPassword) || isEmpty(passConfirm)) {
            throw new Error("Password is required.");
        }

        User.confirmPasswordReset(token)
            .then(function(user) {
                if (user) {
                    User.setPassword(user._id, newPassword, passConfirm)
                        .then(function(updatedUser) {
                            res.send({
                                status: "success",
                                message: `Password set successfully!`
                            });
                        })
                        .catch(function(err) {
                            res.send({
                                status: "error",
                                message: err.message,
                                data: {}
                            });
                        });
                } else {
                    res
                        .send({
                            message: "Invalid token",
                            status: "error"
                        })
                        .end();
                }
            })
            .catch(function(err) {
                res
                    .send({
                        message: err.message,
                        status: "error"
                    })
                    .end();
            });
    } catch (error) {
        res
            .send({
                message: error.message,
                status: "error"
            })
            .end();
    }
};

/**
 * POST /users/password/reset, {email: 'user@emailaddress.com'}
 *
 * Generates password reset token and temporary password for the user user, saves changes to DB, sends email to complete
 * registration.
 *
 */
module.exports.sendPasswordResetToken = function(req, res) {
    const email = req.body.email;
    const redirectUrl = req.body.redirectUrl;
    User.resetPassword(email)
        .then(function(resetData) {
            // Now, need to email the user:
            const user = resetData.user;
            if (req.body.homeUrl) {
                var homeUrl = req.body.homeUrl;
            } else {
                var homeUrl = "";
            }
            const data = {
                passwordResetUrl: `${redirectUrl}/${encodeURIComponent(
          user.passwordResetToken.token
        )}`,
                homeUrl: homeUrl
            };
            return emailGen("password-reset", data)
                .then(function(template) {
                    logger.info("Generated [password-reset] template");
                    return template.html;
                })
                .then(function(html) {
                    var emailData = {
                        recipient: email,
                        subject: "Arya Payroll password reset email",
                        message: html
                    };
                    return emailData;
                })
                .then(emailSender.sendEmail)
                .then(function(resp) {
                    const message = `Please check your email for a link to reset your password.`;
                    res
                        .send({
                            message: message,
                            status: "success"
                        })
                        .end();
                })
                .catch(function(err) {
                    logger.error("Failed sending password reset email.", err);
                    res
                        .send({
                            message: err.message,
                            status: "error"
                        })
                        .end();
                });
        })
        .catch(function(err) {
            res
                .send({
                    message: err.message,
                    status: "error"
                })
                .end();
        });
};

/**
 * POST /users/login
 *
 * Authenticates the user via email and password input fields, setting user as logged in for the current session.
 */
module.exports.login = auth.authenticate.localLogin;

// list all sub users of an individual User
module.exports.listAll = async function(req, res) {
    try {
        var users = [];
        var userDetails = await User.find({
            parentUserId: req.params.parentUserId
        });
        userDetails.forEach(items => {
            if (!items.employeeProfile) {
                users.push(items);
            }
        });
        return res.send({
            status: "success",
            message: "SubUsers List Success",
            users: users
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};


// Update sub user
module.exports.updateSubUser = async function(req, res) {
    const parentUserId = req.params.parentUserId;
    const subUserId = req.params.subUserId;

    if (req.body.name) {
        var firstName = commonFunction.getFirstName(req.body.name);
        var lastName = commonFunction.getLastName(req.body.name);
    }
    const updateData = {
        "profile.contactInfo.firstName": firstName,
        "profile.contactInfo.lastName": lastName,
        "profile.contactInfo.phone": req.body.phone
    };

    for (var item in updateData) {
        if (updateData[item] == null) {
            delete updateData[item];
        }
    }

    try {
        if (!commonFunction.isEmpty(updateData)) {
            const updatedUser = await User.findOneAndUpdate({ _id: ObjectID(subUserId), parentUserId: parentUserId },
                updateData, { new: true }
            );
            return res.send({
                status: "success",
                message: "SubUser updated successfully",
                user: updatedUser
            });
        } else {
            return res.send({
                status: "error",
                message: "Please fill out your desired fields to update the filled fields"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete sub user
module.exports.deleteSubUser = async function(req, res) {
    const parentUserId = req.params.parentUserId;
    const subUserId = req.params.subUserId;
    try {
        await User.deleteOne({
            _id: ObjectID(subUserId),
            parentUserId: parentUserId
        });
        return res.send({
            status: "success",
            message: "SubUser deleted successfully"
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List SubUser Individual Details
module.exports.subUserDetails = async function(req, res) {
    try {
        var subUserDetails = {};
        subUserDetails.userGroupsDetails = [];
        var userInfo = await User.findById({ _id: ObjectID(req.params.userId) });
        subUserDetails._id = userInfo._id;
        subUserDetails.name = await User.getDisplayName(userInfo._id);
        subUserDetails.phone = userInfo.profile.contactInfo.phone;
        subUserDetails.email = userInfo.local.email;
        if (userInfo.userGroups.length > 0) {
            for (var i = 0; i < userInfo.userGroups.length; i++) {
                var userGroup = await UserGroup.findById({
                    _id: ObjectID(userInfo.userGroups[i])
                });
                var userGroupDetail = {
                    _id: userGroup._id,
                    title: userGroup.title
                };
                subUserDetails.userGroupsDetails.push(userGroupDetail);
            }
            return res.send({
                status: "success",
                message: "Individual sub user list success",
                data: subUserDetails
            });
        } else {
            return res.send({
                status: "success",
                message: "Individual sub user list success",
                data: subUserDetails
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Employee parentIds and childIds
module.exports.findParentChildIds = async function(req, res) {
    try {
        var employeeId = req.params.employeeId;
        var employeeIdsDetails = {
            parentUsersIds: [],
            childUsersIds: []
        };
        // Fetch the Child Ids
        var childUsers = await User.find({
            "employeeProfile.parentUserIds.parentUserId": employeeId
        });
        if (childUsers.length === 0) {
            employeeIdsDetails.childUsersIds = [];
        } else {
            for (var i = 0; i < childUsers.length; i++) {
                var idsDetail = {
                    _id: childUsers[i]._id,
                    avatar: childUsers[i].profile.imageUrl,
                    displayName: await User.getDisplayName(childUsers[i]._id)
                };
                employeeIdsDetails.childUsersIds.push(idsDetail);
            }
        }
        // Fetch the Parent Ids
        var parentUser = await User.findById({ _id: ObjectID(employeeId) });
        if (parentUser.employeeProfile) {
            if (parentUser.employeeProfile.parentUserIds) {
                if (parentUser.employeeProfile.parentUserIds.length === 0) {
                    employeeIdsDetails.parentUsersIds = [];
                } else {
                    for (
                        var j = 0; j < parentUser.employeeProfile.parentUserIds.length; j++
                    ) {
                        var userInfo = await commonFunction.getUserInfo(
                            parentUser.employeeProfile.parentUserIds[j].parentUserId
                        );
                        var idsDetail = {
                            _id: parentUser.employeeProfile.parentUserIds[j].parentUserId,
                            avatar: userInfo.profile.imageUrl,
                            displayName: await User.getDisplayName(
                                parentUser.employeeProfile.parentUserIds[j].parentUserId
                            )
                        };
                        employeeIdsDetails.parentUsersIds.push(idsDetail);
                    }
                }
            } else {
                employeeIdsDetails.parentUsersIds = [];
            }
        } else {
            employeeIdsDetails.parentUsersIds = [];
        }
        return res.send({
            status: "success",
            message: "Ids List Success",
            data: employeeIdsDetails
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Assign and Unassign Sub User Permissions
module.exports.userPermissionsAction = async function(req, res) {
    try {
        var subUserId = req.params.subUserId;
        var addPermissions = req.body.userPermissionIds;
        var userGroupDetails = await User.findOneAndUpdate({ _id: ObjectID(subUserId) }, { $set: { userGroups: addPermissions } }, { new: true });
        return res.send({
            status: "success",
            message: "User Permission Action Successfully",
            data: userGroupDetails.userGroups
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

//Add Profile Picture
module.exports.uploadAvatar = function(req, res) {
    try {
        if (req.params.type === 'User') {
            var storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    if (!fs.existsSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        )) {
                        fs.mkdirSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        );
                    }
                    if (!fs.existsSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public/media")
                        )) {
                        fs.mkdirSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public/media")
                        );
                    }
                    if (!fs.existsSync(
                            path.join(path.resolve(__dirname, "../../server"), `/public/media/${req.params.userId}`)
                        )) {
                        fs.mkdirSync(
                            path.join(path.resolve(__dirname, "../../server"), `/public/media/${req.params.userId}`)
                        );
                    }
                    callback(null, `./public/media/${req.params.userId}`);
                },
                filename: function(req, file, callback) {
                    callback(
                        null,
                        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
                    );
                }
            });
        } else if (req.params.type === 'Employee') {
            var storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    if (!fs.existsSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        )) {
                        fs.mkdirSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        );
                    }
                    if (!fs.existsSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`
                            )
                        )) {
                        fs.mkdirSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`
                            )
                        );
                    }
                    if (!fs.existsSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`, `/${req.params.userId}`
                            )
                        )) {
                        fs.mkdirSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`, `/${req.params.userId}`
                            )
                        );
                    }
                    callback(null, `./public/${req.params.companyId}/${req.params.userId}`);
                },
                filename: function(req, file, callback) {
                    callback(
                        null,
                        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
                    );
                }
            });
        }

        const upload = multer({
            storage: storage,
            limits: { fileSize: 1000000 },
            fileFilter: function(req, file, cb) {
                checkFileType(file, cb);
            }
        }).single("avatar");

        // Check File Type
        function checkFileType(file, cb) {
            // Allowed ext
            const filetypes = /jpeg|jpg|png|gif/;
            // Check ext
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase()
            );
            // Check mime
            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb("Images Only!");
            }
        }
        upload(req, res, async function(err) {
            if (err instanceof multer.MulterError) {
                return res.send({
                    status: "error",
                    message: `Multer Error While Uploading the Avatar ${err}`
                });
            } else if (err) {
                return res.send({
                    status: "error",
                    message: err
                });
            }
            // Update Path in the database
            var alterFilePath = req.file.path.substr(req.file.path.indexOf("/"));
            var updateData = path.join(
                path.resolve(__dirname, "../../server"),
                req.file.path
            );
            var avatarInfo = await User.findById({
                _id: ObjectID(req.params.userId)
            });
            if (avatarInfo.profile.imageUrl) {
                if (fs.existsSync(avatarInfo.profile.imageUrl)) {
                    await unlinkAsync(avatarInfo.profile.imageUrl);
                    await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, { "profile.imageUrl": updateData }, { new: true });
                } else {
                    await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, { "profile.imageUrl": updateData }, { new: true });
                }
            } else {
                await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, { "profile.imageUrl": updateData }, { new: true });
            }
            return res.send({
                status: "success",
                message: "Avatar Uploaded Successfully",
                data: `${req.headers.origin}${alterFilePath}`
            });
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Remove Profile Picture
module.exports.removeAvatar = async function(req, res) {
    try {
        var avatarInfo = await User.findById({ _id: ObjectID(req.params.userId) });
        if (avatarInfo.profile.imageUrl) {
            if (fs.existsSync(avatarInfo.profile.imageUrl)) {
                await unlinkAsync(avatarInfo.profile.imageUrl);
                await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, { "profile.imageUrl": "" });
            } else {
                await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, { "profile.imageUrl": "" });
            }
        }
        return res.send({ status: "success", message: "Avatar Remove Succefully" });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List User Details
module.exports.listUSerDetails = async function(req, res) {
    try {

        var userDetails = await User.findById({ _id: ObjectID(req.params.userId) });
        let avatar;
        if (userDetails.profile.imageUrl === `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`) {
            avatar = userDetails.profile.imageUrl;
        } else {
            avatar = `http://${req.headers.host}/${userDetails.profile.imageUrl.substr(userDetails.profile.imageUrl.indexOf('public')+6)}`
        }
        var returnData = {
            name: `${userDetails.profile.contactInfo.firstName} ${userDetails.profile.contactInfo.lastName}`.trim(),
            gender: (userDetails.profile.contactInfo.gender === undefined) ? '' : userDetails.profile.contactInfo.gender,
            phone: (userDetails.profile.contactInfo.phone === undefined) ? '' : userDetails.profile.contactInfo.phone,
            birthday: (userDetails.profile.contactInfo.birthday === undefined) ? '' : userDetails.profile.contactInfo.birthday,
            avatar: avatar,
            timeZone: userDetails.profile.timeZone,
        }
        return res.send({ status: 'success', message: 'User Details Successfully', data: returnData });
    } catch (err) {
        return res.send({ status: 'error', message: err.message })
    }
}

// Availabe Time Zone to user
module.exports.availableTimeZone = async function(req, res) {
    try {
        var returnData = await User.availableTimeZone();
        var returnTimeZones = [];
        if (returnData.length > 0) {
            returnData.forEach((items) => {
                var returnTimeZone = {
                    "Name": items.timezone_name,
                    "Code": items.timezone_name
                }
                returnTimeZones.push(returnTimeZone)
            })
        } else {
            returnTimeZones = [];
        }
        return res.send({ status: 'success', message: 'Time Zone List Successfully', data: returnTimeZones });
    } catch (error) {
        return res.send({ status: 'error', message: err.message })
    }
}

//Update User Details
module.exports.updateUserDetails = async function(req, res) {
    try {
        var updateData = {
            "profile.contactInfo.firstName": commonFunction.getFirstName(req.body.name),
            "profile.contactInfo.lastName": commonFunction.getLastName(req.body.name),
            "profile.contactInfo.phone": req.body.phone,
            "profile.contactInfo.gender": req.body.gender,
            "profile.contactInfo.birthday": req.body.birthday,
            "profile.timeZone": req.body.timeZone,
        }
        if (req.body.birthday.length === 0) {
            delete updateData['profile.contactInfo.birthday'];
        }
        await User.findOneAndUpdate({ _id: ObjectID(req.params.userId) }, updateData, { new: true });
        return res.send({ status: 'success', message: 'User Profile Updated Successfully' })
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Is user is a admin
module.exports.isAdmin = async function(req, res) {

    try {
        let userDetails = await User.findById({ _id: ObjectID(req.params.userId) });
        return Role.findById({ _id: ObjectID(userDetails.rolePermissionId) }).then((foundRole) => {
            if (foundRole) {
                if (foundRole.title === 'ADMIN') {
                    let status = true;
                    return res.send({ status: 'success', message: 'User Status', data: status });
                } else {
                    let status = false;
                    return res.send({ status: 'success', message: 'User Status', data: status });
                }
            }
        })
    } catch (error) {
        console.log(error.message);
        return res.send({ status: 'error', message: error.message });
    }
}