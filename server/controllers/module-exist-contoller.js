const ObjectID = require('mongodb').ObjectId;
var Module;

module.exports.moduleExists = async function(req,res){
    try{
        if(req.params.type === 'Department'){
            Module = require('../models/department');
        }
        if(req.params.type === 'Branches'){
            Module = require('../models/branch');
        }
        if(req.params.type === 'LeaveTypes'){
            Module = require('../models/leaves-type');
        }
        if(req.params.type === 'JobProfile'){
            Module = require('../models/job-profile');
        }
        if(req.params.type === 'JobCategory'){
            Module = require('../models/job-category');
        }
        if(req.params.type === 'SkillCategory'){
            Module = require('../models/skill-category');
        }
        if(req.params.type === 'DocumentTypes'){
            Module = require('../models/document-types');
        }
        if(req.params.type === 'Holidays'){
            Module = require('../models/holiday');
        }
        if(req.params.type === 'PaymentHead'){
            Module = require('../models/payment-head');
        }
        if(req.params.type === 'GradeRule'){
            Module = require('../models/grade-rule');
        }
        let ifExist;
            var foundModule = await Module.find({_id: ObjectID(req.params.moduleId),companyId: ObjectID(req.params.companyId)})
                if(foundModule.length > 0){
                    ifExist = true;
                } else {
                    ifExist = false;
                }
                return res.send({status: 'success', message: 'Module Exist', data: ifExist});
    }catch(err){
        return res.send({staus: 'error', message: err.message});
    }
}