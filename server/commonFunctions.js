const User = require('./models/user');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');

module.exports.isEmpty = function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

// Delete empty object inside the object
module.exports.cleanEmpties = function cleanEmpties(obj) {
  for (var key in obj) {
    if (!obj[key] || typeof obj[key] !== "object") {
      continue // If null or not an object, skip to the next iteration
    }

    // The property is an object
    if (Object.keys(obj[key]).length === 0) {
      delete obj[key]; // The object had no properties, so delete that property
    }
  }
  return obj;
}

module.exports.cleanNull = function cleanNull(updateData) {
  for (var item in updateData) {
    if (updateData[item] === null || updateData[item] === undefined) {
      delete updateData[item];
    }
  }
  return updateData;
}

// Clean Empty String
module.exports.cleanEmpytString = function cleanEmpytString(updateData){
  for (var item in updateData) {
    if (updateData[item] === '') {
      delete updateData[item];
    }
  }
  return updateData;
}

// To get first name from the full name
module.exports.getFirstName = function (name) {
  if (name.indexOf(" ") == -1) {
    return name;
  } else {
    return name.substr(0, name.indexOf(" "));
  }
}

// To get last name from the full name
module.exports.getLastName = function (name) {
  if (name.indexOf(" ") == -1) {
    return " ";
  } else {
    return name.substr(name.indexOf(" ") + 1);
  }
}

// check if value is empty
module.exports.valueIsEmpty = function (data) {
  if (data.length === 0) {
    return true;
  }
  return false;
}

// return leave Template
module.exports.createLeaveTemplate = function (data) {
  var leaveTemplate = data.replace(/\s?(<br\s?\/?>)\s?/g, "\r\n");
  return leaveTemplate;
}

module.exports.permissionStatus = function (data) {
  if (data === 'rajat.jain@aryavratinfotech.com' || data === 'araiput887@gmail.com') {
    return ["APPROVE_LEAVE"];
  } else {
    return [];
  }
}

// Parent user id Details
module.exports.parentUserIdDetails = async function (data) {
  try {
    var returnParentUserDetails = [];
    if (data.employeeProfile.parentUserIds.length > 0) {
      for (var i = 0; i < data.employeeProfile.parentUserIds.length; i++) {
        returnParentUserDetails.push({
          parentUserId: data.employeeProfile.parentUserIds[i].parentUserId,
          parentName: await User.getDisplayName(data.employeeProfile.parentUserIds[i].parentUserId)
        })
      }
      return returnParentUserDetails;
    } else {
      return returnParentUserDetails = [];
    }
  } catch (err) {
    throw new Error(err.message);
  }
}

// Return if employee is an parent
module.exports.isParentStatus = async function (employeeId) {
  var childUsers = await User.find({ "employeeProfile.parentUserIds.parentUserId": employeeId })
  if (childUsers.length === 0) {
    return false;
  } else if (childUsers.length > 0) {
    return true;
  }
}

// Generate trno
module.exports.getCurrentTrno = function getCurrentTrno() {
  const newDate = new Date();
  return Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds());
}

// Check if user is already assign with the given user
module.exports.userAlreadyAssign = async function userAlreadyAssign(parentIdsData, userId) {
  try {
    var hadParentId = false;
    return User.findById({ _id: ObjectID(userId) }).then((foundUser) => {
      if (foundUser) {
        for (var i = 0; i < foundUser.employeeProfile.parentUserIds.length; i++) {
          if (foundUser.employeeProfile.parentUserIds[i].parentUserId == parentIdsData.parentIdsData.parentUserId) {
            hadParentId = true;
          } else {
            continue;
          }
        }
        return hadParentId;
      } else {
        throw new Error(`Given wrong userId`);
      }
    }).catch(function (err) {
      throw new Error(err.message);
    })
  } catch (err) {
    throw new Error(err.message);
  }
}

// Unassign the parent ids
module.exports.unassignIds = async function (userId, parentUserId) {
  try {
    var unassignParentId, count = 0;
    return User.findById({ _id: ObjectID(userId) }).then((foundUser) => {
      if (foundUser) {
        var user = foundUser.employeeProfile.parentUserIds;
        // remove Id
        if (user.length === 0) {
          throw new Error(`There is no Parent Id to remove`);
        } else {
          for (var i = 0; i < user.length; i++) {
            if (user[i].parentUserId == parentUserId) {
              unassignParentId = user[i]._id;
              count = 1;
            } else {
              continue
            }
          }
          if (count === 0) {
            throw new Error(`Please check your Parent User Id you had entered`);
          }
          return unassignParentId;
        }
      } else {
        throw new Error(`Please check the User Id you had entered`);
      }
    })
  } catch (err) {
    return err;
  }
}

// Change date format(DD-MM-YYYY)
module.exports.dateFormat = function (date) {
  var date = new Date(date);
  if (date.getMonth() + 1 < 10 && date.getDate() < 10) {
    return (`0${date.getDate()}-0${date.getMonth() + 1}-${date.getFullYear()}`);
  } else if (date.getDate() < 10) {
    return (`0${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`);
  } else if (date.getMonth() + 1 < 10) {
    return (`${date.getDate()}-0${date.getMonth() + 1}-${date.getFullYear()}`);
  } else {
    return (`${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`);
  }
}

