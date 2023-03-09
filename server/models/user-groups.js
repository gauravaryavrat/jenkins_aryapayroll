const mongoose = require("mongoose");
const Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;
const sanitize = require("mongo-sanitize");
const logger = require("../utils/logger")(module);
const MetaData = require("./meta-data");

const userGroupSchema = new Schema({
  metaData: MetaData.schema,
  trno: Number,
  title: {
    type: String,
    required: ["User Group Title Must Given"]
  },
  description: String,
});

// /////////////////////////////////
// PROPERTIES
// /////////////////////////////////

// Add User Groups
userGroupSchema.statics.addUserGroup = function addUserGroup(data) {
  title = sanitize(data.title);
  const promise = this.findOne({
    "title": title
  });
  return (
    promise
      .then(foundTitle => {
        if (foundTitle) {
          throw new Error(`User Group Title ${title} already taken`);
        } else {
          const UserGroup = mongoose.model("UserGroup", userGroupSchema);
          const newUserGroup = new UserGroup();
          newUserGroup.metaData = new MetaData();
          //Add Meta Data For User Groups
        //   newUserGroup.metaData.createdBy = data.jwtToken;
          newUserGroup.metaData.createdAt = MetaData.dateInfo();
          // Add User Groups Details
          newUserGroup.trno = MetaData.getCurrentTrno();
          newUserGroup.title = data.title;
          newUserGroup.description = data.description;

          return newUserGroup;
        }
      })
      // save the user groups details
      .then(newUserGroup => {
        return newUserGroup
          .save()
          .then(savedUserGroup => {
            logger.info(
              "********  USER GROUPS ADDED SUCCESSFULLY ********",
              savedUserGroup.title
            );
            return { userGroup: savedUserGroup };
          })
          .catch(function(err) {
            throw new Error(err.message);
          });
      })
  );
};

module.exports = mongoose.model("UserGroup", userGroupSchema);
