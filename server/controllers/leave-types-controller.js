const LeaveTypes = require('../models/leaves-type');
const commonFunction = require('../commonFunctions');
const MetaData = require('../models/meta-data');
const ObjectID = require('mongodb').ObjectID;

// Add Leave Type
module.exports.addLeaveType = async function(req,res){
    if( (!req.body.leaveTypeName) || (!req.body.leaveTypeCode) ){
        return res.send({status: "error", message: "Missing Leave Type Name or Leave Type Code"});
    }
        try{
            const addData = req.body;
            addData.companyId = req.params.companyId;

            const newLeaveType = await LeaveTypes.addLeaveType(addData);
            if(newLeaveType){
                const returnLeaveTypeData = {
                    leaveTypeName: newLeaveType.leaveType.leaveTypeName
                };
                return res.send({status: 'success' , message: "Leave Type Added SuccessFully",leaveType: returnLeaveTypeData})
            }else{
                return res.send({status: 'error', message: "unable to add leave type"});
            }
        }catch(err){
            return res.send({status: 'error', message: err.message});
        }
}

// Update the leave type
module.exports.updateLeaveType = async function(req,res){

    try{
        const companyId = req.params.companyId;
        const leaveTypeId = req.params.leaveTypeId;
        const updateData = {};

        // Check whether the update data is there or not
        (req.body.leaveTypeName)?updateData.leaveTypeName = req.body.leaveTypeName:"";
        (req.body.leaveTypeCode)?updateData.leaveTypeCode = req.body.leaveTypeCode:"";
        updateData.isPaid = req.body.isPaid;

        // check whether the update data is empty or not
        if(!commonFunction.isEmpty(updateData)){
                    // Return promise for leave type name is already exists for same user
                    return await LeaveTypes.findOne( { "companyId": ObjectID(companyId), "leaveTypeName": updateData.leaveTypeName}).then( async (foundLeaveType) => {
                        if(foundLeaveType){
                            if(foundLeaveType._id != leaveTypeId){
                                throw new Error(`Leave Type Name ${updateData.leaveTypeName} Already Exists`);
                            }
                        }
                            return await LeaveTypes.findOneAndUpdate( {"companyId": ObjectID(companyId), _id: ObjectID(leaveTypeId)}, updateData, {new:true} ).then((updatedLeaveType) => {
                                // save update leave type meta data
                                updatedLeaveType.metaData.updatedBy = companyId;
                                updatedLeaveType.metaData.updatedAt = MetaData.dateInfo();
                                return updatedLeaveType.save().then((leaveType) => {
                                return res.send({status: 'success', message: "Leave Type Update Successfully",leaveType: leaveType});
                                })
                            })
                    })
                }else{
                    return res.send({status: 'error', message:"Please Update the value too see changes"});
                }
    }catch(err){
        return res.send({status: "error", message: err.message});
    }
}

// List all leave Types for an individual user
module.exports.listAllLeaveTypes = async function(req,res){
    try{
        const leaveTypes = await LeaveTypes.find({companyId: req.params.companyId});
        res.send( {status: 'success', message: "Leave Type List Success", leaveTypes: leaveTypes });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}

// Delete the leave type
module.exports.deleteLeaveType = async function(req,res){
    const leaveTypeId = req.params.leaveTypeId;
   try{
       await LeaveTypes.deleteOne( {_id: ObjectID(leaveTypeId) });
       res.send({status: 'success', message: "Leave Type Deleted Successfully"});
   }catch(err){
       res.send({status: 'error', message: err.message});
   }
}

// List Individual Leave Type
module.exports.leaveTypeDetails = async function(req,res){
    try{
        var leaveTypeDetails = await LeaveTypes.findById({_id: ObjectID(req.params.leaveTypeId)});
        return res.send({ status: 'success', message: 'Individual Leave Type List', data: leaveTypeDetails });
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
}