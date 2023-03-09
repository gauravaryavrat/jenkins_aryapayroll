const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const MetaData = require('./meta-data');
const ObjectID = require('mongodb').ObjectID;
const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger')(module);
const commonFunctions = require('../commonFunctions');

const skillCategorySchema = new Schema({
    categoryId: ObjectId,
    companyId: ObjectId,
    metaData: MetaData.schema,
    skillName: {
        type: String,
        required: [true, 'SkillName Must Given'],
    },
    trno: Number,
});

// Add skill Category
skillCategorySchema.statics.addSkillCategory = function(data){
    skillName = sanitize(data.skillName);

    const promise = this.findOne( {"companyId": ObjectID(data.companyId), 'skillName': { $regex:  skillName, $options: 'i'}} ).exec();
    return promise.then((foundSkillCategory) => {
        if(foundSkillCategory){
            throw new Error(`Skill Name ${skillName} already exists`);
        }else{
            const SkillCategory = mongoose.model('SkillCategory',skillCategorySchema);
            const newSkillCategory = new SkillCategory();
            newSkillCategory.metaData = new MetaData();
            newSkillCategory.metaData.createdBy = data.userId;
            newSkillCategory.metaData.createdAt = MetaData.dateInfo();
            newSkillCategory.companyId = data.companyId;
            newSkillCategory.categoryId = data.categoryId;
            newSkillCategory.skillName = data.skillName;
            newSkillCategory.trno = commonFunctions.getCurrentTrno();
            return(newSkillCategory);
        }
    })
    // Save skill category
    .then((newSkillCategory) => {
        return newSkillCategory.save().then((savedSkillCategory) => {
            logger.info('********  SKILL CATEGORY ADDED SUCCESSFULLY ********', savedSkillCategory.skillName);
            return({skillCategory: savedSkillCategory});
        }).catch(function(err){
            return err;
        })
    })
};

module.exports = mongoose.model('SkillCategory',skillCategorySchema);