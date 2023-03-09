const UserGroup = require("../models/user-groups");
const ObjectID = require("mongodb").ObjectID;
const MetaData = require("../models/meta-data");
const commonFunction = require("../commonFunctions");

// Add User Groups
module.exports.addUserGroup = async function(req, res) {
  if (!req.body.title ) {
    return res.send({ status: "error", message: "Missing User Group Title" });
  }

  try {
    var userGroupData = req.body;
    const newuserGroup= await UserGroup.addUserGroup(
      userGroupData
    );
    if (newuserGroup) {
      const returnUserGroup = {
        _id: newuserGroup.userGroup._id,
        title: newuserGroup.userGroup.title
      };
      return res.send({
        status: "success",
        message: "User Group Added Successfully",
        data: returnUserGroup
      });
    } else {
      return res.send({ status: "error", message: "Unable To Add User Group" });
    }
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// update User Group
module.exports.updateUserGroup = async function(req, res) {
  const userGroupId = req.params.userGroupId;
  const updateData = {};

  req.body.title ? (updateData.title = req.body.title) : "";
  req.body.description ? (updateData.description = req.body.description) : "";

  try {
    if (!commonFunction.isEmpty(updateData)) {
      // When User wants to update Title
      if (updateData.title) {
        // Return Promise If the title is already exists or not while update the user group
        var promise = UserGroup.findOne({
          _id: ObjectID(userGroupId),
          title: updateData.title
        });
        return promise.then(foundTitle => {
          if (foundTitle) {
            return res.send({
              status: "error",
              message: `User Group Title ${updateData.title} already taken`
            });
          } else {
            return UserGroup.findOneAndUpdate(
              {_id: ObjectID(userGroupId) },
              updateData,
              { new: true }
            ).then(updatedUserGroup => {
              // Update Meta data and Trno
              updatedUserGroup.metaData.createdAt = MetaData.dateInfo();
            //   updatedUserGroup.metaData.createdBy = data.jwtToken;
              updatedUserGroup.trno = MetaData.getCurrentTrno();
              updatedUserGroup.save();
              return res.send({
                status: "success",
                message: "User Group Updated Successfully",
                data: updatedUserGroup
              });
            });
          }
        });
      } else {
        return UserGroup.findOneAndUpdate(
          {_id: ObjectID(userGroupId) },
          updateData,
          { new: true }
        ).then(updatedUserGroup => {
          // Update Meta data and Trno
          updatedUserGroup.metaData.createdAt = MetaData.dateInfo();
        //   updatedUserGroup.metaData.createdBy = data.jwtToken;
          updatedUserGroup.trno = MetaData.getCurrentTrno();
          updatedUserGroup.save();
          return res.send({
            status: "success",
            message: "User Groups Updated Successfully",
            data: updatedUserGroup
          });
        });
      }
    } else {
      return res.send({
        status: "error",
        message: "Please Update the Values too see Changes"
      });
    }
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// Delete User Group
module.exports.deleteUserGroup = async function(req, res) {
  const userGroupId = req.params.userGroupId;
  try {
    const deletedUserGroup = await UserGroup.deleteOne({
      _id: ObjectID(userGroupId)
    });
    if (deletedUserGroup.deletedCount === 0) {
      res.send({
        status: "error",
        message:
          "No User Group To Delete. Please Check Your User Group Id"
      });
    } else {
      res.send({
        status: "success",
        message: "User Group Deleted Successfully"
      });
    }
  } catch (err) {
    res.send({ status: "error", message: err.message });
  }
};

// List Individual User Group
module.exports.userGroupDetails = async function(req, res) {
  try {
    var userGroupDetails = await UserGroup.findById({
      _id: ObjectID(req.params.userGroupId)
    });
    return res.send({
      status: "success",
      message: "User Group list success",
      data: userGroupDetails
    });
  } catch (err) {
    return res.send({ status: "error", message: err.message });
  }
};

// List all the user groups
module.exports.listAllUserGroups = async function(req,res){
  try{
      var userGroups = []
      var userGroupDetails = await UserGroup.find();
      if(userGroupDetails.length > 0){
        userGroupDetails.forEach((items)=>{
          var userGroup = {
            _id: items._id,
            title: items.title,
            description: items.description
          }
          userGroups.push(userGroup);
        })
        return res.send({ status: 'success', message: 'User Groups List Successfully' ,data: userGroups});
      } else {
        return res.send({ status: 'success', message: 'There is no User Grops details', data: userGroups })
      }
  }catch(err){
    return res.send({status: 'error', message: err.message});
  }
}