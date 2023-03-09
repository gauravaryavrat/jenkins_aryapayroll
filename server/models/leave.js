const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const logger = require('../utils/logger')(module);
const sanitize = require('mongo-sanitize');
const config = require('../config');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;
const commonFunction = require('../commonFunctions');
const emailSender = require('../lib/email-sender');
const LeaveType = require('../models/leaves-type');
const leaveTemplateGen = require('../lib/leave-template-generator').leaveTemplateGenerator;
const MetaData = require('../models/meta-data');
const moment = require('moment');
const util = require('../utilities');
const device = require('../models/user-device');

const leaveSchema = new Schema({
    userId: ObjectId,
    metaData: MetaData.schema,
    companyId: ObjectId,
    totalDays: String,
    rejectReason: String,
    fromDate: {
        type: Date,
        required: [true, "From Date Must Given"]
    },
    fromLeaveFor: {
        type: String,
        enum: ['First Half', 'Second Half', 'Full Day'],
        required: [true, "From Leave For Must Given"]
    },
    toDate: {
        type: Date,
        required: [true, 'To Date Must Given']
    },
    toLeaveFor: {
        type: String,
        enum: ['First Half', 'Second Half', 'Full Day'],
        required: [true, 'To Leave For Must Given']
    },
    trno: Number,
    requestToUserId: {
        type: ObjectId,
        required: [true, 'Request User Id Required']
    },
    reason: {
        type: String,
        required: [true, 'Reason is required.']
    },
    leaveTypeId: {
        type: ObjectId,
        required: [true, 'Leave Type Id Must Required']
    },
    dates: [{
        date: {
            type: Date,
        },
        leaveTypeId: ObjectId,
        leaveFor: {
            type: String,
            enum: ['First Half', 'Second Half', 'Full Day']
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Deleted', 'Unsanctioned', 'Sandwich']
        },
        statusUpdatedBy: ObjectId,
        statusUpdatedAt: Date,
    }],
    comments: [{
        description: String,
        userId: ObjectId,
        createdAt: Date,
    }],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Deleted', 'Unsanctioned', 'Sandwich']
    },
    statusUpdatedBy: ObjectId,
    statusUpdatedAt: Date,
});

