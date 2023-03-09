const JobCategory = require('../models/job-category');
const commonFunctions = require('../commonFunctions');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const SkillCategory = require('../models/skill-category');

module.exports.addJobCategory = async function(req,res){
    if( (!req.body.categoryName) ){
        return res.send({status: 'error', message: "Missing required fields"});
    }

    try{
        const jobCategoryData = req.body;
        jobCategoryData.companyId = req.params.companyId;
        // send parentCategory if exists
        if(req.params.parentCategoryId){
            jobCategoryData.parentCategoryId = req.params.parentCategoryId;
        }
        const newJobCategory = await JobCategory.addJobCategory(jobCategoryData,res);
        if(newJobCategory){
            const returnJobCategory = {
                _id: newJobCategory.jobCategory._id,
                Category_Name: newJobCategory.jobCategory.categoryName,
            };
            return res.send( {status: 'success', message: 'Job Category Added Successfully',jobCategory: returnJobCategory} );
        }else{
            return res.send( {status: 'error', message: 'Unable to add job category'} );
        }
    }catch(err){
        return res.send( {status: 'error', message: err.message} );
    }
};

// update job category
module.exports.updateJobCategory = async function(req,res){
    try{
        const companyId = req.params.companyId;
        const jobCategoryId = req.params.jobCategoryId;
        const updateData = {};

        // Check if update data is exists
        (req.body.categoryName)?updateData.categoryName = req.body.categoryName:"";
        (req.body.isActive)?updateData.isActive = req.body.isActive:"";

        // check if update data is empty or not
        if(!commonFunctions.isEmpty(updateData)){
                return await JobCategory.findOne( {"companyId": ObjectID(companyId), "categoryName": updateData.categoryName} ).then(async (foundJobCategory) => {
                    if(foundJobCategory){
                        if(foundJobCategory._id != jobCategoryId){
                            throw new Error (`Category Name ${updateData.categoryName} already taken`);
                        }
                    }
                        return await JobCategory.findOneAndUpdate( {"companyId": ObjectID(companyId), _id: ObjectID(jobCategoryId)}, updateData,{new: true} ).then((updateJobCategory) =>{
                            // save meta data and trno
                            updateJobCategory.metaData.updatedBy = companyId;
                            updateJobCategory.metaData.updatedAt = MetaData.dateInfo();
                            updateJobCategory.trno = commonFunctions.getCurrentTrno();
                            return updateJobCategory.save().then((jobCategory) => {
                                return res.send( {status: 'success', message: "Job Category Updated Successfully",jobCategory: jobCategory} );
                            })
                        })
                })
        }else{
            return res.send( {status: 'error', message: "Please fill out your desired fields to update the filled fields"} );
        }
    }catch(err){
        return res.send( {status: 'error', message: err.message} );
    }
};

// list all the job categories
module.exports.listAllCategories = async function(req,res){
    try{
        const jobCategories = await JobCategory.find({companyId: req.params.companyId});
        res.send( {status: 'success', message: "Job Categories List Success", jobCategory: jobCategories});
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
};

// Delete the individual job category
module.exports.deleteCategory = async function(req,res){
    try{
        const jobCategoryId = req.params.jobCategoryId;
        var skillCategoryExists = await SkillCategory.find({"categoryId":ObjectID(jobCategoryId)});
        if(skillCategoryExists.length > 0){
            throw new Error(`You can't delete the Job Category as Job Category linked with some Skill Categories`);
        }
        await JobCategory.deleteOne( {_id: ObjectID(jobCategoryId) });
        res.send({status: 'success', message: "Job Category Deleted Successfully"});
    }catch(err){
        res.send({status: 'error', message: err.message});
    }
};

// List Individual Job Category Details
module.exports.jobCategoryDetails = async function(req,res){
    try{
        var jobCategoryDetails = await JobCategory.findById({_id: ObjectID(req.params.jobCategoryId)});
        return res.send({ status: 'success', message: 'Individual job category list success', data: jobCategoryDetails });
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
}