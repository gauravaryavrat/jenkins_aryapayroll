const MetaData = require('../models/meta-data');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;
const commonFunction = require('../commonFunctions');
const moment = require('moment');

// Add Earned Leave
module.exports.addEarnedLeave = async function(req,res){
    try{
        if( (!req.body.earnedLeave.month) || (!req.body.earnedLeave.year)){
            return res.send( {status:'error', message:"Missing Month and Year"} );
        }
        // Check if user add leave for current month
        var currentDate = commonFunction.dateFormatAlter(new Date());
        var enteredDate = `${req.body.earnedLeave.year}-${commonFunction.changeMonthNumber(req.body.earnedLeave.month.toLowerCase())}-01`;
        if(moment(enteredDate).isAfter(currentDate,'month')){
          throw new Error(`You can not add earned leave balance for upcoming month ${req.body.earnedLeave.month} year ${req.body.earnedLeave.year}.`);
        } else if (moment(enteredDate).isBefore(currentDate,'month')){
          throw new Error(`You can not add earned leave balance for previous month ${req.body.earnedLeave.month} year ${req.body.earnedLeave.year}.`);
        }

        var employeeDetails = await User.findById({_id: ObjectID(req.params.employeeId)});
        if(employeeDetails.employeeProfile.earnedLeave){
          if(employeeDetails.employeeProfile.earnedLeave.length > 0){
            employeeDetails.employeeProfile.earnedLeave.forEach((items) => {
                if(items.month === req.body.earnedLeave.month && items.year === req.body.earnedLeave.year){
                    throw new Error(`Earned Leave Balance is Already Added for the month ${items.month} year ${items.year}. You can Update Earned Leave Balance If you want`);
                } else {
                    return;
                }
            })
        }
        }

        if(req.body.earnedLeave){
            var updateData = req.body.earnedLeave;
            updateData.metaData = new MetaData();
            updateData.metaData.createdAt = MetaData.dateInfo();
            updateData.metaData.createdBy = req.params.userId;
            var previousLeaveBalance = parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
            var currentLeaveBalance;

            if(parseFloat(req.body.earnedLeave.leaveCount).toString() === 'NaN'){
              currentLeaveBalance = 0;
            } else {
              currentLeaveBalance = parseFloat(req.body.earnedLeave.leaveCount);
            }

            var earnedLeave = {
              month: req.body.earnedLeave.month,
              year: req.body.earnedLeave.year,
              leaveCount: req.body.earnedLeave.leaveCount,
              employeeId: req.params.employeeId,
              userId: req.params.userId,
              reason: req.body.earnedLeave.reason
            }

            var earnedLeaveBalance = (previousLeaveBalance + currentLeaveBalance).toFixed(2).toString();
            if(previousLeaveBalance < 0){
              if(earnedLeaveBalance < 0){
                earnedLeave.reason = `${req.body.earnedLeave.reason} and also adjust your previous month earned leave balance ${previousLeaveBalance} and still ${earnedLeaveBalance} remaining`;
              } else {
                earnedLeave.reason = `${req.body.earnedLeave.reason} and also adjust your previous month earned leave balance ${previousLeaveBalance} and now Earned Leave Balance is ${earnedLeaveBalance}`;
              }
            }
            var updatedEarnedLeave = await User.findOneAndUpdate({_id: ObjectID(req.params.employeeId)},{"employeeProfile.payroll.earnedLeaveBalance":earnedLeaveBalance,$push:{"employeeProfile.earnedLeave": updateData}},{new: true});
            await maintainEarnedLeaveHistory(earnedLeave);
            return res.send({status: 'success', message: 'Earned Leave Balance Added Successfully', data: updatedEarnedLeave.employeeProfile.earnedLeave});
        } else {
            return res.send({status: 'error', message: 'Unable To Add Earned Leave'});
        }
    } catch(err){
        return res.send({status:'error', message: err.message});
    }
}

