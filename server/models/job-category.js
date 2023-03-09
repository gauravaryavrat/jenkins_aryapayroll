const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const MetaData = require('./meta-data');
const sanitize = require('mongo-sanitize');
const ObjectID = require('mongodb').ObjectID;
const logger = require('../utils/logger')(module);
const commonFunctions = require('../commonFunctions');

const jobCategorySchema = new Schema({
    companyId: ObjectId,
    metaData: MetaData.schema,
    parentCategoryId: ObjectId,
    trno: Number,
    categoryName: {
        type: String,
        required: [true, "Category Name Must"],
    },
    isActive: {
        type: Boolean,
        default: false,
    },
});

// Add job category
jobCategorySchema.statics.addJobCategory = function(data,res){
    categoryName = sanitize(data.categoryName);

    const promise = this.findOne( { "companyId":ObjectID(data.companyId), 'categoryName':{ $regex:  categoryName, $options: 'i'} } );
    return promise.then((foundJobCategory) => {
        if(foundJobCategory){
            throw new Error(`Category Name ${categoryName} already taken`);
        }else{
                const JobCategory = mongoose.model('JobCategory',jobCategorySchema);
                const newJobCategory = new JobCategory();
            if(data.parentCategoryId){ // if child category
                newJobCategory.metaData = new MetaData();
                newJobCategory.metaData.createdBy = data.companyId;
                newJobCategory.metaData.createdAt = MetaData.dateInfo();
                newJobCategory.parentCategoryId = data.parentCategoryId;
            }else{ // if parent category
                newJobCategory.metaData = new MetaData();
                newJobCategory.metaData.createdBy = data.companyId;
                newJobCategory.metaData.createdAt = MetaData.dateInfo();
            }
            newJobCategory.trno = commonFunctions.getCurrentTrno();
            newJobCategory.companyId = data.companyId;
            newJobCategory.categoryName = data.categoryName;
            newJobCategory.isActive = data.isActive;
            return(newJobCategory);

        }
    })
    // save job category
    .then((newJobCategory) => {
        return newJobCategory.save().then((savedJobCategory) => {
            logger.info('********  JOB CATEGORY ADDED SUCCESSFULLY ********', savedJobCategory.categoryName);
            return({jobCategory: savedJobCategory});
        }).catch(function(err) {
            return res.send( {status: 'error', message: err.message} );
        });
    })
};

module.exports = mongoose.model('JobCategory',jobCategorySchema);