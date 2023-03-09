
const mongoose = require('mongoose');
const objectIdValidator = require('mongoose').Types.ObjectId;
const sanitize = require('mongo-sanitize');
const validator = require('validator');
const logger = require('../utils/logger')(module);
const crypto = require('../lib/crypto');
const Token = require('./token');
const emailSender = require('../lib/email-sender');
const emailGen = require('../lib/email-template-generator').emailTemplateGenerator;
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const UserProfile = require('./user-profile');
const EmployeeProfile = require('../models/employee-profile');
const MetaData = require('../models/meta-data');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const Role = require('./roles');

// define the schema for our user model
const userSchema = mongoose.Schema({
  parentUserId:{type: ObjectId},
  registrationToken: Token.schema,
  passwordResetToken: Token.schema,
  profile: UserProfile.schema,
  employeeProfile: EmployeeProfile.schema,
  metaData: MetaData.schema,
  rolePermissionId: ObjectId,
  userGroups: Array,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin : Date,
  local: {
    email: {
      type: String,
      lowercase: true,
      validate: {
        isAsync: false,
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email address!',
      },
      required: [true, 'Email must be given'],
    },
    password: {
      type: String,
      set: crypto.hash,
      // Also, add some complexity validation
    },
  },
  secondary :
  [{
    emails: {
      type: String,
      lowercase: true,
      unique: true,
      sparse: true,
      validate: {
        isAsync: false,
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email address!',
      },
    },
     status : {
      type: String,
    },
  }] ,
  facebook         : {
    id           : String,
    token        : String,
    // email        : String,
    // name         : String
  },
  google           : {
    id           : String,
    token        : String,
    // email        : String,
    // name         : String
  },
  temporaryReferrerUserId : String,
});

// /////////////////////////////////
// PROPERTIES
// /////////////////////////////////
userSchema.virtual('href').get(function () {
  return this.id;
});

userSchema.virtual('email').get(function () {
  return this.local.email;
});

userSchema.virtual('fullName').get(function () {
  return this.profile ? this.profile.contactInfo.fullName : this.local.email;
});

userSchema.virtual('userName').get(function () {
  var userName = this.local.email;
  if (this.profile) {
    if (this.profile.contactInfo.firstName && this.profile.contactInfo.lastName) {
      userName = `${this.profile.contactInfo.firstName} ${this.profile.contactInfo.lastName[0]}.`;
    }
  }
  return userName;
});

// /////////////////////////////////
// INSTANCE (PUBLIC) METHODS
// /////////////////////////////////

// checking if password is valid
userSchema.methods.isPasswordValid = function (password) {
  return crypto.checkHash(password, this.local.password);
};

userSchema.methods.setRegistrationToken = function () {
  this.registrationToken = new Token();
};

userSchema.methods.setPasswordResetToken = function () {
  this.passwordResetToken = new Token();
};

/* input: permission group as defined in the constant PERMISSIONS.GROUP_PERMISSIONS
    Determined if the input is a string equal to one of the permissions
    defined in PERMISSIONS.GROUP_PERMISSIONS

    output: A boolean
*/
userSchema.methods.isPermissionValid = function (permission) {

  if (typeof(permission) !== 'string')
    throw new Error('the permission is not a string');

  for (var property in PERMISSIONS.GROUP_PERMISSIONS) {
    if (PERMISSIONS.GROUP_PERMISSIONS.hasOwnProperty(property)
        && PERMISSIONS.GROUP_PERMISSIONS[property] === permission) {
      return true;
    }
  }

  return false
}

/* input: a permission group as defined in the constant PERMISSIONS.GROUP_PERMISSIONS
    the addPermissionGroup method adds the permission group
    input into the method to the document

    output: The saved user document

    Throws an Error
*/
userSchema.methods.addPermissionGroup = function (permission) {

  const userPermission = this.profile.permissionGroups && this.profile.permissionGroups.length ? this.profile.permissionGroups : ['User'];
  if (this.isPermissionValid(permission))
    this.profile.permissionGroups = [...userPermission, permission];
  else
    throw new Error(`the permission ${permission} is not valid!`);

  return this;
}

