var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var overTimeManageSchema = new Schema({
    userId: {type:ObjectId},
    overTimeRate: String,
    overTimeName: String,
    inActive: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('OverTime',overTimeManageSchema);
