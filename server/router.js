'use strict'

const express = require('express');
const router = express.Router();
const config = require('./config');
const logger = require('./utils/logger')(module);
const amazonS3 = require('./controllers/amazon-s3');
const auth = require('./lib/auth');

/*
 * CONTROLLERS
 */
const userController = require('./controllers/user-controller');
const settingsController = require('./controllers/settings-controller');
const companyController = require('./controllers/company-controller');
const branchController = require('./controllers/branch-controller');
const departmentController = require('./controllers/department-controller');
const jobCategoryController = require('./controllers/job-category-controller');
const skillCategoryController = require('./controllers/skill-category-controller');
const employeeController = require('./controllers/employee-profile-controller');
const leaveController = require('./controllers/leave-controller');
const leaveTypeController = require('./controllers/leave-types-controller');
const documentTypeController = require('./controllers/document-types-controller');
const jobProfileController = require('./controllers/job-profile-controller');
const holidayController = require('./controllers/holiday-controller');
const paymentHeadController = require('./controllers/payment-head-contoller');
const userGroupController = require('./controllers/user-groups-controller');
const salaryController = require('./controllers/salary-slip-controller');
const gradeRuleController = require('./controllers/grade-rule-controller');
const earnedLeaveController = require('./controllers/earned-leave-controller');
const currencyController = require('./controllers/currencyConttroller');
const moduleExistContoller = require('./controllers/module-exist-contoller');
const rolesController = require('./controllers/roles-controller');
const permissionController = require('./controllers/permission-controller');
const utilities = require('./models/db_utilities');
/*
 * ROUTER MIDDLEWARE
 */
//All routes will be redirect to HTTPS on production
var https_port = process.env.HTTPS_PORT || '';
if (config.express.isOnProduction || https_port) {
    router.use(function(req, res, next) {
        var host = req.get('host');
        //console.log("host = " + host + ", protocol: " + req.protocol);
        if (req.get('x-forwarded-proto') != "https" && req.protocol != 'https') {
            // res.set('x-forwarded-proto', 'https');
            res.redirect('https://' + host + req.url);
        } else {
            next();
        }
    });
}

router.post('/upload-images-to-amazons3', amazonS3.upload_images);

router.get('/', userController.defaultRoute);

//notification
const utilitiess = require('./utilities')
router.post('/user/notification', utilitiess.GenNoti)
    /** Login */
router.post('/users/login', userController.login);

router.post('/user/signup-via-email', userController.signupViaEmail);
router.post('/user/password/set', userController.setPassword);
router.post('/user/confirm-registration', userController.confirmRegistration);
router.post('/user/password/request-reset', userController.sendPasswordResetToken);
router.get('/user-details/:userId', userController.listUSerDetails);
router.post('/user/update-details/:userId', userController.updateUserDetails)

router.get('/users/login/google', auth.authenticate.googleLogin);
router.post('/users/login/google/app', auth.authenticate.googleLoginMb);
router.get('/users/login/google/callback', auth.authenticate.googleLoginCb);

router.get('/users/login/facebook', auth.authenticate.facebookLogin);
router.post('/users/login/facebook/app', auth.authenticate.facebookLoginMb);
router.get('/users/login/facebook/callback', auth.authenticate.facebookLoginCb);

/** Sub Users */
router.post('/user/add-subuser/:parentUserId', userController.userSignupViaEmail);
router.post('/user/update-subuser/:parentUserId/:subUserId', userController.updateSubUser);
router.delete('/user/delete-subuser/:parentUserId/:subUserId', userController.deleteSubUser);
router.get('/user/list-subusers/:parentUserId', userController.listAll);

/** Sub user set Password */
router.get('/user/subuser-details/:userId', userController.subUserDetails);