/* input: a permission group as defined in the constant PERMISSIONS.GROUP_PERMISSIONS
    the hasPermssionGroup method returns true if the current user
    already has this permission group added and false otherwise

    output: A boolean

    Throws an Error
*/
userSchema.methods.hasPermissionGroup = function (permission) {

  if (this.isPermissionValid(permission))
    return (this.profile.permissionGroups.indexOf(permission) > -1);
  else
    throw new Error(`the permission ${permission} is not valid!`);
}


// /////////////////////////////////
// CLASS (STATIC) METHODS
// /////////////////////////////////

// generating a hash
userSchema.statics.generateTemporaryPassword = function generateTemporaryPassword() {
  return crypto.randomString(6);
};

/**
 * newRegistration - creates a new user object, populating email, temporary password, and registration token.
 *
 * The method could conceivably throw the following errors:
 *
 * 1. {Error} - {message: 'Error Message'} indicating that the email address is no longer available or that a Database
 *  Connection Error has occurred.
 * 2. {MongooseError} - error data containing a collection of { errors: {validation-errors}, message: 'Error Message',
 * ...}.
 *
 * @param  {String} email valid email address
 * @param  {String} referrerUserId :
 * @return {Promise} a promise with signature `function({user: 'User'})`
 */
userSchema.statics.newRegistration = function newRegistration(data) {
  var email = sanitize(data.email.toLowerCase());
  // check user's presence:
  var promise = this.findOne({ $or: [ { "local.email" : email }, { "secondary.emails": email  } ] }).exec();
  // populate all relevant user fields:
  return promise.then(async(foundUser) => {
    if (foundUser) {
      throw new Error(`Email address ${email} has already been taken. If you forgot your password please go back to login and click "forgot password" to reset your password.`);
    } else {
      var roleDetails = await Role.findOne({'title':'ADMIN'});
      var User = mongoose.model('User', userSchema);
      var newUser = new User();
      if(roleDetails){
        newUser.rolePermissionId = roleDetails._id;
      }
      newUser.local.email = email;
      //newUser.parentUserId = data.parentUserId;
      newUser.profile = new UserProfile();
      if(data.imageUrl){
        newUser.profile.imageUrl = data.imageUrl
      } else {
        newUser.profile.imageUrl =`http://${data.origin}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png` ;
      }
      (data.parentUserId)? newUser.parentUserId = data.parentUserId:"";
      newUser.profile.contactInfo.firstName = data.firstName;
      newUser.profile.contactInfo.lastName = data.lastName;
      newUser.profile.contactInfo.phone = data.phone;
      if (data.referrerUserId) newUser.temporaryReferrerUserId = data.referrerUserId;
      // Generate registration token:
      newUser.setRegistrationToken();
      return (newUser);
    }
  })
  // save the user or pass the validation error up:
  .then((newUser) => {
    return newUser.save().then((savedUser) => {
      logger.info('********  USER REGISTERED ********', savedUser.local.email);
      //logger.info(savedUser.profile)
      return ({ user: savedUser });
    });
  });
};