leaveSchema.statics.addLeave = async function(data) {
    try {
        if (data) {
            var dates = [];
            var Leaves = mongoose.model('Leaves', leaveSchema);
            var newLeave = new Leaves();
            var avatar;
            fromDate = sanitize(data.fromDate);

            // Check If the user is authorized or not
            var userInfo = await User.findById({ _id: ObjectID(data.userId) });
            if (userInfo) {
                avatar = userInfo.profile.imageUrl;
                if (userInfo.employeeProfile.companyId) {
                    newLeave.companyId = userInfo.employeeProfile.companyId;
                } else {
                    throw new Error('Invalid User');
                }
            } else {
                throw new Error('Invalid User');
            }
            return this.find({
                userId: ObjectID(data.userId)
            }).then((foundLeave) => {
                if (foundLeave) {
                    for (var i = 0; i < foundLeave.length; i++) {
                        if (foundLeave[i].status != 'Deleted') {
                            var savedFromDate = commonFunction.dateFormatAlter(foundLeave[i].fromDate);
                            var savedToDate = commonFunction.dateFormatAlter(foundLeave[i].toDate);
                            if (moment(fromDate).isBetween(savedFromDate, savedToDate, null, '[]')) {
                                if (data.status === 'Unsanctioned' || data.status === "Sandwich") {
                                    if (foundLeave[i].status === 'Rejected') {
                                        throw new Error(`There is already a leave exist on ${savedFromDate} to ${savedToDate}. You can mark that leave as Unsanctioned Or make Sandwich`);
                                    }
                                    throw new Error(`You already marked employee absent or make Sandwich from ${savedFromDate} to ${savedToDate}`);
                                } else {
                                    throw new Error(`You have already applied for leave on or between from ${savedFromDate} to ${savedToDate} dates. Please cancel them to make this request.`);
                                }
                            } else {
                                continue;
                            }
                        }
                    }
                }
                // Add Meta Data
                newLeave.metaData = new MetaData();
                newLeave.metaData.createdBy = data.userId;
                newLeave.metaData.createdAt = MetaData.dateInfo();
                // Add Leave Details
                newLeave.userId = data.userId;
                newLeave.fromDate = data.fromDate;
                newLeave.fromLeaveFor = data.fromLeaveFor;
                newLeave.toDate = data.toDate;
                newLeave.toLeaveFor = data.toLeaveFor;
                newLeave.trno = commonFunction.getCurrentTrno();
                newLeave.requestToUserId = data.requestToUserId;
                newLeave.reason = data.reason;
                newLeave.leaveTypeId = data.leaveTypeId;
                newLeave.totalDays = data.totalDays;
                (data.status) ? newLeave.status = data.status: newLeave.status = "Pending";
                // Add dates data
                var result = moment(data.toDate).diff(data.fromDate, 'days');
                for (var i = 0; i < result + 1; i++) {
                    if (i == 0) {
                        var leaveFor = data.fromLeaveFor;
                    } else if (i == result) {
                        var leaveFor = data.toLeaveFor;
                    } else {
                        var leaveFor = "Full Day";
                    }
                    dates.push({
                        date: moment(data.fromDate).add(i, 'days'),
                        leaveTypeId: data.leaveTypeId,
                        leaveFor: leaveFor,
                        status: 'Pending',
                    })
                }
                newLeave.dates = dates;
                // save leave data
                return newLeave.save().then((savedLeave) => {
                        logger.info('********  LEAVE ADDED SUCCESSFULLY ********', savedLeave.reason);
                        savedLeave.avatar = avatar;
                        return (savedLeave);
                    })
                    // send mail to the user
                    .then(async(leave) => {
                        if (data.requestToUserId) {
                            return await User.findById({
                                _id: ObjectID(data.requestToUserId)
                            }).then(async(parentUser) => {
                                var leaveType = await LeaveType.findById({
                                    _id: ObjectID(leave.leaveTypeId)
                                }).exec();
                                const user = parentUser;
                                if (data.status === 'Unsanctioned' || data.status === 'Sandwich') {
                                    var emailData = {
                                        userName: await User.getDisplayName(user._id),
                                        userInfo: await User.getDisplayName(leave.userId),
                                        applicationName: config.applicationName.name,
                                        homeUrl: config.applicationName.homeUrl,
                                        reason: leave.reason,
                                        leaveTypeName: leaveType.leaveTypeName,
                                    }
                                    var templateName = 'employee-absent';
                                } else {
                                    var emailData = {
                                        userName: await User.getDisplayName(user._id),
                                        userInfo: await User.getDisplayName(leave.userId),
                                        fromDate: commonFunction.dateFormat(data.fromDate),
                                        toDate: commonFunction.dateFormat(data.toDate),
                                        leaveTypeName: leaveType.leaveTypeName,
                                        applicationName: config.applicationName.name,
                                        reason: leave.reason,
                                        homeUrl: config.applicationName.homeUrl
                                    }
                                    var templateName = 'leave-apply';
                                }
                                const userDeviceToken = await device.findOne({ user_id: ObjectID(data.requestToUserId) }).lean()
                                if (userDeviceToken !== null || userDeviceToken !== undefined) {
                                    const notiData = {
                                        os_type: 'a',
                                        cloud_key_to_notify: userDeviceToken.cloudInfo.cloud_key_to_notify,
                                        title: await User.getDisplayName(user._id),
                                        body: `${await User.getDisplayName(data.userId) + '  has requested for leave.' }`
                                    }
                                    await util.GenNoti(notiData)
                                } else {}
                                leaveTemplateGen(templateName, emailData)
                                    .then(function(template) {
                                        logger.info(`Generated ${[templateName]} template`);
                                        return template.html
                                    })
                                    .then(async function(html) {
                                        var emailData = {
                                            recipient: user.local.email,
                                            subject: 'You have a new leave request on Arya Payroll',
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
                                return ({
                                    leave: leave
                                });
                            })
                        } else {
                            throw new Error(`Leave was added successfully but please give the User parent User Id so we can notify them via mail `);
                        }

                    }).catch(function(err) {
                        throw new Error(err.message);
                    });
            })
        } else {
            throw new Error('Unable to add Company');
        }

    } catch (err) {
        return err;
    }

}
module.exports = mongoose.model('Leaves', leaveSchema);