const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const sanitize = require('mongo-sanitize');
const MetaData = require('./meta-data');
const logger = require('../utils/logger')(module);
const ObjectID = require('mongodb').ObjectID;

const departmentSchema = new Schema({
    companyId: ObjectId,
    userId: ObjectId,
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    description: String,
    metaData: MetaData.schema,
});

// Add Department to Branch
departmentSchema.statics.addDepartment = function(data,res){
title = sanitize(data.title);

    const promise = this.findOne({"userId":ObjectID(data.branchId),'title': { $regex:  title, $options: 'i'}});
    return promise.then((foundDepartment) => {
        if(foundDepartment){
            throw new Error(`Title ${title} is already taken`);
        }else{
            const Department = mongoose.model('Department',departmentSchema);
            const newDepartment = new Department();
            newDepartment.metaData = new MetaData();
            newDepartment.metaData.createdBy = data.branchId;
            newDepartment.metaData.createdAt = MetaData.dateInfo();
            newDepartment.companyId = data.companyId;
            newDepartment.userId = data.branchId;
            newDepartment.title = data.title;
            newDepartment.description = data.description;
            return (newDepartment);
        }
    })
    //save Branch Department Details
    .then((newDepartment) => {
        return newDepartment.save().then((savedDepartment) => {
            logger.info('********  DEPARTMENT ADDED SUCCESSFULLY ********', savedDepartment.title);
            return ({department: savedDepartment});
        }).catch(function(err){
            return res.send({status: 'error',message: err.message});
        });
    });
};
module.exports = mongoose.model("Department",departmentSchema);