// Change date format(YYYY-MM-DD)
module.exports.dateFormatAlter = function (date) {
  if (date.getMonth() + 1 < 10 && date.getDate() < 10) {
    return (`${date.getFullYear()}-0${date.getMonth() + 1}-0${date.getDate()}`);
  } else if (date.getDate() < 10) {
    return (`${date.getFullYear()}-${date.getMonth() + 1}-0${date.getDate()}`);
  } else if (date.getMonth() + 1 < 10) {
    return (`${date.getFullYear()}-0${date.getMonth() + 1}-${date.getDate()}`);
  } else {
    return (`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
  }
}

module.exports.attendanceListResponse = function(companyList,leaveList){
  try{
    var attendanceResponse = {};
    // Add Company Attendance
    companyList.forEach( item => {
      var year = item.holidayDate.getFullYear();
      var getMonth = item.holidayDate.getMonth()+1;
      var month = getMonth.toString().padStart(2,'0');

      var dateDetail = {
        title:item.title,
        type:item.type,
        description: "",
        leaveStatus: "",
        leaveFor:"",
        date: this.dateFormatAlter(item.holidayDate)
      }
      if(attendanceResponse[year]){
        if(attendanceResponse[year][month]){
          attendanceResponse[year][month].push(dateDetail);
        }else{
          attendanceResponse[year][month] = [];
          attendanceResponse[year][month].push(dateDetail);
        }
      }else{
        attendanceResponse[year] = {};
        attendanceResponse[year][month] = [];
        attendanceResponse[year][month].push(dateDetail);
      }
    });

    // Add Employee Attendance
if(leaveList.length>0){
  leaveList.forEach(item => {
        if(item.status === 'Approved' || item.status === 'Pending'){
          var reason = item.reason;
        } else if(item.status === 'Rejected') {
          var reason = item.rejectReason;
        } else if(item.status === 'Deleted'){
          return;
        }
        var status = item.status;
        item.dates.forEach(item => {
          var year = item.date.getFullYear();
          var getMonth = item.date.getMonth()+1;
          var month = getMonth.toString().padStart(2,'0');
          var dateDetail ={
            title: "Leave",
            type: "LEAVE",
            description: reason,
            leaveStatus: status,
            leaveFor: item.leaveFor,
            date: this.dateFormatAlter(item.date),
          }
          if(attendanceResponse[year]){
            if(attendanceResponse[year][month]){
              attendanceResponse[year][month].push(dateDetail);
            }else{
              attendanceResponse[year][month] = []
              attendanceResponse[year][month].push(dateDetail);
              }
          } else {
            attendanceResponse[year] = {};
            attendanceResponse[year][month] = [];
            attendanceResponse[year][month].push(dateDetail);
          }
        })
      })
    }
    // Convert Json Object in Array
    var returnResponse = [];
    for (var key in attendanceResponse) {
      if (attendanceResponse.hasOwnProperty(key)) {
          for(var month in attendanceResponse[key]){
            if(attendanceResponse[key].hasOwnProperty(month)){
              if(returnResponse.length === 0){
                var attendanceData = {
                  year: key,
                  month: [{
                    month : month,
                    days: attendanceResponse[key][month]
                  }]
                }
                returnResponse.push(attendanceData);
              } else {
                returnResponse.forEach((item) => {
                  if(item.year === key){
                    var attendanceData = {
                      month: month,
                      days: attendanceResponse[key][month]
                    }
                    item.month.push(attendanceData);
                  } else {
                    var attendanceData = {
                      year: key,
                      month: [{
                        month : month,
                        days: attendanceResponse[key][month]
                      }]
                    }
                    returnResponse.push(attendanceData);
                  }
                });
              }
            }
          }
      }
  }
    return (returnResponse);
  }catch(err){
    throw new Error(err.message);
  }
}


// Get user Info
module.exports.getUserInfo = async function (userId) {
  try {
    var user = await User.findById({ _id: ObjectID(userId) });
    return user;
  } catch (err) {
    throw new Error(err.message);
  }
}

// Get the file size
module.exports.getFileSize = function(fileSize) {
  try{
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (fileSize == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(fileSize) / Math.log(1024)));
    return Math.round(fileSize / Math.pow(1024, i), 2) + ' ' + sizes[i];
  } catch(err) {
    return err.message;
  }
}

// Month Number
module.exports.changeMonthNumber = function(month) {
  try{
    var monthNumber;
    switch(month){
      case "jan":
        monthNumber = 01;
        break;
      case "feb":
        monthNumber = 02;
        break;
      case "mar":
        monthNumber = 03;
        break;
      case "apr":
        monthNumber = 04;
        break;
      case "may":
        monthNumber = 05;
        break;
      case "jun":
        monthNumber = 06;
        break;
      case "jul":
        monthNumber = 07;
        break;
      case "aug":
        monthNumber = 08;
        break;
      case "sep":
        monthNumber = 09;
        break;
      case "oct":
        monthNumber = 10;
        break;
      case "nov":
        monthNumber = 11;
        break;
      case "dec":
        monthNumber = 12;
        break;
    }
    return monthNumber;
  } catch(err){
    return err;
  }
}

// Get the Age From DOB
module.exports.getAge = function(dob){
  var dob = new Date(dob);
  var age = Math.abs( moment(dob).diff(new Date(),'years'));
  return age;
}

// Change Number to month
module.exports.changeNumberMonth = function(month) {
  try {
    var monthNumber;
    switch(month){
      case "01":
        monthNumber = 'January';
        break;
      case "02":
        monthNumber = 'February';
        break;
      case "03":
        monthNumber = "March";
        break;
      case "04":
        monthNumber = 'April';
        break;
      case "05":
        monthNumber = 'May';
        break;
      case "06":
        monthNumber = 'June';
        break;
      case "07":
        monthNumber = 'July';
        break;
      case "08":
        monthNumber = 'August';
        break;
      case "09":
        monthNumber = 'September';
        break;
      case "10":
        monthNumber = 'October';
        break;
      case "11":
        monthNumber = 'November';
        break;
      case "12":
        monthNumber = 'December';
        break;
    }
    return monthNumber;
  } catch (error) {
    return error
  }
}