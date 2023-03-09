const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const sanitize = require('mongo-sanitize');
const MetaData = require('./meta-data');
const logger = require('../utils/logger')(module);
const ObjectID = require('mongodb').ObjectID;

const gradeRuleSchema = new Schema({
    companyId: ObjectId,
    title: {
        type: String,
        required: [true, "Title is required"],
    },
    metaData: MetaData.schema,
    trno: Number,
    paymentHeads: [{
        paymentHeadId: ObjectId,
        type:{
            type: String,
            enum: ['Fixed', 'Percent'],
            required: [true,'Grade Rule Payment Head Type Must Given']
        },
        value: {
            type: String,
            required: [true,'Grade Rule Payment Head Type Value Must Given']
        },
        metaData: MetaData.schema,
        trno: Number,
        fixedPercentOfName: String,
        fixedPercentOfId: ObjectId
    }]
});

// Add Grade of a Company
gradeRuleSchema.statics.addGradeRule = function(data){
title = sanitize(data.title);

    const promise = this.findOne({"companyId":ObjectID(data.companyId),'title':{ $regex:  title, $options: 'i'}});
    return promise.then((foundTitle) => {
        if(foundTitle){
            throw new Error(`Grade Rule Title ${title} is already taken`);
        }else{
            const GradeRule = mongoose.model('GradeRule',gradeRuleSchema);
            const newGradeRule = new GradeRule();
            // Add MetaData
            newGradeRule.metaData = new MetaData();
            newGradeRule.metaData.createdBy = data.companyId;
            newGradeRule.metaData.createdAt = MetaData.dateInfo();
            // Add Grade Rule Details
            newGradeRule.trno = MetaData.getCurrentTrno();
            newGradeRule.title = data.title;
            newGradeRule.companyId = data.companyId;
            return (newGradeRule);
        }
    })
    //save Grade Rules Details
    .then((newGradeRule) => {
        return newGradeRule.save().then((savedGradeRule) => {
            logger.info('********  GRADE ADDED SUCCESSFULLY ********', savedGradeRule.title);
            return ({gradeRule: savedGradeRule});
        }).catch(function(err){
            return err.message;
        });
    });
};
module.exports = mongoose.model("GradeRule",gradeRuleSchema);
