var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var metaDataSchema = new Schema({
    createdAt: Date,
    updatedAt: Date,
    createdBy: {type: ObjectId},
    updatedBy: {type: ObjectId},
});

metaDataSchema.statics.dateInfo = function()
{
    return new Date();
}

metaDataSchema.statics.getCurrentTrno = function(){
    const newDate = new Date();
    return Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds(), newDate.getMilliseconds());
}
module.exports = mongoose.model('MetaData',metaDataSchema);