/** Company */
router.post('/company/add-company/:parentUserId', companyController.addCompany);
router.post('/company/add-company/:parentUserId/:subUserId', companyController.addCompany);
router.post('/company/update-company/:parentUserId/:companyId', companyController.updateCompany);
router.post('/company/update-company/:parentUserId/:subUserId/:companyId', companyController.updateCompany);
router.delete('/company/delete-company/:companyId', companyController.deleteCompany);
router.get('/company/company-list/:parentUserId', companyController.listAllCompanies);
router.get('/company/individual-company-list/:companyId', companyController.listCompany);
router.get('/company/subuser-company-list/:subUserId', companyController.listSubuserCompanies);
router.get('/company/details/:companyId', companyController.companyDetails);
router.get('/company/get-tl-list/:companyId', companyController.getCompanyTl);

/** Company Branch */
router.post('/company/add-branch/:companyParentId', branchController.addBranch);
router.post('/company/update-branch/:companyParentId/:branchId', branchController.updateBranch);
router.get('/company/branch-list/:companyParentId', branchController.listAllBranches);
router.delete('/company/delete-branch/:branchId', branchController.deleteBranch);
router.get('/company/branch-details/:branchId', branchController.branchDetails);

/** Department */
router.post('/branch/add-department/:branchId/:companyId', departmentController.addDepartment);
router.post('/branch/update-department/:branchId/:departmentId', departmentController.updateDepartment);
router.delete('/branch/delete-department/:departmentId', departmentController.deleteDepartment);
router.get('/branch/list-department/:branchId', departmentController.listAllDepartments);
router.get('/branch/department-details/:departmentId', departmentController.departmentDetails);
router.get('/departments/list-all/:companyId', departmentController.allDepartments);

/** Job Category */
router.post('/company/add-job-category/:companyId', jobCategoryController.addJobCategory);
router.post('/company/add-job-category/:companyId/:parentCategoryId', jobCategoryController.addJobCategory);
router.post('/company/update-job-category/:companyId/:jobCategoryId', jobCategoryController.updateJobCategory);
router.get('/company/list-job-categories/:companyId', jobCategoryController.listAllCategories);
router.delete('/company/delete-job-category/:jobCategoryId', jobCategoryController.deleteCategory);
router.get('/company/job-category-details/:jobCategoryId', jobCategoryController.jobCategoryDetails);

/** Skill Category */
router.post('/category/add-skill-category/:companyId/:userId', skillCategoryController.addSkillCategory);
router.post('/category/update-skill-category/:skillCategoryId/:companyId/:userId', skillCategoryController.updateSkillCategory);
router.get('/category/list-skill-category/:companyId', skillCategoryController.listAllSkillCategories);
router.delete('/category/delete-skill-category/:skillCategoryId', skillCategoryController.deleteSkillCategory);
router.get('/category/skill-category-details/:skillCategoryId', skillCategoryController.skillCategoryDetails);

/** Employee Profile */
router.post('/user/add-employee/:parentUserId', employeeController.addEmployeeProfile);
router.post('/employee/add-employee-skills/:employeeId', employeeController.addEmployeeSkills);
router.post('/employee/add-employee-family/:employeeId', employeeController.addFamilyMembers);
router.post('/employee/add-employee-address/:employeeId', employeeController.addEmployeeAddress);
router.post('/employee/add-employee-educational-details/:employeeId', employeeController.addEducationalDetails);
router.post('/employee/add-employee-work-experiences/:employeeId', employeeController.addWorkExperiences);
router.post('/employee/add-employee-identity-proofs/:employeeId', employeeController.addIdentityProofs);
router.post('/employee/add-employee-bank-details/:employeeId', employeeController.addBankDetails);
router.post('/employee/add-employee-language-skills/:employeeId', employeeController.addLanguageSkills);
router.post('/employee/add-employee-hobbies/:employeeId', employeeController.addHobbies);
router.post('/employee/add-employee-bio/:employeeId', employeeController.addBio);
// router.post('employee/add-leave-setting/:employeeId/:userId',)