userSchema.statics.newSubUserRegistration = function newSubUserRegistration(data) {
  var email = sanitize(data.email.toLowerCase());
  // check user's presence:
  var promise = this.findOne({ $or: [ { "local.email" : email }, { "secondary.emails": email  } ] }).exec();
  // populate all relevant user fields:
  return promise.then(async(foundUser) => {
    if (foundUser) {
      throw new Error(`Email address ${email} has already been taken. If you forgot your password please go back to login and click "forgot password" to reset your password.`);
    } else {
      var User = mongoose.model('User', userSchema);
      var newUser = new User();
      newUser.rolePermissionId = data.roleId;
      newUser.local.email = email;
      //newUser.parentUserId = data.parentUserId;
      newUser.profile = new UserProfile();
      if(data.imageUrl){
        newUser.profile.imageUrl = data.imageUrl
      } else {
        newUser.profile.imageUrl =`http://${data.origin}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png` ;
      }
      (data.parentUserId)? newUser.parentUserId = data.parentUserId:"";
      newUser.profile.contactInfo.firstName = data.firstName;
      newUser.profile.contactInfo.lastName = data.lastName;
      newUser.profile.contactInfo.phone = data.phone;
      if (data.referrerUserId) newUser.temporaryReferrerUserId = data.referrerUserId;
      // Generate registration token:
      newUser.setRegistrationToken();
      return (newUser);
    }
  })
  // save the user or pass the validation error up:
  .then((newUser) => {
    return newUser.save().then((savedUser) => {
      logger.info('********  USER REGISTERED ********', savedUser.local.email);
      //logger.info(savedUser.profile)
      return ({ user: savedUser });
    });
  });
};


/**
 * Confirms user registration and deletes the registration token.
 *
 * Token must match the value in DB as well as be NOT expired.
 */
userSchema.statics.confirmRegistration = function confirmRegistration(token) {
  token = sanitize(decodeURIComponent((token)));
  var promise = this.findOne({ 'registrationToken.token': token }).exec();
  return promise.then((user) => {
    if (!user) {
      throw new Error('Registration token not found');
    } else if (user.registrationToken.isExpired) {
      throw new Error('Sorry, your registration time has expired. Please try to register again.');
    } else {
      /*var removedToken = user.registrationToken.remove();
      return user.save().then((savedUser) => {
        return savedUser;
      });*/
      return user;
    }
  });
};

/**
 * Generates a reset token for a valid user's email, sets and returns temporary password
 * email can be main or any of the secondary ones
 * Token must match the value in DB as well as be NOT expired.
 */
userSchema.statics.resetPassword = function resetPassword(email) {
  email = sanitize(email.toLowerCase());
  // check user's presence:
  //var promise = this.findOne({ 'local.email': email }).exec();
  var promise = this.findOne({ $or: [ { "local.email" : email }, { "secondary.emails": email  } ] }).exec();
  // populate all relevant user fields:
  return promise.then((user) => {
    if (user) {
      // Generate password reset token:
      user.setPasswordResetToken();
      return (user);
    } else {
      throw new Error(`Email address ${email} is not found.  Please check and try again.`);
    }
  })
  // save the user or pass the validation error up:
  .then((user) => {
    if(email == user.local.email){
      return user.save().then((savedUser) => {
        logger.info('********  PASSWORD RESET ********', email);
        return ({ user });
      });
    }else{
      user.secondary.forEach(function(data){
        if(data.emails == email){
          if(data.status == 'verified'){
            return user.save().then((savedUser) => {
              logger.info('********  PASSWORD RESET ********', user.local.email);
              return ({ user });
            });
          } else {
            throw new Error('Oops! This Email is not verified with your account yet,Please try with another one.')
          }
        }
      });
      return ({ user });
    }
  });
};


/**
 * Confirms user password reset and deletes the password reset token.
 *
 * Token must match the value in DB as well as be NOT expired.
 */
userSchema.statics.confirmPasswordReset = function confirmPasswordReset(token) {
  token = sanitize(decodeURIComponent((token)));
  //console.log(token);
  var promise = this.findOne({ 'passwordResetToken.token': token }).exec();
  //var promise = this.findOne({"registrationToken.token": token}).exec();
  return promise.then((user) => {
    if (!user) {
      throw new Error('Invalid password reset token');
    } else if (user.passwordResetToken.isExpired) {
    //} else if(user.registrationToken.isExpired){
      throw new Error('Sorry, your password reset request has expired. Please try resetting again.');
    } else {
      return user;
    }
  });
};

