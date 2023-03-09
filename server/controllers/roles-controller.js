const Role = require('../models/roles');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const commonFunction = require('../commonFunctions');
const sanitize = require('mongo-sanitize');
const User = require('../models/user');
// Add Role
module.exports.addRole = async function(req,res){
    if( (!req.body.title) ){
        return res.send( {status:'error', message:"Missing Title"} );
    }

    try{
        var roleData = {};
        roleData = {
            title: req.body.title,
            description: req.body.description
        };

        roleData.userId = req.params.userId;
        for(let key in req.body){
            if(key === 'permission'){
                for(let permissionKey in req.body[key]){
                        if(roleData.permission){
                            req.body[key][permissionKey].forEach((items)=>{
                                let permission = {
                                    title: items,
                                    description: '',
                                    metaData: {
                                        createdAt: new Date(),
                                        createdBy: req.params.userId
                                    }
                                }
                                roleData.permission.push(permission)
                            })
                        } else {
                            roleData.permission = [];
                            req.body[key][permissionKey].forEach((items)=>{
                                let permission = {
                                    title: items,
                                    description: '',
                                    metaData: {
                                        createdAt: new Date(),
                                        createdBy: req.params.userId
                                    }
                                }
                                roleData.permission.push(permission)
                            })
                        }
                }
            }
        }

        const newRole = await Role.addRole(roleData);
        if(newRole){
            const returnRole = {
                _id: newRole.role._id,
            };
            return res.send({status:'success',message:'Role added Successfully',data: returnRole});
        }else{
            return res.send({ status: 'error', message: "Unable to add Role" });
        }
    }catch (err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Update branch department
module.exports.updateRole = async function (req,res){
    title = sanitize(req.body.title);
    const userId = req.params.userId;
    const roleId = req.params.roleId;
    var updateData = {};
    // Check data is available for update or not
    (req.body.title)?updateData.title = req.body.title:"",
    (req.body.description)?updateData.description = req.body.description:"";

    try{
        if(!commonFunction.isEmpty(updateData)){

            const foundTitle = await Role.findOne({'title':{ $regex: title, $options: 'i'}});
            if(foundTitle){
                if(foundTitle._id != roleId){
                    return res.send({status:'success',message:"Role Title Already Taken"});
                }
            }
                    const updateRole = await Role.findOneAndUpdate( {_id: ObjectID(roleId)},updateData,{new:true} );
                        updateRole.metaData.updatedBy = userId;
                        updateRole.metaData.updatedAt = MetaData.dateInfo();
                        updateRole.save();
                        return res.send({status: 'success', message: "Role Info Updated Successfully",data: updateRole});
        }else{
            return res.send({status: 'error',message: "Please Update the value too see changes"});
        }
    }catch (err){
            return res.send({status: 'error', message: err.message});
    }
}

// Delete Role
module.exports.deleteRole = async function(req,res){
     var roleId = req.params.roleId;
    try{
        await Role.deleteOne( {_id: ObjectID(roleId) });
        res.send({status: 'success', message: "Role Deleted Successfully"});
    }catch(err){
        res.send({status: 'error', message: err.message});
    }
}

// List all the Roles
module.exports.listAllRoles = async function(req,res){
    try{
        var roleList = await Role.find({"metaData.createdBy":ObjectID(req.params.userId)});
        res.send( {status: 'success', message: "Role List Success", data: roleList });
    }catch(err){
        console.log(err.message);
        res.send({ status: 'error', message: err.message });
    }
}

// List Individual Role Details
module.exports.roleDetails = async function(req,res){
    try{
        var roleDetails = await Role.findById({_id: ObjectID(req.params.roleId)});
        return res.send({ status: 'success', message: 'Individual Role list success', data: roleDetails });
    }catch(err){
        return res.send({status: 'error', message: err.message});
    }
}

// List Permissions
module.exports.individualPermissionList = async function(req,res){
    try {
        let permissionDetails = await Role.findById({_id: ObjectID(req.params.roleId)});
        let returnPermissionData = {
            _id: permissionDetails._id,
            title: permissionDetails.title
        };
        if(permissionDetails.permission.length > 0){
            for(let i = 0; i < permissionDetails.permission.length; i++){
                let permission = permissionDetails.permission[i].title.substr(0,permissionDetails.permission[i].title.indexOf(' '));
                if(permission.toLowerCase() === 'create'){
                    if(returnPermissionData.create){
                        returnPermissionData.create.push(permissionDetails.permission[i].title);
                    } else {
                        returnPermissionData.create = [];
                        returnPermissionData.create.push(permissionDetails.permission[i].title);
                    }
                }
                if(permission.toLowerCase() === 'edit'){
                    if(returnPermissionData.edit){
                        returnPermissionData.edit.push(permissionDetails.permission[i].title);
                    } else {
                        returnPermissionData.edit = [];
                        returnPermissionData.edit.push(permissionDetails.permission[i].title);
                    }
                }
                if(permission.toLowerCase() === 'delete'){
                    if(returnPermissionData.delete){
                        returnPermissionData.delete.push(permissionDetails.permission[i].title);
                    } else {
                        returnPermissionData.delete = [];
                        returnPermissionData.delete.push(permissionDetails.permission[i].title);
                    }
                }
            }
            return res.send({status: 'success', message: 'Permissions List Success', data: returnPermissionData});
        } else {
            returnPermissionData.create = [];
            returnPermissionData.edit = [];
            returnPermissionData.delete = [];
            return res.send({status:'success', message: 'Permission List Success', data: returnPermissionData});
        }
    } catch (error) {
        return res.send({status: 'error', message: error.message});
    }
}