/** Employee Update Profile */
router.post('/employee/update-employee-profile/:employeeId/:userId', employeeController.updateEmployeeProfile);
router.post('/employee/update-address/:employeeId/:addressId', employeeController.updateAddress);
router.post('/employee/update-skills/:employeeId/:skillId', employeeController.updateSkills);
router.post('/employee/update-family-details/:employeeId/:familyId', employeeController.updateFamilyDetails);
router.post('/employee/update-educational-detail/:employeeId/:educationId', employeeController.updateEducationalDetails);
router.post('/employee/update-bank-details/:employeeId', employeeController.updateBankDetails);
router.post('/employee/update-hobby/:employeeId/:hobbyId', employeeController.updateHobby);
router.post('/employee/update-language-skill/:employeeId/:languageId', employeeController.updateLanguageSkill);
router.post('/employee/update-identity-proofs/:employeeId/:proofId', employeeController.updateIdentityProof);
router.post('/employee/update-work-experiences/:employeeId/:workExperienceId', employeeController.updateWorkExperience);
router.post('/employee/update-bio/:employeeId', employeeController.updateBio);

/** List Employee Profile */
router.get('/employee/list-details/:employeeId', employeeController.listEmployeeDetails);
router.get('/employee/list-addresses/:employeeId', employeeController.listAddresses);
router.get('/employee/list-skills/:employeeId', employeeController.listSkills);
router.get('/employee/list-family-details/:employeeId', employeeController.listFamilyDetails);
router.get('/employee/list-educational-details/:employeeId', employeeController.listEducationalDetails);
router.get('/employee/list-bank-details/:employeeId', employeeController.listBankDetails);
router.get('/employee/list-hobbies/:employeeId', employeeController.listHobbies);
router.get('/employee/list-language-skills/:employeeId', employeeController.listLanguageSkills);
router.get('/employee/list-identity-proofs/:employeeId', employeeController.listIdentityProofs);
router.get('/employee/list-work-experiences/:employeeId', employeeController.listWorkExperiences);
router.get('/employee/list-bio/:employeeId', employeeController.listBio);

/** Employee Delete Profile */
router.delete('/employee/delete-address/:employeeId/:addressId', employeeController.deleteAddress);
router.delete('/employee/delete-skill/:employeeId/:skillId', employeeController.deleteSkill);
router.delete('/employee/delete-family-detail/:employeeId/:familyId', employeeController.deleteFamilyDetails);
router.delete('/employee/delete-educational-detail/:employeeId/:educationId', employeeController.deleteEducationalDetails);
router.delete('/employee/delete-bank-details/:employeeId', employeeController.deleteBankDetails);
router.delete('/employee/delete-hobby/:employeeId/:hobbyId', employeeController.deleteHobby);
router.delete('/employee/delete-language-skill/:employeeId/:languageId', employeeController.deleteLanguageSkill);
router.delete('/employee/delete-identity-proof/:employeeId/:proofId', employeeController.deleteIdentityProof);
router.delete('/employee/delete-work-experience/:employeeId/:workExperienceId', employeeController.deleteWorkExperience);
router.delete('/employee/delete-bio/:employeeId', employeeController.deleteBio);

/** Employee Payroll Settings */
router.post('/employee/add-payroll-setting/:employeeId', employeeController.addPayrollSetting);
router.post('/employee/update-payroll-setting/:employeeId', employeeController.updatePayrollSetting);
router.get('/employee/list-payroll-settings/:employeeId', employeeController.listPayrollSetting);
router.delete('/employee/delete-payroll-setting/:employeeId', employeeController.deletePayrollSetting);

/** Operation on Employees of a Company */
router.get('/company/list-employees/:companyId/:status', companyController.listAllEmployees);
router.get('/company/employee-status/:employeeId/:status', companyController.changeEmployeeStatus);
router.get('/company/employee-count/:companyId', companyController.employeeCount);

