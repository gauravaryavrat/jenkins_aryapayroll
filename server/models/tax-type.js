var mongoose = require('mongoose');
var Schema  = mongoose.Schema;
    ObjectId = Schema.ObjectId;

var taxTypeSchema = new Schema({

    userId: {type: ObjectId},
    description: String,
    defaultRate: Number,
    salesGL: String,
    purchaseGL: String,
    inActive: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('TaxTypes',taxTypeSchema); 