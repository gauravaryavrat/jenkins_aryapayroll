const Role = require('../models/roles');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const User = require('../models/user');
const db_utilities = require('../models/db_utilities');

// Update Permission
module.exports.updatePermission = async function (req,res){
    try{
      let roleData ={};

      for(let key in req.body){
        if(key === 'permission'){
            for(let permissionKey in req.body[key]){
                    if(roleData.permission){
                        req.body[key][permissionKey].forEach((items)=>{
                            let permission = {
                                title: items,
                                description: '',
                                metaData: {
                                    updatedAt: new Date(),
                                    updatedBy: req.params.userId
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
                                    updatedAt: new Date(),
                                    updatedBy: req.params.userId
                                }
                            }
                            roleData.permission.push(permission)
                        })
                    }
            }
        }
    }

    await Role.findOneAndUpdate({_id: ObjectID(req.params.roleId)},{
        $set: {
            'permission': []
          }
    });
    let savedRoleDate = await Role.findOneAndUpdate({_id: ObjectID(req.params.roleId)},{
        $set:{'permission': roleData.permission}
    },{new: true});
    return res.send({status:'success', message: 'Permissions Updated Successfully', data: savedRoleDate});
    }catch (err){
            return res.send({status: 'error', message: err.message});
    }
}

// Delete Permission
module.exports.deletePermission = async function(req,res){
     const permissionId = req.params.permissionId;
    try{
        return Role.findOneAndUpdate(
            { _id: ObjectID(req.params.roleId) },
            {
              $pull: {
                "permission": {
                  _id: ObjectID(permissionId)
                }
              }
            },
            { new: true },
            function(err, data) {
              if (err) {
                return res.send({
                  status: "error",
                  message: "Problem in deleting permission"
                });
              }
              return res.send({
                status: "success",
                message: "Permission Deleted Successfully"
              });
            }
          );
    }catch(err){
        res.send({status: 'error', message: err.message});
    }
}

// Give Permission List
module.exports.permissionDetails =async function(req,res){
  try {
    let userDetails = await User.findById({_id: ObjectID(req.params.userId)});
    let returnData = [];
    let permissionData = await Role.findById({_id: ObjectID(userDetails.rolePermissionId)});
    if(permissionData.title === 'ADMIN'){
      return res.send({status:'success', message: 'Permission Detais Info', data: JSON.stringify(db_utilities.roleListing)});
    } else {
      for(let i = 0 ; i < permissionData.permission.length; i++){
        returnData.push(permissionData.permission[i].title);
      }
      return res.send({status:'success', message: 'Permission Detais Info', data: JSON.stringify(returnData)});
    }
  } catch (error) {
    return res.send({status:'error', message: error.message});
  }
}