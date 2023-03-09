const SkillCategory = require('../models/skill-category');
const commonFunction = require('../commonFunctions');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');

// add skill category
module.exports.addSkillCategory = async function(req,res){
    if( (!req.body.skillName) ){
        return res.send({status: "error", message: "Missing Skill Name"});
    }
        try{
            const skillCategoryData = req.body;
            skillCategoryData.companyId = req.params.companyId;
            skillCategoryData.userId = req.params.userId;

            const newSkillCategory = await SkillCategory.addSkillCategory(skillCategoryData);
            if(newSkillCategory){
                const returnSkillCategory = {
                    _id: newSkillCategory.skillCategory._id,
                    Skill_Name: newSkillCategory.skillCategory.skillName
                };
                return res.send({status: 'success' , message: "Skill Category Added SuccessFully",skillCategory: returnSkillCategory})
            }else{
                return res.send({status: 'error', message: "unable to add skill category"});
            }
        }catch(err){
            return res.send({status: 'error', message: err.message});
        }
}

// update the skill category
module.exports.updateSkillCategory = async function(req,res){
    try{
        const skillCategoryId =  req.params.skillCategoryId;
        const updateData = req.body;

        //check whether updateData is empty or not
        if(!commonFunction.isEmpty(updateData)){
            return await SkillCategory.findOne( {"companyId": ObjectID(req.params.companyId), "skillName": updateData.skillName } ).then(async (foundSkillCategory) => {
                if(foundSkillCategory){
                    if(foundSkillCategory._id != skillCategoryId){
                        throw new Error(`Skill Name ${updateData.skillName} already taken`);
                    }
                }// update the skill Category
                    return await SkillCategory.findOneAndUpdate( {_id: ObjectID(skillCategoryId) }, updateData, {new: true} ).then((updatedSkillcategory) => {
                        // save meta data
                        updatedSkillcategory.metaData.updatedBy = req.params.userId;
                        updatedSkillcategory.metaData.updatedAt = MetaData.dateInfo();
                        updatedSkillcategory.trno = commonFunction.getCurrentTrno();
                        return updatedSkillcategory.save().then((skillCategory) => {
                            return res.send({ status: 'success', message: 'Skill Category Update Successfully',skillCategory:skillCategory });
                        })
                    })
            })
        }else{
            return res.send({ status: 'error', message: "Please Update the value too see changes" });
        }
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
};

// list all skill categories
module.exports.listAllSkillCategories = async function(req,res){
    try{
        const skillCategories = await SkillCategory.aggregate([
            {$match:{companyId: ObjectID(req.params.companyId)}},
            {
                $lookup:{
                    from:'jobcategories',
                    let:{categoryId:"$categoryId"},
                    pipeline:[{
                        $match:{
                            $expr:{
                                $eq:['$_id','$$categoryId']
                            }
                        }
                    }],
                    as: 'jobcategories'
                }
            },
            {
                $project:{
                    "_id": 1,
                    "trno": '$trno',
                    "skillName": "$skillName",
                    "categoryId": "$categoryId",
                    "companyId": "$companyId",
                    "metaData":"$metaData",
                    "categoryName": { $arrayElemAt: ["$jobcategories.categoryName",0]}
                }
            }
        ])
       return res.send( {status: 'success', message: "Skill Categories List Success", skillCategory: skillCategories });
    }catch(err){
       return res.send({ status: 'error', message: err.message });
    }
};

// delete the skill categories
module.exports.deleteSkillCategory = async function(req,res){
    const skillCategoryId = req.params.skillCategoryId;
   try{
       await SkillCategory.deleteOne( {_id: ObjectID(skillCategoryId) });
       res.send({status: 'success', message: "Skill Category Deleted Successfully"});
   }catch(err){
       res.send({status: 'error', message: err.message});
   }
}

// List Individual Skill Category Details
module.exports.skillCategoryDetails = async function(req,res){
    try{
        var skillCategoryDetails = await SkillCategory.findById({_id: ObjectID(req.params.skillCategoryId)});
        return res.send({ status: 'success', message: 'Individual Skill Category list success', data: skillCategoryDetails });
    }catch(err){
        return res.send({ status:'error', message: err.message });
    }
}