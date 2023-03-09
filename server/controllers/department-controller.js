const Department = require('../models/department');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const commonFunction = require('../commonFunctions');
const sanitize = require('mongo-sanitize');
const User = require('../models/user');
// Add Branch Department
module.exports.addDepartment = async function(req,res){
    if( (!req.body.title) ){
        return res.send( {status:'error', message:"Missing Title"} );
    }

    try{
        var departmentData = {};
        departmentData = req.body;
        departmentData.branchId = req.params.branchId;
        departmentData.companyId = req.params.companyId;

        const newDepartment = await Department.addDepartment(departmentData,res);
        if(newDepartment){
            const returnDepartment = {
                _id: newDepartment.department._id,
            };
            return res.send({status:'success',message:'Department added Successfully',department: returnDepartment});
        }else{
            return res.send({ status: 'error', message: "Unable to add Department" });
        }
    }catch (err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Update branch department
module.exports.updateDepartment = async function (req,res){
    title = sanitize(req.body.title);
    const branchId = req.params.branchId;
    const departmentId = req.params.departmentId;
    var updateData = {};
    // Check data is available for update or not
    (req.body.title)?updateData.title = req.body.title:"",
    (req.body.description)?updateData.description = req.body.description:"";

    try{
        if(!commonFunction.isEmpty(updateData)){

            const foundTitle = await Department.findOne({"userId":ObjectID(branchId),'title':title}).exec();
            if(foundTitle){
                if(foundTitle._id != departmentId){
                    return res.send({status:'success',message:"Department Title Already Taken"});
                }
            }
                    const updateDepartment = await Department.findOneAndUpdate( {"userId": ObjectID(branchId), _id: ObjectID(departmentId)},updateData,{new:true} );
                        updateDepartment.metaData.updatedBy = branchId;
                        updateDepartment.metaData.updatedAt = MetaData.dateInfo();
                        updateDepartment.save();
                        return res.send({status: 'success', message: "Department Info Updated Successfully",department: updateDepartment});
        }else{
            return res.send({status: 'error',message: "Please Update the value too see changes"});
        }
    }catch (err){
            return res.send({status: 'error', message: err.message});
    }
}

// Delete Branch Department
module.exports.deleteDepartment = async function(req,res){
     var departmentId = req.params.departmentId;
    try{
        var employeeExist = await User.find({"employeeProfile.departmentId": ObjectID(departmentId)});
        if(employeeExist.length > 0){
            throw new Error(`You can't delete the department as department linked with some Employees`)
        }
        await Department.deleteOne( {_id: ObjectID(departmentId) });
        res.send({status: 'success', message: "Department Deleted Successfully"});
    }catch(err){
        res.send({status: 'error', message: err.message});
    }
}

// List all the departments of an individual branch
module.exports.listAllDepartments = async function(req,res){
    try{
        var departmentList = await Department.find({userId: req.params.branchId});
        res.send( {status: 'success', message: "Department List Success", department: departmentList });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}

// List Individual Deparment Details
module.exports.departmentDetails = async function(req,res){
    try{
        var departmentDetails = await Department.findById({_id: ObjectID(req.params.departmentId)});
        return res.send({ status: 'success', message: 'Individual department list success', data: departmentDetails });
    }catch(err){}
}

// List all the Deparments]
module.exports.allDepartments = async function(req,res){
    try{
        var departments = await Department.find({"companyId":ObjectID(req.params.companyId)});
        return res.send({status:'success', message:'Whole Department List Success', data: departments});
    } catch(err){
        return res.send({status: 'error', message: err.message});
    }
}