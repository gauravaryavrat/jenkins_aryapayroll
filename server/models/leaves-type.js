const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const MetaData = require('./meta-data');
const ObjectID = require('mongodb').ObjectID;
const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger')(module);
const commonFunction = require('../commonFunctions')

const leaveTypeSchema = new Schema({
    companyId: ObjectId,
    metaData: MetaData.schema,
    trno: Number,
    leaveTypeName: {
        type: String,
        required: [true, "Leave type name must be given"],
    },
    leaveTypeCode: {
        type: String,
        required: [true, "Leave type code must be given"],
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
});

// Add Leave Type
leaveTypeSchema.statics.addLeaveType = function(data,res){
leaveTypeName = sanitize(data.leaveTypeName);

    const promise = this.findOne( {"companyId": ObjectID(data.companyId), 'leaveTypeName':{ $regex:  leaveTypeName, $options: 'i'}} );
    return promise.then((foundLeaveType) => {
        if(foundLeaveType){
            throw new Error(`Leave Type Name ${leaveTypeName} already exists`);
        }else{
            const LeaveTypes = mongoose.model('LeaveTypes',leaveTypeSchema);
            const newLeaveType = new LeaveTypes();
            newLeaveType.metaData = new MetaData();
            // Add leave type meta data
            newLeaveType.metaData.createdBy = data.companyId;
            newLeaveType.metaData.createdAt = MetaData.dateInfo();
            // Add leave type Details
            newLeaveType.companyId = data.companyId;
            newLeaveType.leaveTypeName = data.leaveTypeName;
            newLeaveType.leaveTypeCode = data.leaveTypeCode;
            newLeaveType.trno = commonFunction.getCurrentTrno();
            newLeaveType.isPaid = data.isPaid;

            return(newLeaveType);
        }
    })
    // Save new Leave Type data
    .then((newLeaveType) => {
        return newLeaveType.save().then((savedLeaveType) => {
            logger.info('********  LEAVE TYPE ADDED SUCCESSFULLY ********', savedLeaveType.leaveTypeName)
            return({leaveType: savedLeaveType});
        }).catch(function(err){
            throw new Error (err);
        })
    }).catch(function(err){
        throw new Error (err);
    });
};

module.exports = mongoose.model('LeaveTypes',leaveTypeSchema);