/**
 * set user's password when they register.  User must exist (by ID), new password must match
 * confirmation.
 */
userSchema.statics.setPassword = function setPassword(userId, newPassword, passwordConfirmation) {
  // never trust inputs
  userId = sanitize(userId);
  newPassword = sanitize(newPassword);
  passwordConfirmation = sanitize(passwordConfirmation);
  // validations
  if (newPassword != passwordConfirmation) {
    return Promise.reject(new Error('Password confirmation does not match the new password.'));
  }
  // return a promise
  return this.findById(userId).exec().then((user) => {
    user.local.password = newPassword;
    if (user.registrationToken) user.registrationToken.remove();
    if (user.passwordResetToken) user.passwordResetToken.remove();
    return user.save();
  });
};

// old password must be correct. validate current password when user changes their password
userSchema.statics.changePassword = function changePassword(userId, oldPassword, newPassword, passwordConfirmation) {
  // never trust inputs
  userId = sanitize(userId);
  oldPassword = sanitize(oldPassword);
  newPassword = sanitize(newPassword);
  passwordConfirmation = sanitize(passwordConfirmation);
  // validations
  if (newPassword != passwordConfirmation) {
    return Promise.reject(new Error('Password confirmation does not match the new password.'));
  }
  // return a promise
  return this.findById(userId).exec().then((user) => {

    // iff oldPassword is not correct, throw an error
    if (user.isPasswordValid(oldPassword)) {
      // old password is correct, so now we set the password
      user.local.password = newPassword;
      return user.save();
    }
    else {
      throw new Error('Your current password does not seem correct.  Please try again.');
    }
  });
};

userSchema.statics.saveProfile = function saveProfile(userId, email, profile) {
  userId = sanitize(userId);
  email = sanitize(email.toLowerCase());

  return this.findById(userId).exec().then((user) => {
    user.local.email = email;
    // user.profile.
    // var keys = ['street', 'city', 'postalCode', 'country']
    if (!user.profile) user.profile = new UserProfile();

    user.profile.address = profile.address;
    user.profile.contactInfo = profile.contactInfo;
    // Taster Profile
    user.profile.tasterProfile = profile.tasterProfile;
    user.profile.noDietaryPreferences = profile.noDietaryPreferences;
    //Update user referral ID
    if (user.temporaryInvitationId && user.temporaryReferrerUserId) {
          user.profile.referralId = user.temporaryInvitationId;
          //add user friend on the basis of referralId
          var userFriend = new UserFriends();
          var referrerUserId = new ObjectID(user.temporaryReferrerUserId);
          userFriend.invitedByUserId = referrerUserId;
          userFriend.invitedBy = 'Link';
          userFriend.userId = new ObjectID(user._id);
          userFriend.referralId = user.temporaryInvitationId;
          userFriend.status = 'Accepted';
          userFriend.acceptedAt = Date.now();
          userFriend.save();
          //clean temporary data
          user.temporaryInvitationId = null;
          user.temporaryReferrerUserId = null;
    }
    return user.save();
  });
};

/**
 * Updates the users lastLogin field to current date
 */
userSchema.statics.updateLastLogin = function updateLastLogin(userId) {
  return this.findById(userId).exec().then((user) => {
      user.lastLogin = new Date();
      return user.save();
  })
};

/**
 * Update permission group use in restaurant controller.js
 *@param userId
 *@param permissionGroup
 */
userSchema.statics.updatePermissionGroup = function updatePermissionGroup(userId, permissionGroup) {
  userId = ObjectID(userId);
  let options = { $set: {'profile.permissionGroups': permissionGroup } };
  return this.findOneAndUpdate({ _id: userId }, options, { new: true}).then((result) => {
    logger.info(`- - - - - - - - Update permissionGroups success (user ${userId})`);
    return { code: 0, message: 'Update permissionGroups success.' };
  }).catch((err) => {
    console.log(err);
    logger.error(`- - - - - - - - Update permissionGroups failed (user ${userId})`);
    return { code: 1, message: 'Update permissionGroups failed.', error: err };
  });
};

