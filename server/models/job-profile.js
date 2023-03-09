const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const logger = require('../utils/logger')(module);
const MetaData = require('./meta-data');
const sanitize = require('mongo-sanitize');
const ObjectID = require('mongodb').ObjectID;


const jobProfileSchema = new Schema({
    companyId: ObjectId,
    metaData: MetaData.schema,
    positionName: {
        type: String,
        required: [true,'Position name must given']
    },
    payBasis:{
        type: String,
        enum: ['Monthly Salary', 'Daily Wages'],
        required: [true,'Pay Basis must given']
    },
    isActive: Boolean,
});

// Add Job Profile
jobProfileSchema.statics.addJobProfile = function(data){
    positionName = sanitize(data.positionName);

    // return promise
    const promise = this.findOne( { 'companyId': ObjectID(data.companyId), 'positionName':{ $regex:  positionName, $options: 'i'}, "payBasis": data.payBasis  } );
    return promise.then((foundJobProfile) => {
        if(foundJobProfile){
            throw new Error(`Profile Name ${positionName} With Pay Basis ${data.payBasis} Already Taken`);
        }else{
            var JobProfile = mongoose.model('JobProfile',jobProfileSchema);
            var newJobProfile = new JobProfile();
            newJobProfile.metaData = new MetaData();
            // Add job profile metaData details
            newJobProfile.metaData.createdBy = data.companyId;
            newJobProfile.metaData.createdAt = MetaData.dateInfo();
            // Add Job Profile Details
            newJobProfile.companyId = data.companyId;
            newJobProfile.positionName = data.positionName;
            newJobProfile.payBasis = data.payBasis;
            newJobProfile.isActive = data.isActive;

            return (newJobProfile)
        }
    })
    // Save Document Type
    .then((newJobProfile) => {
        return newJobProfile.save().then((savedJobProfile) => {
            logger.info('********  JOB PROFILE ADDED SUCCESSFULLY ********', `${savedJobProfile.positionName}-${savedJobProfile.payBasis}`);
            return({jobProfile:savedJobProfile});
        })
    })

}
module.exports = mongoose.model('JobProfile',jobProfileSchema);