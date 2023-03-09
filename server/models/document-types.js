const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const logger = require('../utils/logger')(module);
const MetaData = require('./meta-data');
const sanitize = require('mongo-sanitize');
const ObjectID = require('mongodb').ObjectID;


const documentTypeSchema = new Schema({
    companyId: ObjectId,
    metaData: MetaData.schema,
    title: {
        type: String,
        required: [true,'Document type title must given']
    },
    description: String,
    isRequired: Boolean,
});

// Add Documents Types
documentTypeSchema.statics.addDocumentTypes = function(data){
    title = sanitize(data.title);

    // return promise
    const promise = this.findOne( { 'companyId': ObjectID(data.companyId), 'title': { $regex:  title, $options: 'i'} } );
    return promise.then((foundDocumentType) => {
        if(foundDocumentType){
            throw new Error(`Document Type Title ${title} Already Taken`);
        }else{
            var DocumentType = mongoose.model('DocumentTypes',documentTypeSchema);
            var newDocumentType = new DocumentType();
            newDocumentType.metaData = new MetaData();
            // Add metaData details
            newDocumentType.metaData.createdBy = data.companyId;
            newDocumentType.metaData.createdAt = MetaData.dateInfo();
            // Add Document Type Details
            newDocumentType.companyId = data.companyId;
            newDocumentType.title = data.title;
            newDocumentType.description = data.description;
            newDocumentType.isRequired = data.isRequired;

            return (newDocumentType)
        }
    })
    // Save Document Type
    .then((newDocumentType) => {
        return newDocumentType.save().then((savedDocumentType) => {
            logger.info('********  DOCUMENT TYPE ADDED SUCCESSFULLY ********', savedDocumentType.title);
            return({documentType:savedDocumentType});
        })
    })

}
module.exports = mongoose.model('DocumentTypes',documentTypeSchema);