/**
 * when verification link clicked for a secondary email
 */
userSchema.statics.verifySecondaryEmail = function verifySecondaryEmail(userId, secondaryEmail,) {
  // never trust inputs
  userId = sanitize(userId);
  secondaryEmail = sanitize(secondaryEmail);
  // return a promise
  return this.updateOne({'secondary.emails': secondaryEmail, "_id" : ObjectID(userId) }, { $set: { 'secondary.$.status' : 'verified' } }).then((updatedDoc) => {
    if(updatedDoc.ok == 1){
      return this.findById(userId).exec().then((user) => {
        return user.save();
      });
    } else {
       return {code: 1, message:'Unable to verify new Email entered.'};
    }
  });

};

userSchema.statics.addSubUser = function addSubUser(data){
  email = sanitize(data.email.toLowerCase());

  // check if Email Is Exists
  var promise = this.findOne({ $or: [ { "local.email" : email }, { "secondary.emails": email  } ] }).exec();

  return promise.then((foundUser) => {
    if(foundUser){
      throw new Error(`Email address ${email} has already taken.`);
    }else{
      var subUser = mongoose.model('User',userSchema);
      var newSubUser = new subUser();
      newSubUser.parentUserId = data.parentUserId;
      newSubUser.local.email = data.email;
      newSubUser.profile = new UserProfile();
      if(data.imageUrl){
        newSubUser.profile.imageUrl = data.imageUrl
      } else {
        newSubUser.profile.imageUrl =`${data.origin}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png` ;
      }
      newSubUser.profile.contactInfo.firstName = data.firstName;
      newSubUser.profile.contactInfo.lastName = data.lastName;
      newSubUser.profile.contactInfo.phone = data.phone;
      if(data.referrerUserId) newSubUser.referrerUserId = data.referrerUserId;
      return (newSubUser);
    }
  })
  // save the Sub User Details
  .then((newSubUser) => {
    return newSubUser.save().then((savedSubUser) => {
      logger.info('********  SUB USER ADDED SUCCESSFULLY ********', savedSubUser.local.email);
      return ({subUser: savedSubUser});
    }).catch(function(err){
      return err.message;
    });
  });
};

userSchema.statics.findByEmail = function (email){
  return this.findOne({ 'local.email': email }).exec();
}

userSchema.statics.findByPhone = function (phone){
  return this.findOne({ 'profile.contactInfo.phone': phone }).exec();
}

