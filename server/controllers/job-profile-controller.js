const JobProfile = require('../models/job-profile');
const commonFunction = require('../commonFunctions');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const User = require('../models/user');

// Add Job Profile
module.exports.addJobProfile = async function(req,res){
    try{
        if( (!req.body.positionName) || (!req.body.payBasis) ){
            return res.send({ status: 'error', message:'Missing Job Profile Postion Name or Pay Basis' });
        }
        var addData = req.body;
        addData.companyId = req.params.companyId;

        const newJobProfile = await JobProfile.addJobProfile(addData);
        if(newJobProfile){
            var returnJobProfile = {
                jobProfile:{
                    _id: newJobProfile.jobProfile._id,
                    positionName: newJobProfile.jobProfile.postionName
                }
            }
            return res.send({ status: 'success', message: 'Job Profile Added Successfully',data: returnJobProfile });

        }else{
            return res.send({ status:'error', message:'Unable To Add Job Profile' });
        }
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Update Job Profile
module.exports.updateJobProfile = async function(req,res){
    try{
        const jobProfileId = req.params.jobProfileId;
        const companyId = req.params.companyId;
        var updateData = {};
        // check if data is there for update
        (req.body.positionName)? updateData.positionName = req.body.positionName: "";
        (req.body.payBasis)? updateData.payBasis = req.body.payBasis: "";
        updateData.isActive = req.body.isActive;

        // check whether the update data is empty or not
        if(!commonFunction.isEmpty(updateData)){
                // Return promise for job profile position name is already exists for the same company
                return await JobProfile.findOne( { "companyId": ObjectID(companyId), "positionName": updateData.positionName, "payBasis": updateData.payBasis}).then( async (foundJobProfile) => {
                    if(foundJobProfile){
                        if(foundJobProfile._id != jobProfileId){
                            throw new Error(`Profile Name ${updateData.positionName} With Pay Basis ${updateData.payBasis} already exists`);
                        }
                    }
                    // update job profile
                        return await JobProfile.findOneAndUpdate( {"companyId": ObjectID(companyId), _id: ObjectID(jobProfileId)}, updateData, {new:true} ).then((updatedJobProfile) => {
                            // save update job profile meta data
                            updatedJobProfile.metaData.updatedBy = updatedJobProfile.companyId;
                            updatedJobProfile.metaData.updatedAt = MetaData.dateInfo();
                            return updatedJobProfile.save().then((jobProfile) => {
                            return res.send({status: 'success', message: "Job Profile Update Successfully",data: jobProfile});
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


// List all Job Profiles of an individual company
module.exports.listAllJobProfiles = async function(req,res){
    try{
        const jobProfiles = await JobProfile.find({companyId: req.params.companyId});
        res.send( {status: 'success', message: "Job Profiles List Success", data: jobProfiles });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}

// Delete the job profile
module.exports.deleteJobProfile = async function(req,res){
    const jobProfileId = req.params.jobProfileId;
   try{
       var employeeExist = await User.find({"employeeProfile.jobProfileId": ObjectID(jobProfileId)});
        if(employeeExist.length > 0){
            throw new Error(`You can't delete the Job Profile as Job Profile linked with some Employees`)
        }
       const deletedProfile = await JobProfile.deleteOne( {_id: ObjectID(jobProfileId) });
       if(deletedProfile.deletedCount === 0){
           res.send({ status: 'error', message: "No Job Profile To Delete Please Make Sure You Enter a Valid Job Profile Id" });
       }else{
        res.send({status: 'success', message: "Job Profile Deleted Successfully"});
       }
   }catch(err){
       res.send({status: 'error', message: err.message});
   }
}

//List Individual Job Profile Details
module.exports.jobProfileDetails= async function(req,res){
    try{
        var jobProfileDetails = await JobProfile.findById({_id: ObjectID(req.params.jobProfileId)});
        return res.send({ status: 'success', message: 'Individual Job Profile list success', data: jobProfileDetails });
    }catch(err){
        return res.send({ status:'error', message: err.message });
    }
}