/** Employee Set Password */
router.post('/user/employee-set-password/:userId', employeeController.setEmployeePassword);

/** Leave */
router.post('/employee/add-leave/:userId/:companyId', leaveController.addLeave);
router.get('/employee/list-leave/:userId', leaveController.listAllLeaves);
router.get('/company/attendance/:companyId', leaveController.listAllLeavesByCompanyId);
router.post('/employee/mark-leave-absent-or-sandwich/:userId', leaveController.addLeave);
router.get('/employee/particular-date-leaves/:userId/:date', leaveController.dateWiseLeaveList);
router.get('/all-employee/particular-date-leaves/:companyId/:date', leaveController.dateWiseAllLeaveList);

/** Approve/Reject Leave List   */
router.get('/user/request-approve-list/:userId', leaveController.leaveListParentChild);

/** Leave Types */
router.post('/company/add-leave-type/:companyId', leaveTypeController.addLeaveType);
router.post('/company/update-leave-type/:companyId/:leaveTypeId', leaveTypeController.updateLeaveType);
router.get('/company/list-leave-types/:companyId', leaveTypeController.listAllLeaveTypes);
router.delete('/company/delete-leave-type/:leaveTypeId', leaveTypeController.deleteLeaveType);
router.get('/company/leave-type-details/:leaveTypeId', leaveTypeController.leaveTypeDetails);

/** Document Types */
router.post('/company/add-document-types/:companyId', documentTypeController.addDocumentTypes);
router.post('/company/update-document-types/:companyId/:documentTypeId', documentTypeController.updateDocumentTypes);
router.get('/company/list-all-document-types/:companyId', documentTypeController.listAllDocumentTypes);
router.delete('/company/delete-document-type/:documentTypeId', documentTypeController.deleteDocumentType);
router.get('/company/document-type-details/:documentTypeId', documentTypeController.documentTypeDetails);
router.get('/employee/uploaded-documnets/:employeeId/:companyId', documentTypeController.listUploadedDocumnets);

/** Job profile */
router.post('/company/add-job-profile/:companyId', jobProfileController.addJobProfile);
router.post('/company/update-job-profile/:companyId/:jobProfileId', jobProfileController.updateJobProfile);
router.get('/company/list-all-job-profiles/:companyId', jobProfileController.listAllJobProfiles);
router.delete('/company/delete-job-profile/:jobProfileId', jobProfileController.deleteJobProfile);
router.get('/company/job-profile-details/:jobProfileId', jobProfileController.jobProfileDetails);

/** Company Holiday */
router.post('/company/add-holiday/:companyId', holidayController.addHoliday);
router.post('/company/update-holiday/:companyId/:holidayId', holidayController.updateHoliday);
router.get('/company/list-all-holidays/:companyId', holidayController.listAllholidays);
router.post('/company/filter-all-holidays/:companyId', holidayController.filterHolidays);
router.delete('/company/delete-holiday/:holidayId', holidayController.deleteHoliday);
router.get('/company/holiday-details/:holidayId', holidayController.holidayDetails);

/** Settings */
router.get('/settings/list', settingsController.listAll);
router.post('/settings/save', settingsController.save);

/** Assigns and Unassign Ids */
router.post('/user/assign-parentId/:userId', employeeController.assignParentIds);
router.get('/user/unassign-parentId/:userId/:parentUserId', employeeController.unassignParentIds);

/** Activity On Leave */
router.post('/user/activity-leave/:userId/:leaveId', leaveController.actionLeave);

/** Fetch Employee Parent and Child Ids */
router.get('/employee/parent-child-ids/:employeeId', userController.findParentChildIds);

/** List Attendance of a Branch and a Employee*/
router.get('/company/list-user-leave-history/:companyId/:employeeId', companyController.listAttendanceHistory);

/** Comp-Off */
router.post('/company/comp-off-in-time/:parentUserId')