// Add Employee Profile
userSchema.statics.addEmployeeProfile = function(data){
  loginEmail = sanitize(data.loginEmail.toLowerCase());
  const promise = this.findOne({'local.email': loginEmail});
  return promise.then(async (foundEmployeeProfile) => {
      if(foundEmployeeProfile){
        throw new Error(`${data.mailType} Email ${loginEmail} Already Taken`);
      }else{
          // Add Employee profile data
          const User = mongoose.model('User',userSchema);
          const newEmployeeProfile = new User();
          newEmployeeProfile.parentUserId = data.parentUserId;
          newEmployeeProfile.employeeProfile = new EmployeeProfile();
          newEmployeeProfile.employeeProfile.metaData = new MetaData();
          // Add meta data info
          newEmployeeProfile.employeeProfile.metaData.createdBy = data.parentUserId;
          newEmployeeProfile.employeeProfile.metaData.createdAt = MetaData.dateInfo();

          // Add details at root level
          newEmployeeProfile.local.email = loginEmail;
          newEmployeeProfile.isActive = data.isActive;

          // Add employee name
           newEmployeeProfile.profile = new UserProfile();
           if(data.imageUrl){
            newEmployeeProfile.profile.imageUrl = data.imageUrl
          } else {
            newEmployeeProfile.profile.imageUrl =`http://${data.origin}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png` ;
          }
           newEmployeeProfile.profile.timeZone = data.timeZone;
           newEmployeeProfile.profile.contactInfo.firstName = data.firstName;
           newEmployeeProfile.profile.contactInfo.lastName = data.lastName;

           //Add Employee Details
          newEmployeeProfile.employeeProfile.departmentId = data.departmentId;
          newEmployeeProfile.employeeProfile.jobProfileId = data.jobProfileId;
          newEmployeeProfile.employeeProfile.companyId = data.companyId;
          newEmployeeProfile.employeeProfile.branchId = data.branchId;
          newEmployeeProfile.employeeProfile.esiPfJoiningDate = data.esiPfJoiningDate;
          newEmployeeProfile.employeeProfile.joiningDate = data.joiningDate;
          newEmployeeProfile.employeeProfile.relivingDate = data.relivingDate;
          newEmployeeProfile.employeeProfile.resignDate = data.resignDate;
          newEmployeeProfile.employeeProfile.resignReason = data.resignReason;

          //Add Employee Age
          if(data.dob){
            var dob = new Date(data.dob);
            var age = Math.abs( moment(dob).diff(new Date(),'years'));
            newEmployeeProfile.employeeProfile.dob = data.dob;
            newEmployeeProfile.employeeProfile.age = age;
          }

          // Add employee contact info
          if(data.contactDetails){
            newEmployeeProfile.employeeProfile.contactDetails = data.contactDetails
          }
          return(newEmployeeProfile);
      }
  })
  // save Employee profile details
  .then((newEmployeeProfile) => {
      return newEmployeeProfile.save().then(async(savedEmployeeProfile) => {
        if(data.isTL === false){
          var updateData = {
            "employeeProfile.managerId": data.companyId
          }
          await this.findOneAndUpdate({_id: ObjectID(savedEmployeeProfile._id)},updateData,{new: true});
        } else if(data.isTL === true){
          if(data.tlId.length === 0){
            var requestTlId = new objectIdValidator('timtamtomted');
          } else {
            var requestTlId = new objectIdValidator(data.tlId);
          }
          if(requestTlId == data.tlId){
            var updateIdsArray = {
              "userId": savedEmployeeProfile._id,
              "parentUserId": data.tlId
            }
            var updateData = {
              "employeeProfile.parentUserIds": updateIdsArray
            }
            await this.findOneAndUpdate({_id: ObjectID(savedEmployeeProfile._id)},{$push: updateData},{new: true});
          }
        }
          logger.info('********  EMPLOYEE PROFILE ADDED SUCCESSFULLY ********', savedEmployeeProfile.employeeProfile.contactDetails.personal.email);
          return ({employeeProfile: savedEmployeeProfile});
      }).catch(function(err){
          throw new Error (err);
      });
  })
};

// Set Employee user password
userSchema.statics.setEmployeePassword = function setPassword(data) {
  userId = sanitize(data.userId);
  newPassword = sanitize(data.password);
  passwordConfirmation = sanitize(data.passwordConfirmation);
  // validations
  if (newPassword != passwordConfirmation) {
    return Promise.reject(new Error('Password confirmation does not match the new password.'));
  }
  // return a promise
  return this.findById(userId).exec().then((user) => {
    user.local.password = newPassword;
    return user.save();
  });
};


userSchema.statics.getDisplayName = function (userId){
  return this.findById({_id:ObjectID(userId)}).then((user) => {
    if(user.profile.contactInfo.firstName){
      return(user.profile.contactInfo.fullName);
    }else{
      return(user.employeeProfile.contactDetails.personal.email);
    }
  })
}

userSchema.statics.availableTimeZone = async function(){
  try{
    var timeZone = await mongoose.connection.collection("world_timezone").find({}).sort({timezone_name: 1}).toArray();
    return timeZone;
  }catch(err){
    return err;
  }

}

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
