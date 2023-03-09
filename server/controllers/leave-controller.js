// const Leaves = require('../models/leave');
const Leaves = require('../models/leave');
const LeaveType = require('../models/leaves-type');
const MetaData = require('../models/meta-data');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const commonFunction = require('../commonFunctions');
const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger')(module);
const emailSender = require('../lib/email-sender');
const leaveTemplateGen = require('../lib/leave-template-generator').leaveTemplateGenerator
const config = require('../config');
const earnedLeave = require('./earned-leave-controller');
const util = require('../utilities');
const device = require('../models/user-device');

// Add Leave
module.exports.addLeave = async function(req, res) {
    try {
        console.log("-----", req.body, req.params);
        if (!req.body.reason) {
            return res.send({ status: 'error', message: 'Reason for leave should be mention' });
        }
        if (req.body.leaveTypeId === 'compOff Leave') {
            var foundLeaveType = await LeaveType.findOne({ companyId: ObjectID(req.params.companyId), "leaveTypeName": req.body.leaveTypeId });
            if (foundLeaveType) {
                req.body.leaveTypeId = foundLeaveType._id;
            } else {
                var addLeaveTypeData = {
                    leaveTypeCode: 'Comp Off',
                    leaveTypeName: req.body.leaveTypeId,
                    companyId: req.params.companyId,
                    isPaid: true
                }
                var savedLeaveType = await LeaveType.addLeaveType(addLeaveTypeData);
                req.body.leaveTypeId = savedLeaveType.leaveType._id;
            }
        }
        const addData = req.body;
        const userId = req.params.userId;
        const requestToUserId = req.body.requestToUserId;
        addData.userId = userId;
        addData.requestToUserId = requestToUserId;
        console.log("=========================", req.body);
        // Check validity that user can't apply leave in previous date
        fromDate = req.body.fromDate;
        currentDate = commonFunction.dateFormatAlter(new Date());
        if (moment(fromDate).isBefore(currentDate)) {
            return res.send({ status: 'error', message: 'You can not apply leave on previous date' });
        } else if (!moment(fromDate).isSame(currentDate, 'year')) {
            return res.send({ status: 'error', message: 'You can not apply leave for next year' })
        } else {
            const newLeave = await Leaves.addLeave(addData);
            if (newLeave) {
                const returnLeaveData = {
                    _id: newLeave.leave._id,
                    avatar: newLeave.leave.avatar
                };
                return res.send({ status: 'success', message: 'Leave Added Successfully', data: returnLeaveData });
            } else {
                return res.send({ status: 'error', message: "Unable To Add Leave" });
            }
        }
    } catch (err) {
        console.log(err);
        return res.send({ status: 'error', message: err.message });
    }
};