// Add comp-Off Earned Balance
module.exports.addEarnedLeaveBalance = async function addEarnedLeaveBalance(data){
  try{
    if(data.earnedLeave){
      var updateData = data.earnedLeave;
      updateData.metaData = new MetaData();
      updateData.metaData.createdAt = MetaData.dateInfo();
      updateData.metaData.createdBy = data.userId;
      var previousLeaveBalance = parseFloat(data.employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
      var currentLeaveBalance;

      if(parseFloat(data.earnedLeave.leaveCount).toString() === 'NaN'){
        currentLeaveBalance = 0;
      } else {
        currentLeaveBalance = parseFloat(data.earnedLeave.leaveCount);
      }

      var earnedLeave = {
        month: data.earnedLeave.month,
        year: data.earnedLeave.year,
        leaveCount: data.earnedLeave.leaveCount,
        employeeId: data.employeeId,
        userId: data.userId,
        reason: data.earnedLeave.reason
      }
      var earnedLeaveBalance = (previousLeaveBalance + currentLeaveBalance).toFixed(2).toString();
      earnedLeave.reason = `${data.earnedLeave.reason} and add comp off leave balance to your earned leave balance ${previousLeaveBalance} and now Earned Leave Balance is ${earnedLeaveBalance}`;
      await User.findOneAndUpdate({_id: ObjectID(data.employeeId)},{"employeeProfile.payroll.earnedLeaveBalance":earnedLeaveBalance,$push:{"employeeProfile.earnedLeave": updateData}},{new: true});
      await maintainEarnedLeaveHistory(earnedLeave);
  }
  } catch(err){
    return err;
  }
}

// Update Earned Leave
module.exports.updateEarnedLeave = async function(req, res) {
    try {
      var earnedLeaveId = req.params.earnedLeaveId;
      var employeeId = req.params.employeeId;
      var existingLeaveBalance;

      var employeeDetails = await User.findById({_id: ObjectID(req.params.employeeId)});
        if(employeeDetails.employeeProfile.earnedLeave.length > 0){
            employeeDetails.employeeProfile.earnedLeave.forEach((items) => {
                if(items.month === req.body.earnedLeave.month && items.year === req.body.earnedLeave.year && items._id != req.params.earnedLeaveId){
                    throw new Error(`Earned Leave Balance is Already Added for the month ${items.month} year ${items.year}.`);
                } else if(items.month === req.body.earnedLeave.month && items.year === req.body.earnedLeave.year && items._id == req.params.earnedLeaveId) {
                     existingLeaveBalance = parseFloat(items.leaveCount);
                } else {
                  return;
                }
            })
        }

        if(parseFloat(req.body.earnedLeave.leaveCount)<0){
          throw new Error(`You can not update the value less than the Zero`);
        }

        var currentLeaveBalance = parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
        var requestLeaveBalance = parseFloat(req.body.earnedLeave.leaveCount);
        var manipulateCurrentBalance = existingLeaveBalance - requestLeaveBalance;
        var updateLeavebalance;

        var earnedLeave = {
          month: req.body.earnedLeave.month,
          year: req.body.earnedLeave.year,
          leaveCount: req.body.earnedLeave.leaveCount,
          employeeId: req.params.employeeId,
          userId: req.params.userId,
          reason: req.body.earnedLeave.reason
        }
        var deductionEarnedLeave = {
          month: req.body.earnedLeave.month,
          year: req.body.earnedLeave.year,
          leaveCount: req.body.earnedLeave.leaveCount,
          employeeId: req.params.employeeId,
          userId: req.params.userId,
          reason: req.body.earnedLeave.reason
        }
          if(existingLeaveBalance != requestLeaveBalance){
            if(currentLeaveBalance < 0 ){
              if(manipulateCurrentBalance > 0){
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                deductionEarnedLeave.reason = `${req.body.earnedLeave.reason} and also deduct your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainDeductionEarnedLeave(deductionEarnedLeave);
              } else {
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                earnedLeave.reason = `${req.body.earnedLeave.reason} and also update your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainEarnedLeaveHistory(earnedLeave);
              }
            } else if(currentLeaveBalance >0) {
              if(manipulateCurrentBalance > 0){
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                deductionEarnedLeave.reason = `${req.body.earnedLeave.reason} and also deduct your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainDeductionEarnedLeave(deductionEarnedLeave);
              } else {
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                earnedLeave.reason = `${req.body.earnedLeave.reason} and also update your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainEarnedLeaveHistory(earnedLeave);
              }
            } else {
              if(manipulateCurrentBalance > 0){
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                deductionEarnedLeave.reason = `${req.body.earnedLeave.reason} and also deduct your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainDeductionEarnedLeave(deductionEarnedLeave);
              } else {
                updateLeavebalance = currentLeaveBalance - manipulateCurrentBalance;
                earnedLeave.reason =  `${req.body.earnedLeave.reason} and also update your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`;
                maintainEarnedLeaveHistory(earnedLeave);
              }
            }
          } else {
            updateLeavebalance = req.body.earnedLeave.leaveCount;
          }

      if (req.body.earnedLeave) {
        return User.findOneAndUpdate(
          {
            _id: ObjectID(employeeId),
            "employeeProfile.earnedLeave._id": ObjectID(earnedLeaveId)
          },
          {"employeeProfile.payroll.earnedLeaveBalance":updateLeavebalance,
            $set: {
              "employeeProfile.earnedLeave.$.month": req.body.earnedLeave.month,
              "employeeProfile.earnedLeave.$.year":
                req.body.earnedLeave.year,
              "employeeProfile.earnedLeave.$.leaveCount":
                req.body.earnedLeave.leaveCount,
              "employeeProfile.earnedLeave.$.reason": req.body.earnedLeave.reason,
              "employeeProfile.earnedLeave.$.metaData.updatedBy": req.params.userId,
              "employeeProfile.earnedLeave.$.metaData.updatedAt":
                MetaData.dateInfo(),
            }
          },
          { new: true }
        ).then(updatedEarnedLeave => {
          return res.send({
            status: 'success',
            message: "Employee Earned Leave Updated Successfully",
            data: updatedEarnedLeave.employeeProfile.earnedLeave
          });
        });
      } else {
        return res.send({
          status: "error",
          message: "Please update values to see changes"
        });
      }
    } catch (err) {
      return res.send({ status: "error", message: err.message });
    }
  };

  // Update Comp-Off Balance
exports.updateEarnedLeaveBalance =  async function updateEarnedLeaveBalance(data){
  try{
    var currentLeaveBalance = parseFloat(data.employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
    var requestLeaveBalance = parseFloat(data.earnedLeave.leaveCount);
    var manipulateCurrentBalance = data.existingLeaveBalance - requestLeaveBalance;
    var updateLeavebalance;

    var earnedLeave = {
      month: data.earnedLeave.month,
      year: data.earnedLeave.year,
      leaveCount: data.earnedLeave.leaveCount,
      employeeId: data.employeeId,
      userId: data.userId,
      reason: data.earnedLeave.reason
    }

    var deductionEarnedLeave = {
      month: data.earnedLeave.month,
      year: data.earnedLeave.year,
      leaveCount: data.earnedLeave.leaveCount,
      employeeId: data.employeeId,
      userId: data.userId,
      reason: data.earnedLeave.reason
    }

// Update Comp Off Leave
if(data.count){
  if(data.count ==='compOff'){
    updateLeavebalance = currentLeaveBalance + data.earnedLeave.leaveCount;
    data.earnedLeave.leaveCount = data.existingLeaveBalance + data.earnedLeave.leaveCount;
    data.earnedLeave.reason = data.earnedLeave.reason;
    earnedLeave.reason = `${data.earnedLeave.reason} and also add comp off leave balance to your earned leave balance ${currentLeaveBalance} which is now ${updateLeavebalance}`
    await maintainEarnedLeaveHistory(earnedLeave);
  }
}

// Update Earned Leave Balance
    if (data.earnedLeave) {
      var updatedBalance = await User.findOneAndUpdate(
        {
          _id: ObjectID(data.employeeId),
          "employeeProfile.earnedLeave._id": ObjectID(data.earnedLeaveId)
        },
        {"employeeProfile.payroll.earnedLeaveBalance":updateLeavebalance,
          $set: {
            "employeeProfile.earnedLeave.$.month": data.earnedLeave.month,
            "employeeProfile.earnedLeave.$.year":
              data.earnedLeave.year,
            "employeeProfile.earnedLeave.$.leaveCount":
              data.earnedLeave.leaveCount,
            "employeeProfile.earnedLeave.$.reason": data.earnedLeave.reason,
            "employeeProfile.earnedLeave.$.metaData.updatedBy": data.userId,
            "employeeProfile.earnedLeave.$.metaData.updatedAt":
              MetaData.dateInfo(),
          }
        },
        { new: true }
      )
      return(updatedBalance);
    }
  } catch(err){
    return err;
  }
}


// Maintain Earned Leave History
async function maintainEarnedLeaveHistory (earnedLeave){
  try{
    var addData = {
      month: earnedLeave.month,
      year: earnedLeave.year,
      leaveCount: earnedLeave.leaveCount,
      reason: earnedLeave.reason
    }
    addData.metaData = new MetaData();
    addData.metaData.createdBy = earnedLeave.userId;
    addData.metaData.createdAt = MetaData.dateInfo();
    await User.findOneAndUpdate({_id:ObjectID(earnedLeave.employeeId)},{$push:{"employeeProfile.earnedLeaveHistory":addData}});
  } catch(err){
    return err;
  }
}

// List Individual Earned Leave Details
module.exports.earnedLeaveDetails = async function(req,res){
    try{
        var employeeDetails = await User.findById({_id: ObjectID(req.params.employeeId)});
        var earnedLeaveDetails = {};
        if(employeeDetails.employeeProfile.earnedLeave.length > 0){
            employeeDetails.employeeProfile.earnedLeave.forEach((items) => {
                if(items._id == req.params.earnedLeaveId){
                    earnedLeaveDetails._id = employeeDetails._id;
                    earnedLeaveDetails.month = items.month;
                    earnedLeaveDetails.year = items.year;
                    earnedLeaveDetails.leaveCount = items.leaveCount;
                    earnedLeaveDetails.reason = items.reason;
                } else {
                    return;
                }
            })
            return res.send({status: 'success', message: 'Employee Earned List Successfully', data: earnedLeaveDetails});
        } else {
            return res.send({status: 'success', message: 'Employee Earned List Successfully', data: earnedLeaveDetails});
        }
    } catch(err){
        return res.send({status:'error', message: err.message});
    }
}


// List All Earned Leave
module.exports.listAllEarnedLeave = async function(req,res){
    try{
      var companyId = req.params.companyId;
      var existingEmployee = await User.find({"employeeProfile.companyId": ObjectID(companyId)});
      var employeeIdHavingEarnedLeave = [];
      var employeeEarnedLeaveDetails = {};
      var returnEarnedLeaveData = [];

      if(existingEmployee.length > 0){
        for(var i = 0 ; i<existingEmployee.length; i++){
          if(existingEmployee[i].employeeProfile.earnedLeave.length > 0){
            var employeeDetails = {
              _id: existingEmployee[i]._id,
              name: await User.getDisplayName(existingEmployee[i]._id)
            }
            employeeIdHavingEarnedLeave.push(employeeDetails);
          }
        }
      }
      // console.log(JSON.stringify(employeeIdHavingEarnedLeave));
      var year,month;
        if(req.params.year.length === 0 || req.params.month.length === 0 ){
          const currentYear = new Date();
          year = (currentYear.getFullYear()).toString();
          month = currentYear.toString().substring(4,8);
        } else {
          year = req.params.year;
          month = req.params.month;
        }

        for(var i = 0; i<employeeIdHavingEarnedLeave.length; i++){

          employeeEarnedLeaveDetails._id = employeeIdHavingEarnedLeave[i]._id;
          employeeEarnedLeaveDetails.name = employeeIdHavingEarnedLeave[i].name;

          var earnedLeaveDetails =  await User.aggregate([
            {$match: { _id: ObjectID(employeeIdHavingEarnedLeave[i]._id) }},
            {
              $project: {
                earnedLeaveDetails: {
                    $filter: {
                       input: "$employeeProfile.earnedLeave",
                       as: "earnedLeave",
                       cond: {$and: [
                        { $eq: [ "$$earnedLeave.year", year ] },
                        { $eq: [ "$$earnedLeave.month", month ] },
                       ]}
                    }
                 }
              }
           }
        ])

        if(earnedLeaveDetails[earnedLeaveDetails.length -1].earnedLeaveDetails.length != 0){
          employeeEarnedLeaveDetails.month = earnedLeaveDetails[earnedLeaveDetails.length-1].earnedLeaveDetails[earnedLeaveDetails.length-1].month;
          employeeEarnedLeaveDetails.year = earnedLeaveDetails[earnedLeaveDetails.length-1].earnedLeaveDetails[earnedLeaveDetails.length-1].year;
          employeeEarnedLeaveDetails.leaveCount = earnedLeaveDetails[earnedLeaveDetails.length-1].earnedLeaveDetails[earnedLeaveDetails.length-1].leaveCount;
          employeeEarnedLeaveDetails.reason = earnedLeaveDetails[earnedLeaveDetails.length-1].earnedLeaveDetails[earnedLeaveDetails.length-1].reason;
          employeeEarnedLeaveDetails.earnedLeaveId = earnedLeaveDetails[earnedLeaveDetails.length-1].earnedLeaveDetails[earnedLeaveDetails.length-1]._id;
          returnEarnedLeaveData.push(employeeEarnedLeaveDetails);
          employeeEarnedLeaveDetails = {};
        }
        }
       return res.send({status: 'success', message: 'All Earned Leave List Successfully',data: returnEarnedLeaveData});

    } catch(err){
      return res.send({status:'error', message: err.message});
    }
}


// Maintain Deduction Earned Leave
async function maintainDeductionEarnedLeave (deductionEarnedLeave) {
  try {
    var addData = {
      month: deductionEarnedLeave.month,
      year: deductionEarnedLeave.year,
      leaveCount: deductionEarnedLeave.leaveCount,
      reason: deductionEarnedLeave.reason
    }
    addData.metaData = new MetaData();
    addData.metaData.createdBy = deductionEarnedLeave.userId;
    addData.metaData.createdAt = MetaData.dateInfo();
    await User.findOneAndUpdate({_id:ObjectID(deductionEarnedLeave.employeeId)},{$push:{"employeeProfile.deductionEarnedLeave":addData}});
  } catch(err){
    return err;
  }
}

// Filter Earned Leave Details

module.exports.filterEarnedLeave = async function filterEarnedLeave(req,res){
  try{

    let employeeId = req.params.employeeId;
    let year = req.params.year;
    let month = req.params.month;

    let earnedLeave = {
      _id: employeeId,
      name: await User.getDisplayName(employeeId)
    }

    let returnEarnedLeave = [];

    var earnedLeaveDetails =  await User.aggregate([
    {$match: { _id: ObjectID(employeeId) }},
    {
      $project: {
        earnedLeaveDetails: {
            $filter: {
               input: "$employeeProfile.earnedLeave",
               as: "earnedLeave",
               cond: {$and: [
                { $eq: [ "$$earnedLeave.year", year ] },
                { $eq: [ "$$earnedLeave.month", month ] },
               ]}
            }
         }
      }
   }
])
// console.log(earnedLeaveDetails)
if(earnedLeaveDetails[earnedLeaveDetails.length -1].earnedLeaveDetails === null || earnedLeaveDetails[earnedLeaveDetails.length -1].earnedLeaveDetails.length === 0){
  returnEarnedLeave = [];
} else {
  earnedLeave.month = earnedLeaveDetails[earnedLeaveDetails.length - 1].earnedLeaveDetails[earnedLeaveDetails.length - 1].month;
  earnedLeave.year = earnedLeaveDetails[earnedLeaveDetails.length - 1].earnedLeaveDetails[earnedLeaveDetails.length - 1].year;
  earnedLeave.leaveCount = earnedLeaveDetails[earnedLeaveDetails.length - 1].earnedLeaveDetails[earnedLeaveDetails.length - 1].leaveCount;
  earnedLeave.reason = earnedLeaveDetails[earnedLeaveDetails.length - 1].earnedLeaveDetails[earnedLeaveDetails.length - 1].reason;
  earnedLeave.earnedLeaveId = earnedLeaveDetails[earnedLeaveDetails.length - 1].earnedLeaveDetails[earnedLeaveDetails.length - 1]._id;
  returnEarnedLeave.push(earnedLeave);
}

return res.send({status: 'success', message: 'Employee Earned Leave List Success', data: returnEarnedLeave});
  }catch(err){
    return res.send({status:'error', message: err.message});
  }


}

module.exports.earnedLeaveHistory = async function(req,res){
  try{
    let month = req.params.month;
    let year = req.params.year;
    let employeeId = req.params.employeeId;
    let returnHistory = {
      _id: employeeId
    }


    let earnedLeaveHistory = await fetchHistroy('earnedLeaveHistory',employeeId,year,month);
    let deductionLeaveHistory = await fetchHistroy('deductionEarnedLeave',employeeId,year,month);

    if((earnedLeaveHistory[earnedLeaveHistory.length - 1].historyDetails.length === 0)){
      returnHistory.earnedLeave = [];
    } else {
      returnHistory.earnedLeave = earnedLeaveHistory[earnedLeaveHistory.length - 1].historyDetails;
    }

    if(deductionLeaveHistory[deductionLeaveHistory.length - 1].historyDetails.length === 0){
      returnHistory.deductLeave = [];
    } else {
      returnHistory.deductLeave = deductionLeaveHistory[deductionLeaveHistory.length - 1].historyDetails;
    }
    return res.send({status:'success', message: 'Earned Leave History Success', data: returnHistory});
  } catch(err){
    return res.send({status:'error', message: err.message});
  }

async function fetchHistroy(histroyType,employeeId,year,month){
  try{
    var historyDetails =  await User.aggregate([
      {$match: { _id: ObjectID(employeeId)}},
      {
        $project: {
          historyDetails: {
              $filter: {
                 input: `$employeeProfile.${histroyType}`,
                 as: "earnedLeaveHistory",
                 cond: {$and: [
                  { $eq: [ "$$earnedLeaveHistory.year", year ] },
                  { $eq: [ "$$earnedLeaveHistory.month", month ] },
                 ]}
              }
           }
        }
     }
  ])
  if(historyDetails[historyDetails.length - 1].historyDetails === null){
    historyDetails[historyDetails.length - 1].historyDetails = [];
  }
  return (historyDetails);
  } catch(err){
    return err;
  }
}

}

// Delete Earned Leave
module.exports.deleteEarnedLeave = async function(req,res){
try{
  var employeeDetails = await User.findById({_id:ObjectID(req.params.employeeId)});
  updateLeaveCount = parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance) - parseFloat(req.params.leaveCount);
  // Delete Earned Leave History
  await User.findOneAndUpdate({_id: ObjectID(req.params.employeeId)},{$pull:{"employeeProfile.earnedLeaveHistory":{month:req.params.month, year:req.params.year}}},{multi: true});
  // Delete Deduction Leave History
  await User.findOneAndUpdate({_id: ObjectID(req.params.employeeId)},{$pull:{"employeeProfile.deductionEarnedLeave":{month:req.params.month, year:req.params.year}}},{multi: true});
  // Delete Earned Leave
  await User.findOneAndUpdate({_id: ObjectID(req.params.employeeId)},{$pull:{"employeeProfile.earnedLeave":{month:req.params.month, year:req.params.year}}},{multi: true});
  // Update Current Earned Leave Balance
  await User.findOneAndUpdate({_id:ObjectID(req.params.employeeId)},{"employeeProfile.payroll.earnedLeaveBalance":updateLeaveCount});

  return res.send({status: 'success', message: 'Earned Leave Deleted Successfully'});

}catch(err){
  return res.send({status:'error', message: err.message});
}
}

