var mongoose = require('mongoose');
var Schema  = mongoose.Schema;
    ObjectId = Schema.ObjectId;

var taxGroupSchema = new Schema({
    userId:{type:ObjectId},
    description: String,
    inActive: {
        type: Boolean,
        default: false,
    },
    taxVal: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('TaxGroups',taxGroupSchema);