// list all leaves
module.exports.listAllLeaves = async function(req, res) {
    try {
        const leaves = await Leaves.find({ "userId": ObjectID(req.params.userId) });
        return res.send({ status: 'success', message: 'Leave List Successfully', data: leaves });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
};

// Activity On Leave
module.exports.actionLeave = async function(req, res) {
    try {
        var userId = req.params.userId; //Who is taking action
        var leaveId = req.params.leaveId;
        var action = sanitize(req.body.action.toLowerCase());
        var status;
        var updateData = {};
        updateData.description = req.body.reason;
        updateData.userId = userId;
        updateData.createdAt = new Date();

        var foundLeave = await Leaves.findById({ _id: ObjectID(leaveId) });
        if (foundLeave) {
            if (foundLeave.status === 'Approved' && action === 'approve') {
                throw new Error('Leave is Already Approved');
            }
        } else {
            throw new Error('There Is No Leave With This Leave Name');
        }
        if (action === 'approve') { // When user Approve the leave
            if (userId == foundLeave.userId) {
                throw new Error('You can not approve/reject your own leave.');
            } else if (userId != foundLeave.requestToUserId) {
                throw new Error('You are not authorised to approve/reject this leave. ')
            } else {
                status = "Approved";
            }
        } else if (action === 'reject') { // When user Reject the leave
            if (userId == foundLeave.userId) {
                throw new Error('You can not approve/reject your own leave.');
            } else if (userId != foundLeave.requestToUserId) {
                throw new Error('You are not authorised to approve/reject this leave. ')
            } else {
                status = "Rejected";
            }
        } else if (action === 'delete') { // When user Delete the leave
            if (userId != foundLeave.userId) {
                throw new Error('You are not authorised to delete this leave.');
            } else {
                status = "Deleted";
            }
        } else if (action === 'sandwich') { // Sandwich The Leave
            if (userId == foundLeave.userId) {
                throw new Error('You can not Sandwich your own leave.');
            } else if (userId != foundLeave.requestToUserId) {
                throw new Error('You are not authorised to Sandwich this leave. ')
            } else {
                status = "Sandwich";
            }
        } else { // When none action taken by the user
            return res.send({ status: 'error', message: 'None Action Taken' });
        }
        if (action === 'approve' || action === 'delete' || action === 'sandwich') {
            var updatedLeave = await Leaves.findByIdAndUpdate({ _id: ObjectID(leaveId) }, { status: status }, { new: true })
        } else if (action === 'reject') {
            var updatedLeave = await Leaves.findByIdAndUpdate({ _id: ObjectID(leaveId) }, {
                rejectReason: req.body.reason,
                status: status
            }, { new: true })
        }
        var returnLeaveData = {
            leaveReason: updatedLeave.reason,
            status: updatedLeave.status,
        }


        // Add Comp Off Leave
        var leaveType = await LeaveType.findById({ _id: ObjectID(foundLeave.leaveTypeId) });
        if (updatedLeave.status === 'Approved') {
            if (leaveType) {
                if (leaveType.leaveTypeCode === "Comp Off") {
                    var currentDate = new Date().toString();
                    var month = currentDate.substring(currentDate.indexOf(" ") + 1, currentDate.indexOf(" ") + 4);
                    var year = currentDate.substring(11, 15);
                    var compOffCount = 0;
                    var compOffEarnedBalance = 0;

                    // Calculate Comp Off Days
                    foundLeave.dates.forEach((items) => {
                        if (items.leaveFor === "Second Half" || items.leaveFor === "First Half") {
                            compOffEarnedBalance += .5;
                        } else {
                            compOffEarnedBalance += 1;
                        }
                    })

                    var employeeDetails = await User.findById({ _id: ObjectID(foundLeave.userId) });
                    var sendCompOffData = {
                        earnedLeave: {
                            month: month,
                            year: year,
                            leaveCount: compOffEarnedBalance,
                            reason: updatedLeave.reason
                        }
                    }

                    if (employeeDetails.employeeProfile.earnedLeave) {
                        if (employeeDetails.employeeProfile.earnedLeave.length > 0) {
                            for (var i = 0; i < employeeDetails.employeeProfile.earnedLeave.length; i++) {
                                if (employeeDetails.employeeProfile.earnedLeave[i].month === month && employeeDetails.employeeProfile.earnedLeave[i].year === year) {
                                    sendCompOffData.existingLeaveBalance = parseFloat(employeeDetails.employeeProfile.earnedLeave[i].leaveCount),
                                        sendCompOffData.employeeDetails = employeeDetails,
                                        sendCompOffData.employeeId = foundLeave.userId,
                                        sendCompOffData.earnedLeaveId = employeeDetails.employeeProfile.earnedLeave[i]._id,
                                        sendCompOffData.userId = foundLeave.requestToUserId,
                                        sendCompOffData.count = "compOff"
                                    compOffCount = 1;
                                    break;
                                }
                            }
                        }
                    }
                    if (compOffCount == 1) {
                        await earnedLeave.updateEarnedLeaveBalance(sendCompOffData);
                    } else if (compOffCount == 0) {
                        var sendAddCompOffData = {
                            earnedLeave: {
                                month: month,
                                year: year,
                                leaveCount: compOffEarnedBalance,
                                reason: updatedLeave.reason
                            },
                            userId: foundLeave.requestToUserId,
                            employeeDetails: employeeDetails,
                            employeeId: foundLeave.userId
                        }
                        await earnedLeave.addEarnedLeaveBalance(sendAddCompOffData);
                    }
                }
            }
        }

        if (status === 'Approved' || status === 'Rejected') {
            return User.findById({ _id: ObjectID(updatedLeave.userId) }).then(async(leaveAppliedUser) => {
                const user = leaveAppliedUser;
                var data = {
                    userName: await User.getDisplayName(user._id),
                    userInfo: await User.getDisplayName(updatedLeave.requestToUserId),
                    fromDate: commonFunction.dateFormat(updatedLeave.dates[0].date),
                    toDate: commonFunction.dateFormat(updatedLeave.dates[updatedLeave.dates.length - 1].date),
                    leaveTypeName: leaveType.leaveTypeName,
                    reason: updatedLeave.reason,
                    currentStatus: updatedLeave.status,
                    homeUrl: config.applicationName.homeUrl
                };
                const userDeviceToken = await device.findOne({ user_id: ObjectID(updatedLeave.userId) }).lean()
                if (userDeviceToken !== null || userDeviceToken !== undefined) {
                    const notiData = {
                        os_type: 'a',
                        cloud_key_to_notify: userDeviceToken.cloudInfo.cloud_key_to_notify,
                        title: await User.getDisplayName(updatedLeave.userId),
                        //Your leave has been
                        body: `${'Your leave has been '+updatedLeave.status}`
                    }
                    await util.GenNoti(notiData)
                } else {}
                leaveTemplateGen('leave-action', data)
                    .then(function(template) {
                        logger.info('Generated [leave-action] template');
                        return template.html
                    })
                    .then(async function(html) {
                        var emailData = {
                            recipient: user.local.email,
                            subject: 'Arya Payroll',
                            message: html
                        };
                        return emailData
                    }).then(emailSender.sendEmail)
                    .then(function(resp) {
                        logger.info("SENT: ", resp);
                    })
                    .catch(function(err) {
                        throw new Error(`There is problem in sending mails ${err}`);
                    });
                return res.send({ status: 'success', message: `Leave ${status} Successfully`, data: returnLeaveData });
            })
        } else {
            return res.send({ status: 'success', message: `Leave ${status} Successfully`, data: returnLeaveData });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// list all leaves in a company
module.exports.listAllLeavesByCompanyId = async function(req, res) {
    try {
        var absentEmployees = 0;
        const numberOfEmployees = await User.find({ "employeeProfile.companyId": ObjectID(req.params.companyId) });
        var presentEmployeesDetail = [];
        numberOfEmployees.forEach((items) => {
            var employeeDetails = {
                _id: items._id,
                firstName: items.profile.contactInfo.firstName,
                lastName: items.profile.contactInfo.lastName,
                email: items.local.email,
                avatar: items.profile.imageUrl,
            }
            presentEmployeesDetail.push(employeeDetails);
        });
        var absenties = [];
        var absentiesDetails = [];
        const leaves = await Leaves.find({ companyId: ObjectID(req.params.companyId) });
        leaves.forEach((item) => {
            if (item.status === "Approved") {
                item.dates.forEach((items) => {
                    var currentDate = commonFunction.dateFormatAlter(new Date());
                    var savedDate = commonFunction.dateFormatAlter(items.date);
                    if (moment(savedDate).isSame(currentDate)) {
                        absentEmployees++;
                        absenties.push(item.userId);
                    } else {
                        return;
                    }
                })
            } else {
                return;
            }
        })
        for (var i = 0; i < absenties.length; i++) {
            var absentEmployeeDetails = await User.findById({ _id: ObjectID(absenties[i]) });
            var absentEmployeeDetail = {
                _id: absentEmployeeDetails._id,
                firstName: absentEmployeeDetails.profile.contactInfo.firstName,
                lastName: absentEmployeeDetails.profile.contactInfo.lastName,
                email: absentEmployeeDetails.local.email,
                avatar: absentEmployeeDetails.profile.imageUrl,
            }
            absentiesDetails.push(absentEmployeeDetail);
        }
        var attendanceList = {};
        attendanceList.totalEmployees = numberOfEmployees.length;
        attendanceList.presentEmployees = parseInt(numberOfEmployees.length) - absentEmployees;
        attendanceList.absentEmployees = absentEmployees;
        attendanceList.presentEmployeeDetails = presentEmployeesDetail;
        attendanceList.absentEmployeeDetails = absentiesDetails;
        return res.send({ status: 'success', message: 'Company Attendance List Successfully', data: attendanceList });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
};

// List All Request leave to child User and Request and Approve leave to Parent User
module.exports.leaveListParentChild = async function(req, res) {
    try {
        var approveLeaveDetails = [];
        var requestLeaveDetails = [];
        var requestLeave = await Leaves.find({ userId: ObjectID(req.params.userId) });
        var approveLeave = await Leaves.find({ requestToUserId: ObjectID(req.params.userId) });
        if (requestLeave.length > 0) {
            for (var j = 0; j < requestLeave.length; j++) {
                if (requestLeave[j].status != 'Deleted') {
                    if (requestLeave[j].status === 'Pending' || requestLeave[j].status === 'Approved') {
                        var rejectReason = '';
                    } else {
                        var rejectReason = requestLeave[j].rejectReason;
                    }
                    var user = await User.findById({ _id: ObjectID(requestLeave[j].userId) });
                    var leaveType = await LeaveType.findById({ _id: ObjectID(requestLeave[j].leaveTypeId) });
                    var requestLeaveDetail = {
                        name: await User.getDisplayName(requestLeave[j].requestToUserId),
                        avatar: user.profile.imageUrl,
                        userId: requestLeave[j].requestToUserId,
                        fromDate: commonFunction.dateFormatAlter(requestLeave[j].fromDate),
                        fromLeaveFor: requestLeave[j].fromLeaveFor,
                        toDate: commonFunction.dateFormatAlter(requestLeave[j].toDate),
                        toLeaveFor: requestLeave[j].toLeaveFor,
                        totalDays: requestLeave[j].totalDays,
                        appliedDate: commonFunction.dateFormatAlter(requestLeave[j].metaData.createdAt),
                        description: requestLeave[j].reason,
                        leaveTypeName: leaveType.leaveTypeName,
                        status: requestLeave[j].status,
                        leaveId: requestLeave[j]._id,
                        rejectReason: rejectReason
                    }
                    requestLeaveDetails.push(requestLeaveDetail);
                }
            }
        } else {
            requestLeaveDetails = [];
        }
        if (approveLeave.length > 0) {
            for (var i = 0; i < approveLeave.length; i++) {
                if (approveLeave[i].status != 'Deleted') {
                    if (approveLeave[i].status === 'Pending' || approveLeave[i].status === 'Approved') {
                        var rejectReason = '';
                    } else {
                        var rejectReason = approveLeave[i].rejectReason;
                    }
                    var user = await User.findById({ _id: ObjectID(approveLeave[i].userId) });
                    var leaveType = await LeaveType.findById({ _id: approveLeave[i].leaveTypeId })
                    var approveLeaveDetail = {
                        name: await User.getDisplayName(user._id),
                        avatar: user.profile.imageUrl,
                        userId: approveLeave[i].requestToUserId,
                        fromDate: commonFunction.dateFormatAlter(approveLeave[i].fromDate),
                        fromLeaveFor: approveLeave[i].fromLeaveFor,
                        toDate: commonFunction.dateFormatAlter(approveLeave[i].toDate),
                        toLeaveFor: approveLeave[i].toLeaveFor,
                        totalDays: approveLeave[i].totalDays,
                        appliedDate: commonFunction.dateFormatAlter(approveLeave[i].metaData.createdAt),
                        description: approveLeave[i].reason,
                        leaveTypeName: leaveType.leaveTypeName,
                        status: approveLeave[i].status,
                        leaveId: approveLeave[i]._id,
                        rejectReason: rejectReason
                    }
                    approveLeaveDetails.push(approveLeaveDetail);
                }
            }
        } else {
            approveLeaveDetails = [];
        }
        var finalList = {};
        finalList.requestLeave = requestLeaveDetails;
        finalList.approveLeave = approveLeaveDetails;
        return res.send({ status: 'success', message: "Approve/Reject Leave List Successfully", data: finalList });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Leave Balance History
module.exports.leaveBalanceHistory = function(req, res) {
    try {
        var employeeId = req.params.employeeId;

    } catch (err) {}
}

// Leave List according to date for individual employee
module.exports.dateWiseLeaveList = async function(req, res) {
    try {
        const userId = req.params.userId;
        const date = req.params.date;
        const leaveDetails = await fetchListDateWise(userId, date);
        var returnData = [];
        if (leaveDetails.length > 0) {
            for (let i = 0; i < leaveDetails.length; i++) {
                const leaveTypeDetails = await LeaveType.findById({ _id: ObjectID(leaveDetails[i].leaveTypeId) });
                const individualLeaveDetails = {
                    _id: leaveDetails[i]._id,
                    status: leaveDetails[i].status,
                    reason: leaveDetails[i].reason,
                    requestToUserId: leaveDetails[i].requestToUserId,
                    userId: leaveDetails[i].userId,
                    dates: leaveDetails[i].dates,
                    leaveTypeId: leaveDetails[i].leaveTypeId,
                    leaveTypeName: leaveTypeDetails.leaveTypeName,
                    userName: await User.getDisplayName(leaveDetails[i].userId),
                    requestToName: await User.getDisplayName(leaveDetails[i].requestToUserId),
                    metaData: leaveDetails[i].metaData,
                    toLeaveFor: leaveDetails[i].toLeaveFor,
                    toDate: leaveDetails[i].toDate,
                    fromDate: leaveDetails[i].fromDate,
                    fromLeaveFor: leaveDetails[i].fromLeaveFor,
                    totalDays: leaveDetails[i].totalDays,
                }
                returnData.push(individualLeaveDetails);
            }
        } else {
            returnData = [];
        }
        return res.send({ status: 'success', message: "Employee Individual Leave List Successfully ", data: returnData })

    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}


// Leave List according to date of all employees
module.exports.dateWiseAllLeaveList = async function(req, res) {
    try {

        var companyId = req.params.companyId;
        const currentDate = new Date(req.params.date);
        const nextDate = moment(req.params.date).add(1, 'days');
        var returnData = [];
        var allEmployeeLeaveDetails = await Leaves.find({ companyId: ObjectID(companyId), fromDate: { $gte: currentDate, $lt: nextDate } });

        for (var i = 0; i < allEmployeeLeaveDetails.length; i++) {
            const leaveTypeDetails = await LeaveType.findById({ _id: ObjectID(allEmployeeLeaveDetails[i].leaveTypeId) });
            const leaveDetails = {
                _id: allEmployeeLeaveDetails[i]._id,
                status: allEmployeeLeaveDetails[i].status,
                reason: allEmployeeLeaveDetails[i].reason,
                requestToUserId: allEmployeeLeaveDetails[i].requestToUserId,
                userId: allEmployeeLeaveDetails[i].userId,
                dates: allEmployeeLeaveDetails[i].dates,
                leaveTypeId: allEmployeeLeaveDetails[i].leaveTypeId,
                leaveTypeName: leaveTypeDetails.leaveTypeName,
                userName: await User.getDisplayName(allEmployeeLeaveDetails[i].userId),
                requestToName: await User.getDisplayName(allEmployeeLeaveDetails[i].requestToUserId),
                metaData: allEmployeeLeaveDetails[i].metaData,
                toLeaveFor: allEmployeeLeaveDetails[i].toLeaveFor,
                toDate: allEmployeeLeaveDetails[i].toDate,
                fromDate: allEmployeeLeaveDetails[i].fromDate,
                fromLeaveFor: allEmployeeLeaveDetails[i].fromLeaveFor,
                totalDays: allEmployeeLeaveDetails[i].totalDays,
            }
            returnData.push(leaveDetails);
        }
        return res.send({ status: 'success', message: 'All Employees Leave List Success', data: returnData });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Fetch Leave Driver Function
async function fetchListDateWise(userId, date) {
    try {
        const currentDate = new Date(date);
        const nextDate = moment(date).add(1, 'days');
        var leaveDetails = await Leaves.find({ userId: ObjectID(userId), fromDate: { $gte: currentDate, $lt: nextDate } });
        return leaveDetails;
    } catch (err) {
        return err;
    }
}