/** Assign And Unassign */
router.post('/subuser/user-permissions-action/:subUserId', userController.userPermissionsAction);

/**Payment Heads */
router.post('/company/add-payment-head/:companyId', paymentHeadController.addPaymentHead);
router.post('/company/update-payment-head/:companyId/:paymentHeadId', paymentHeadController.updatePaymentHead);
router.get('/company/list-payment-heads/:companyId', paymentHeadController.listAllPaymentHeads);
router.get('/company/filter-payment-heads/:companyId/:gradeRuleId', paymentHeadController.filterPaymentHeads)
router.delete('/company/delete-payment-head/:paymentHeadId', paymentHeadController.deletePaymentHead);
router.get('/company/payment-head-details/:paymentHeadId', paymentHeadController.paymentHeadDetails);

/** User Gropus */
router.post('/user/add-user-group', userGroupController.addUserGroup);
router.post('/user/update-user-group/:userGroupId', userGroupController.updateUserGroup);
router.get('/user/user-group-details/:userGroupId', userGroupController.userGroupDetails);
router.delete('/user/delete-user-group/:userGroupId', userGroupController.deleteUserGroup);
router.get('/user/list-user-groups', userGroupController.listAllUserGroups);

/** Add and Remove Profile Image */
router.post('/user/upload-profile-picture/:userId/:companyId/:type', userController.uploadAvatar);
router.delete('/user/remove-profile-picture/:userId', userController.removeAvatar);

/** Add and Remove Employee Documents */
router.post('/user/upload-documents/:userId/:documentTypeId/:employeeId/:type/:companyId', employeeController.addDocument);
router.delete('/user/remove-documnets/:documentTypeId/:employeeId', employeeController.removeDocuments);
router.get('/user/list-documents/:employeeId', employeeController.listDocuments);

/** Salary Slip */
router.post('/employee/generate-salary-slip/:companyId', salaryController.salarySlip);
router.post('/employee/salary-slip-list/:companyId', salaryController.listAllSalarySlips);
router.post('/company/bank-statement/:companyId', salaryController.salaryStatementDetails);
router.get('/company/excel-compnay-details/:companyId/:startDate/:endDate/:gradeRuleId', salaryController.excelSheetData);

/** Currently Working Salary Slip */
router.get('/employee/current-month-salary-slip/:companyId/:year/:month', salaryController.listCurrentMonthSalarySlip);
router.post('/employee/generate-current-month-slip/:companyId/:year/:month/:type', salaryController.currentMonthSlip);
router.get('/employee/filter-salary-slip/:companyId/:modeType/:year/:month', salaryController.filterPaymentMode);
router.get('/employee/filter-current-month-salary-slip/:companyId/:modeType/:year/:month', salaryController.filterCurrentMonthSalarySlip);
router.get('/employee/salary-slip-details/:salarySlipId', salaryController.salarySlipDetails);
router.get('/employee/individual-salary-slip/:employeeId/:year/:month', salaryController.individualSalarySlipDetails);

/** Grade Rule */
router.post('/company/add-grade-rule/:companyId', gradeRuleController.addGradeRule);
router.post('/company/add-grade-rule-payment-head/:gradeRuleId/:companyId', gradeRuleController.addGradeRulePaymentHead);
router.post('/company/update-grade-rule/:companyId/:gradeRuleId', gradeRuleController.updateGradeRule);
router.post('/company/update-grade-rule-payment-head/:paymentHeadsId/:gradeRuleId', gradeRuleController.updateGradeRulePaymentHead);
router.get('/company/grade-rule-list/:gradeRuleId', gradeRuleController.listGradeRules);
router.get('/company/list-all-grade-rule/:companyId', gradeRuleController.listAllGradeRule);
router.delete('/company/delete-grade-rule-payment-head/:paymentHeadsId/:gradeRuleId', gradeRuleController.deleteGradeRulePaymentHead);
router.delete('/company/delete-grade-rule/:gradeRuleId', gradeRuleController.deleteGradeRule);

