const DocumentTypes = require('../models/document-types');
const commonFunction = require('../commonFunctions');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const User = require('../models/user');

// Add Document Types
module.exports.addDocumentTypes = async function(req,res){
    try{
        if( !req.body.title ){
            return res.send({ status: 'error', message:'Missing document type title' });
        }
        var addData = req.body;
        addData.companyId = req.params.companyId;

        const newDocumentType = await DocumentTypes.addDocumentTypes(addData);
        if(newDocumentType){
            var returnDocumnetType = {
                documentType:{
                    _id: newDocumentType.documentType._id,
                    title: newDocumentType.documentType.title
                }
            }
            return res.send({ status: 'success', message: 'Documnet Type Added Successfully',data: returnDocumnetType });

        }else{
            return res.send({ status:'error', message:'Unable TO Add Document Types' })
        }
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Update Document Type
module.exports.updateDocumentTypes = async function(req,res){
    try{

        const documentTypeId = req.params.documentTypeId;
        const companyId = req.params.companyId;
        var updateData = {};
        // check if data is there for update
        (req.body.title)? updateData.title = req.body.title: "";
        (req.body.description)? updateData.description = req.body.description: ""
        updateData.isRequired = req.body.isRequired;

        // check whether the update data is empty or not
        if(!commonFunction.isEmpty(updateData)){
                // Return promise for document type title is already exists for the same company
                return await DocumentTypes.findOne( { "companyId": ObjectID(companyId), "title": updateData.title}).then( async (foundDocumentType) => {
                    if(foundDocumentType){
                        if(foundDocumentType._id != documentTypeId){
                            throw new Error(`Document Type Title ${updateData.title} already exists`);
                        }
                    }
                        return await DocumentTypes.findOneAndUpdate( {"companyId": ObjectID(companyId), _id: ObjectID(documentTypeId)}, updateData, {new:true} ).then((updatedDocumentType) => {
                            // save update document type meta data
                            updatedDocumentType.metaData.updatedBy = updatedDocumentType.companyId;
                            updatedDocumentType.metaData.updatedAt = MetaData.dateInfo();
                            return updatedDocumentType.save().then((documentType) => {
                            return res.send({status: 'success', message: "Document Type Update Successfully",data: documentType});
                            })
                        })
                })
            }else{
                return res.send({status: 'error', message:"Please update the value of given fields to see a change"});
            }
}catch(err){
    return res.send({status: "error", message: err.message});
}
}


// List all Document Types of an individual company
module.exports.listAllDocumentTypes = async function(req,res){
    try{
        const documentTypes = await DocumentTypes.find({companyId: req.params.companyId});
        res.send( {status: 'success', message: "Document Type List Success", data: documentTypes });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}

// Delete the document type
module.exports.deleteDocumentType = async function(req,res){
    const documentTypeId = req.params.documentTypeId;
   try{
       const existDocumentType = await User.find({
        "employeeProfile.documents": { $elemMatch: { documentTypeId: ObjectID(documentTypeId) } }
       });
       if(existDocumentType.length > 0){
        res.send({status: 'error', message: "This document is linked with some of the employees"});
       } else {
           const deletedDocumentType = await DocumentTypes.deleteOne( {_id: ObjectID(documentTypeId) });
           if(deletedDocumentType.deletedCount === 0){
            res.send({status: 'error', message: "No Document Type To Delete. Please Check Your Document Type Id"});
           }else{
            res.send({status: 'success', message: "Document Type Deleted Successfully"});
           }
       }

   }catch(err){
       res.send({status: 'error', message: err.message});
   }
}

//List Individual Document Type Details
module.exports.documentTypeDetails= async function(req,res){
    try{
        var documentTypeDetails = await DocumentTypes.findById({_id: ObjectID(req.params.documentTypeId)});
        return res.send({ status: 'success', message: 'Individual Document type list success', data: documentTypeDetails });
    }catch(err){
        return res.send({ status:'error', message: err.message });
    }
}

// List Which Documnets are uploaded for an employee
module.exports.listUploadedDocumnets = async function(req,res){
    try{
        var employeeId = req.params.employeeId;
        var companyId = req.params.companyId;
        var documentTypesDetails = await DocumentTypes.find({"companyId": ObjectID(companyId)});
        var employeeDetails = await User.findById({_id:ObjectID(employeeId)});
        var employeeDocumentDetails = employeeDetails.employeeProfile.documents;

        if(documentTypesDetails.length > 0){
            if(employeeDocumentDetails.length > 0){
                for(var i = 0; i<employeeDocumentDetails.length; i++){
                    for(var j = 0; j<documentTypesDetails.length; j++){
                        if((documentTypesDetails[j]._id).toString() == employeeDocumentDetails[i].documentTypeId.toString()){
                            documentTypesDetails.splice(j,1);
                        }
                    }
                }
            } else{
                return res.send({status:'success', message:'Uploaded Documnet List Successfully', data: documentTypesDetails})
            }
            return res.send({status: 'success',message:'Uploaded Documnet List Successfully', data: documentTypesDetails});
        } else {
            documentTypesDetails = [];
                return res.send({status:'success', message:'Uploaded Documnet List Successfully',data: documentTypesDetails});
        }

    } catch(err){
        return res.send({status: 'error', message: err.message});
    }
}

