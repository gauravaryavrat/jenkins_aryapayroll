const mongoose = require('mongoose');
const Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;
const MetaData = require('./meta-data');
const logger = require('../utils/logger')(module);

const roleSchema = new Schema ({
    ref_id: ObjectId,
    title: {
        type: String,
        required: [true, "Role Title is required"]
    },
    description: String,
    permission: [{
        title: {
            type: String,
            required: [true, "Permission Title is required"],
        },
        description: String,
        metaData: MetaData.schema
    }],
    metaData: MetaData.schema
});

// Add Role
roleSchema.statics.addRole = function(data){
    try {
        const promise = this.findOne({"title":{ $regex:  data.title, $options: 'i'}})
        return promise.then((foundTitle)=>{
            if(foundTitle){
                throw new Error(`Role with title ${foundTitle.title} alreday exist`);
            } else {
                const Role = mongoose.model('Role',roleSchema);
                const newRole = new Role();

                // Metadata creation
                newRole.metaData = new MetaData();
                newRole.metaData.createdBy = data.userId;
                newRole.metaData.createdAt = MetaData.dateInfo();

                // Role Data creation
                newRole.ref_id = data.ref_id;
                newRole.title = data.title;
                newRole.description = data.description;
                if(data.permission){
                    newRole.permission = data.permission;
                }
                return(newRole);
            }
        })
        // save role data
        .then((newRole)=>{
            return newRole.save().then((savedRole)=>{
                logger.info('********  ROLE ADDED SUCCESSFULLY ********', savedRole.title);
                return({role: savedRole});
            })
        })
    } catch (error) {
        return error;
    }
}

module.exports = mongoose.model('Role',roleSchema);