/** Leave Settings */
router.post('/employee/add-leave-settings/:employeeId/:userId', employeeController.manageLeaveSettings);
router.post('/employee/update-leave-settings/:leaveSettingId/:employeeId/:userId', employeeController.updateLeaveSettings);
router.get('/employee/list-leave-settings/:employeeId', employeeController.listLeaveSettings);

/** Earned Leave Details and Earned Leave History Details */
router.post('/employee/add-earned-leave/:employeeId/:userId', earnedLeaveController.addEarnedLeave);
router.post('/employee/update-earned-leave/:earnedLeaveId/:employeeId/:userId', earnedLeaveController.updateEarnedLeave);
// Earned Leave Details of whole company
router.get('/employee/list-all-eraned-leave/:companyId/:year/:month', earnedLeaveController.listAllEarnedLeave);
// Filter Earned Leave Details for individual employee on the basis of month,year and employeeId
router.get('/employee/earned-leave-details/:employeeId/:year/:month', earnedLeaveController.filterEarnedLeave);
// Individual List for update earned leave details
router.get('/employee/earned-leave-details/:earnedLeaveId/:employeeId', earnedLeaveController.earnedLeaveDetails);
// Earned Leave History
router.get('/employee/earned-leave-history/:employeeId/:year/:month', earnedLeaveController.earnedLeaveHistory);
router.delete('/employee/delete-earned-leave/:employeeId/:year/:month/:leaveCount', earnedLeaveController.deleteEarnedLeave);

/** Currency */
router.post('/company/add-currency/:userId', currencyController.addCurrency);
router.get('/company/list-currency/:userId', currencyController.listAllCurrency);
router.delete('/company/delete-currency/:currencyId', currencyController.deleteCurrency);

/** Upload Company Logo */
router.post('/company/upload-logo/:companyId/:type/:isCompanyLogo', companyController.uploadCompanyLogo);

/** Time Zone */
router.get('/availabe-timezone', userController.availableTimeZone);

// Check If Module Exist in individual company
router.get('/company/check-module-exist/:moduleId/:companyId/:type', moduleExistContoller.moduleExists);

// Roles And Permissions
router.post('/user/add-role/:userId', rolesController.addRole);
router.post('/user/update-role/:userId/:roleId', rolesController.updateRole);
router.post('/user/update-role-permission/:userId/:roleId', permissionController.updatePermission);
router.get('/user/role-list', utilities.roleList);
router.get('/user/all-role-list/:userId', rolesController.listAllRoles);
router.get('/user/individaul-role-list/:roleId', rolesController.roleDetails);
router.get('/user/individaul-permissions-list/:roleId', rolesController.individualPermissionList);
router.delete('/user/delete-permission/:permissionId/:roleId', permissionController.deletePermission);

// Admin
router.get('/user/is-admin/:userId', userController.isAdmin);
router.get('/user/permission-details/:userId', permissionController.permissionDetails);

// Fixed Payment Heads
router.get('/company/fixed-payment-heads/:gradeRuleId', gradeRuleController.fixedPaymentHeads);

// Add Cheque Details
router.post('/user/add-cheque-details/:salaryId', salaryController.updateChequeDetails);
router.get('/user/get-cheque-details/:salaryId', salaryController.getChequeDetails);



/*
 * ERROR HANDLING
 */
router.use(function(req, res, next) {
    logger.error(`Requested URL not found. URL: ${req.url}`)
        //notify.log(req,'',`404 Requested URL not found. URL: ${req.url}`);
    res.status(404);
    res.render('404');
});

//TO DO: Create appropriate error handlers for client side errors
// - Check for error code and rennder appropriate error view
router.use(function(err, req, res, next) {
    logger.error(`500 Internal server error occured. Error stack: ${err.stack || err}`)
        //notify.log(req,'',err);
    res.render('500');
});


module.exports = router;