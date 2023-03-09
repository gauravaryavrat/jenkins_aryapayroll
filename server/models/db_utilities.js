const Role = require('./roles');
const logger = require('../utils/logger')(module);
const mongoose = require('mongoose');

module.exports.createRolePermissions = async function(){

    let roleExists = await Role.find({"title": 'ADMIN'});
    if(roleExists.length === 0 ){
        let rolePermissions = {
            title: 'ADMIN',
            description: 'Have All Rights',
            metaData: {
                createdAt: new Date()
            }
        }
        rolePermissions.permission = [];
        rolePermissions.permission.push({
            title: 'All',
            description: 'Manage Whole Application',
            metaData: {
                createdAt: new Date()
            }
        });
       await Role.create(rolePermissions,function(err,data){
            if(err) {
                logger.info('********  ERROR IN CREATING ADMIN ROLE ********');
            } else {
                logger.info('********  ADMIN ROLE CREATED SUCCESSFULLY ********');
            }
        })
    }
}

//Provide Role
module.exports.roleList = function(req,res){
    try {
        let roles = {
            create: [
                {Name: 'Create Company',Code: 'Company'},
                {Name: 'Create Branch',Code: 'Branch'},
                {Name: 'Create Department',Code: 'Department'},
                {Name: 'Create LeaveType',Code: 'LeaveType'},
                {Name: 'Create JobProfile',Code: 'JobProfile'},
                {Name: 'Create JobCategory',Code: 'JobCategory'},
                {Name: 'Create SkillCategory',Code: 'SkillCategory'},
                {Name: 'Create DocumentType',Code: 'DocumentType'},
                {Name: 'Create Holiday',Code: 'Holiday'},
                {Name: 'Create PaymentHeads',Code: 'PaymentHeads'},
                {Name: 'Create GradeRule',Code: 'GradeRule'},
                {Name: 'Create Employees',Code: 'Employees'},
                {Name: 'Create EarnedLeave',Code: 'EarnedLeave'},
                {Name: 'Create Leave',Code: 'Leave'},
                {Name: 'Create Payroll',Code: 'Payroll'},
            ],
            edit: [
                {Name: 'Edit Company',Code: 'Company'},
                {Name: 'Edit Branch',Code: 'Branch'},
                {Name: 'Edit Department',Code: 'Department'},
                {Name: 'Edit LeaveType',Code: 'LeaveType'},
                {Name: 'Edit JobProfile',Code: 'JobProfile'},
                {Name: 'Edit JobCategory',Code: 'JobCategory'},
                {Name: 'Edit SkillCategory',Code: 'SkillCategory'},
                {Name: 'Edit DocumentType',Code: 'DocumentType'},
                {Name: 'Edit Holiday',Code: 'Holiday'},
                {Name: 'Edit PaymentHeads',Code: 'PaymentHeads'},
                {Name: 'Edit GradeRule',Code: 'GradeRule'},
                {Name: 'Edit Employees',Code: 'Employees'},
                {Name: 'Edit EarnedLeave',Code: 'EarnedLeave'},
                {Name: 'Edit Leave',Code: 'Leave'},
                {Name: 'Edit Payroll',Code: 'Payroll'},
            ],
            delete: [
                {Name: 'Delete Company', Code: 'Company'},
                {Name: 'Delete Branch', Code: 'Branch'},
                {Name: 'Delete Department', Code: 'Department'},
                {Name: 'Delete LeaveType', Code: 'LeaveType'},
                {Name: 'Delete JobProfile', Code: 'JobProfile'},
                {Name: 'Delete JobCategory', Code: 'JobCategory'},
                {Name: 'Delete SkillCategory', Code: 'SkillCategory'},
                {Name: 'Delete DocumentType', Code: 'DocumentType'},
                {Name: 'Delete Holiday', Code: 'Holiday'},
                {Name: 'Delete PaymentHeads', Code: 'PaymentHeads'},
                {Name: 'Delete GradeRule', Code: 'GradeRule'},
                {Name: 'Delete Employees', Code: 'Employees'},
                {Name: 'Delete EarnedLeave', Code: 'EarnedLeave'},
                {Name: 'Delete Leave', Code: 'Leave'},
                {Name: 'Delete Payroll', Code: 'Payroll'},
            ]
        }
        return res.send({status: 'success', message: 'Role List Successfull', data: roles})
    } catch (error) {
        return res.send({status: 'error',message: err.message})
    }
}

module.exports.roleListing = roleListing = [
    'Create Company', 'Create Branch','Create Department','Create LeaveType','Create JobProfile','Create JobCategory','Create SkillCategory','Create DocumentType','Create Holiday','Create PaymentHeads','Create GradeRule','Create Employees','Create EarnedLeave','Create Leave','Create Payroll',
    'Edit Company', 'Edit Branch','Edit Department','Edit LeaveType','Edit JobProfile','Edit JobCategory','Edit SkillCategory','Edit DocumentType','Edit Holiday','Edit PaymentHeads','Edit GradeRule','Edit Employees','Edit EarnedLeave','Edit Leave','Edit Payroll',
    'Delete Company', 'Delete Branch','Delete Department','Delete LeaveType','Delete JobProfile','Delete JobCategory','Delete SkillCategory','Delete DocumentType','Delete Holiday','Delete PaymentHeads','Delete GradeRule','Delete Employees','Delete EarnedLeave','Delete Leave','Delete Payroll'
]

