"use strict";
const Company = require("../models/company");
const ObjectID = require("mongodb").ObjectID;
const MetaData = require("../models/meta-data");
const commonFunction = require("../commonFunctions");
const Holiday = require("../models/holiday");
const Leave = require("../models/leave");
const User = require("../models/user");
const JobProfile = require("../models/job-profile");
const Department = require("../models/department");
const _ = require("underscore");
const moment = require("moment");
const LeaveType = require("../models/leaves-type");
const Branch = require("../models/branch");
const DocumentTypes = require("../models/document-types");
const GradeRule = require("../models/grade-rule");
const JobCategory = require("../models/job-category");
const PaymentHead = require("../models/payment-head");
const SkillCategory = require("../models/skill-category");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const unlinkAsync = promisify(fs.unlink);

// Add company
module.exports.addCompany = async function(req, res) {
    if (!req.body.name ||
        !req.body.address ||
        !req.body.email ||
        !req.body.officialNumber
    ) {
        return res.send({ status: "error", message: "Missing required fields" });
    }
    try {
        var companyData = {};
        companyData = req.body;
        companyData.parentUserId = req.params.parentUserId;
        req.params.subUserId ? (companyData.subUserId = req.params.subUserId) : "";

        const newCompany = await Company.addCompany(companyData);
        if (newCompany) {
            const returnCompanyData = {
                _id: newCompany.company._id,
                createdAt: newCompany.company.createdAt
            };
            return res.send({
                status: "success",
                message: "Company added Successfully",
                company: returnCompanyData
            });
        } else {
            return res.send({ status: "error", message: "Unable to add Company" });
        }
    } catch (err) {
        console.log(err);
        return res.send({ status: "error", message: err.message });
    }
};

// Update Company
module.exports.updateCompany = async function(req, res) {
    const parentUserId = req.params.parentUserId;
    const companyId = req.params.companyId;
    const subUserId = req.params.subUserId;

    const getUpdateData = {};
    getUpdateData.ui = {};
    getUpdateData.payrollSetting = {};
    getUpdateData.bankDetails = {};

    // (req.body.name)?getUpdateData.name = req.body.name:"";
    // (req.body.address)?getUpdateData.address = req.body.address:"";
    // (req.body.domicile)?getUpdateData.domicile = req.body.domicile:"";
    // (req.body.phone)?getUpdateData.phone = req.body.phone:"";
    // (req.body.fax)?getUpdateData.fax = req.body.fax:"";
    // (req.body.officialNumber)?getUpdateData.officialNumber = req.body.officialNumber:"";
    // (req.body.gstNumber)?getUpdateData.gstNumber = req.body.gstNumber:"";
    // (req.body.currency)?getUpdateData.currency = req.body.currency:"";
    getUpdateData.name = req.body.name;
    getUpdateData.address = req.body.address;
    getUpdateData.domicile = req.body.domicile;
    getUpdateData.phone = req.body.phone;
    getUpdateData.fax = req.body.fax;
    getUpdateData.officialNumber = req.body.officialNumber;
    getUpdateData.gstNumber = req.body.gstNumber;
    getUpdateData.currency = req.body.currency;
    getUpdateData.payrollSetting.panNumber = req.body.panNumber;
    getUpdateData.payrollSetting.taxationNumber = req.body.taxationNumber;
    getUpdateData.bankDetails.bankName = req.body.bankName;
    getUpdateData.bankDetails.bankAccNum = req.body.bankAccNum;
    getUpdateData.bankDetails.bankType = req.body.bankType;

    req.body.logoUrl ? (getUpdateData.logoUrl = req.body.logoUrl) : "";
    req.body.newLogoUrl ? (getUpdateData.newLogoUrl = req.body.newLogoUrl) : "";
    req.body.deleteLogo ? (getUpdateData.deleteLogo = req.body.deleteLogo) : "";
    req.body.timeZone ? (getUpdateData.timeZone = req.body.timeZone) : "";
    req.body.reportLogo ? (getUpdateData.reportLogo = req.body.reportLogo) : "";
    req.body.autoIncreaseDoc ?
        (getUpdateData.autoIncreaseDoc = req.body.autoIncreaseDoc) :
        "";
    // UI updateData
    req.body.nameInList ?
        (getUpdateData.ui.nameInList = req.body.nameInList) :
        "";
    req.body.printDialog ?
        (getUpdateData.ui.printDialog = req.body.printDialog) :
        "";
    req.body.searchItemList ?
        (getUpdateData.ui.searchItemList = req.body.searchItemList) :
        "";
    req.body.searchCustomerList ?
        (getUpdateData.ui.searchCustomerList = req.body.searchCustomerList) :
        "";
    req.body.searchSupplierList ?
        (getUpdateData.ui.searchSupplierList = req.body.searchCustomerList) :
        "";
    req.body.loginTimeOut ?
        (getUpdateData.ui.loginTimeOut = req.body.loginTimeOut) :
        "";
    // Payroll Setting updateData
    req.body.epfNumber ?
        (getUpdateData.payrollSetting.epfNumber = req.body.epfNumber) :
        "";
    // (req.body.panNumber)?getUpdateData.payrollSetting.panNumber = req.body.panNumber:"";
    req.body.tanNumber ?
        (getUpdateData.payrollSetting.tanNumber = req.body.tanNumber) :
        "";
    req.body.tdsCircle ?
        (getUpdateData.payrollSetting.tdsCircle = req.body.tdsCircle) :
        "";
    req.body.deductionCycle ?
        (getUpdateData.payrollSetting.deductionCycle = req.body.deductionCycle) :
        "";


    var updateData = commonFunction.cleanEmpties(getUpdateData);

    try {
        if (!commonFunction.isEmpty(updateData)) {
            await Company.findOneAndUpdate({ userId: ObjectID(parentUserId), _id: ObjectID(companyId) },
                updateData
            );
            await Company.findById(companyId)
                .exec()
                .then(company => {
                    //if sub User update the company data
                    if (subUserId) {
                        company.metaData.updatedBy = subUserId;
                        company.metaData.updatedAt = MetaData.dateInfo();
                        company.save();
                        return res.send({
                            status: "success",
                            message: "Company Info Updated Successfully",
                            company: company
                        });
                    } // if parent user want to update the company
                    else {
                        company.metaData.updatedBy = parentUserId;
                        company.metaData.updatedAt = MetaData.dateInfo();
                        company.save();
                        return res.send({
                            status: "success",
                            message: "Company Info Updated Successfully",
                            company: company
                        });
                    }
                });
        } else {
            return res.send({
                status: "error",
                message: "Please fill out your desired fields to update the filled fields"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Delete Company
module.exports.deleteCompany = async function(req, res) {
    var companyId = req.params.companyId;
    try {
        // Delete All Company Branch for given company
        deleteDependencies(Branch, "companyId", companyId, "Branches");

        // Delete All Depatments for given company
        deleteDependencies(Department, "companyId", companyId, "Departments");

        // Delete All Documnet Types for given company
        deleteDependencies(DocumentTypes, "companyId", companyId, "DocumnetTypes");

        // Delete All Grade Rule for given company
        deleteDependencies(GradeRule, "companyId", companyId, "Grade Rules");

        // Delete All Holiday for given company
        deleteDependencies(Holiday, "companyId", companyId, "Holidays");

        // Delete All Job Categories for given company
        deleteDependencies(JobCategory, "companyId", companyId, "Job Categories");

        // Delete All Job Profile for given company
        deleteDependencies(JobProfile, "companyId", companyId, "Job Profiles");

        // Delete All Leave for given company
        deleteDependencies(Leave, "companyId", companyId, "Leaves");

        // Delete All Leave Types for given company
        deleteDependencies(LeaveType, "companyId", companyId, "Leave Types");

        // Delete All Payment Heads for given company
        deleteDependencies(PaymentHead, "companyId", companyId, "Payment Heads");

        // Delete All Skill Category for given company
        deleteDependencies(
            SkillCategory,
            "companyId",
            companyId,
            "Skill Categories"
        );

        // Delete All The User for given company
        deleteDependencies(
            User,
            "employeeProfile.companyId",
            companyId,
            "Employees"
        );

        await Company.deleteOne({ _id: ObjectID(companyId) });
        res.send({ status: "success", message: "Company Deleted Successfully" });
    } catch (err) {
        res.send({ status: "error", message: err.message });
    }
};

// List all the companies under both parent user as well as subuser
module.exports.listAllCompanies = async function(req, res) {
    try {
        let userDetails = await User.findById({ _id: ObjectID(req.params.parentUserId) });
        if (userDetails.parentUserId) {
            var companyList = await Company.find({ userId: userDetails.parentUserId });
        } else {
            var companyList = await Company.find({ userId: req.params.parentUserId });
        }

        res.send({
            status: "success",
            message: "Company List Success",
            company: companyList
        });
    } catch (err) {
        res.send({ status: "error", message: err.message });
    }
};

// List individual company Details
module.exports.listCompany = async function(req, res) {
    try {
        var companyList = await Company.findById({
            _id: ObjectID(req.params.companyId)
        });

        res.send({
            status: "success",
            message: "Company List Success",
            data: companyList
        });
    } catch (err) {
        res.send({ status: "error", message: err.message });
    }
};

// List all the companies under subuser
module.exports.listSubuserCompanies = async function(req, res) {
    try {
        var subUserCompanyList = await Company.find({
            "metaData.createdBy": req.params.subUserId
        });
        res.send({
            status: "success",
            message: "Subuser Companies List Success",
            data: subUserCompanyList
        });
    } catch (err) {
        res.send({ status: "error", message: err.message });
    }
};

// List All Attendance of Company and a Employee
module.exports.listAttendanceHistory = async function(req, res) {
    try {
        var companyHolidayList = await Holiday.find({
            companyId: ObjectID(req.params.companyId)
        }).sort({ holidayDate: 1 });
        var employeeDetails = await User.findById({
            _id: ObjectID(req.params.employeeId)
        });
        var leaveList = await Leave.find({
            userId: ObjectID(req.params.employeeId)
        }).sort({ fromDate: 1 });
        var attendanceList = commonFunction.attendanceListResponse(
            companyHolidayList,
            leaveList
        );
        var finalAttendanceList = _.uniq(attendanceList, function(p) {
            return p.year;
        });

        /**
         * Leave Given by the company
         * Current Year Leave Data
         */
        var currentDate = new Date();
        var year = currentDate.getFullYear();
        var companyPaidBalance = await paidLeaveDetails(
            req.params.employeeId,
            year
        );
        var leaveApplied = await approvedPaidLeaves(req.params.employeeId, year);

        /**
         * Previous Year Leave Data
         */
        var previousYear = year - 1;
        var previousCompanyPaidBalance = await paidLeaveDetails(
            req.params.employeeId,
            previousYear
        );
        var previousLeaveApplied = await approvedPaidLeaves(
            req.params.employeeId,
            previousYear
        );

        // Response Data
        var returnHistory = {
            currentYearHistory: {
                sanctionedLeaves: companyPaidBalance,
                grantedLeaves: leaveApplied.paidLeaves + leaveApplied.unsanctionedLeave,
                balanceLeaves: parseFloat(employeeDetails.employeeProfile.payroll.paidLeaveBalance) +
                    parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance)
            },
            previousYearHistory: {
                sanctionedLeaves: previousCompanyPaidBalance,
                grantedLeaves: previousLeaveApplied.paidLeaves +
                    previousLeaveApplied.unsanctionedLeave
            },
            leaveHistory: finalAttendanceList
        };

        if (attendanceList) {
            return res.send({
                status: "success",
                message: "Attendance History List Success",
                data: returnHistory
            });
        } else {
            return res.send({
                status: "error",
                message: "Unable to list attendance"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List all the employees in a company
module.exports.listAllEmployees = async function(req, res) {
    try {
        var companyId = req.params.companyId;
        var status;
        if (req.params.status === "Active") {
            status = true;
        } else {
            status = false;
        }
        var employeeDetails = [];
        var employeeList = await User.find({
            "employeeProfile.companyId": ObjectID(companyId),
            isActive: status
        });
        if (employeeList.length > 0) {
            for (var i = 0; i < employeeList.length; i++) {
                let avatar;
                if (employeeList[i].profile.imageUrl === `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`) {
                    avatar = employeeList[i].profile.imageUrl
                } else {
                    avatar = `http://${req.headers.host}/${employeeList[i].profile.imageUrl.substr(employeeList[i].profile.imageUrl.indexOf('public')+6)}`
                }
                var jobProfileInfo = await JobProfile.findById({
                    _id: ObjectID(employeeList[i].employeeProfile.jobProfileId)
                });
                var positionName, title;
                !jobProfileInfo
                    ?
                    (positionName = "") :
                    (positionName = jobProfileInfo.positionName);
                var departmentInfo = await Department.findById({
                    _id: ObjectID(employeeList[i].employeeProfile.departmentId)
                });
                !departmentInfo ? (title = "") : (title = departmentInfo.title);
                var employeeDetail = {
                    _id: employeeList[i]._id,
                    name: await User.getDisplayName(employeeList[i]._id),
                    avatar: avatar,
                    departmentName: title,
                    email: employeeList[i].local.email,
                    age: employeeList[i].employeeProfile.age,
                    jobProfile: positionName,
                    isActive: employeeList[i].isActive
                };
                employeeDetails.push(employeeDetail);
            }
        } else {
            employeeDetails = [];
        }
        return res.send({
            status: "success",
            message: "Employees List Success",
            data: employeeDetails
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// List Individual Company List
module.exports.companyDetails = async function(req, res) {
    try {
        var returnCompanyData = {};
        var defaultLogo = `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
        var companyDetails = await Company.findById({
            _id: ObjectID(req.params.companyId)
        });
        if (companyDetails.countryInfoId) {
            var results = await mongoose.connection
                .collection("countries_infos")
                .find({ _id: ObjectID(companyDetails.countryInfoId) })
                .toArray();
            returnCompanyData.countryName = results[results.length - 1].country_name;
            returnCompanyData.currency = results[results.length - 1].currency_code;
        }
        returnCompanyData.name = companyDetails.name;
        returnCompanyData.address = companyDetails.address;
        returnCompanyData.domicile = companyDetails.domicile;
        returnCompanyData.officialNumber = companyDetails.officialNumber;
        returnCompanyData.fax = companyDetails.fax;
        returnCompanyData.email = companyDetails.email;
        returnCompanyData.taxationNumber =
            companyDetails.payrollSetting.taxationNumber;
        returnCompanyData.panNumber = companyDetails.payrollSetting.panNumber;
        returnCompanyData._id = companyDetails._id;
        returnCompanyData.bankName = companyDetails.bankDetails.bankName;
        returnCompanyData.bankAccNum = companyDetails.bankDetails.bankAccNum;
        returnCompanyData.bankType = companyDetails.bankDetails.bankType;
        if (companyDetails.logoUrl === defaultLogo) {
            returnCompanyData.logoUrl = companyDetails.logoUrl;
        } else {
            let alterFilePath = companyDetails.logoUrl.substr(companyDetails.logoUrl.indexOf('public') + 6);
            returnCompanyData.logoUrl = `http://${req.headers.host}${alterFilePath}`
        }

        return res.send({
            status: "success",
            message: "Individual company list success",
            data: returnCompanyData
        });
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Fetch the paid leave given to a employee by a compnay
async function paidLeaveDetails(employeeId, currentYear) {
    try {
        var employeeDetails = await User.findById({ _id: ObjectID(employeeId) });
        var leaveSettingsDetails = employeeDetails.employeeProfile.leaveSettings;
        var paidBalance = 0;
        for (var i = 1; i <= 12; i++) {
            for (var j = 0; j < leaveSettingsDetails.length; j++) {
                var month = i.toString().padStart(2, 0);
                if (
                    moment(`${currentYear}-${month}`).isBetween(
                        commonFunction.dateFormatAlter(leaveSettingsDetails[j].startDate),
                        commonFunction.dateFormatAlter(leaveSettingsDetails[j].endDate),
                        "month",
                        "[]"
                    )
                ) {
                    paidBalance += parseFloat(leaveSettingsDetails[j].leavePerMonth);
                }
            }
        }
        return paidBalance;
    } catch (err) {
        return err;
    }
}

// Fetch Approved Paid Leave
async function approvedPaidLeaves(employeeId, year) {
    try {
        var begin = new Date(`${year}-01-01`);
        var end = new Date(`${year}-12-31`);
        // Leave Taken by an Employee
        var leaveDetails = await Leave.find({
            userId: ObjectID(employeeId),
            $and: [{ fromDate: { $gte: begin, $lte: end } }]
        });
        var leaveDetail = {
            paidLeaves: 0,
            unsanctionedLeave: 0
        };
        if (leaveDetails.length > 0) {
            for (var j = 0; j < leaveDetails.length; j++) {
                var leaveIsPaid = await LeaveType.findById({
                    _id: ObjectID(leaveDetails[j].leaveTypeId)
                });
                if (
                    leaveDetails[j].status === "Approved" ||
                    leaveDetails[j].status === "Unsanctioned" ||
                    leaveDetails[j].status === "Sandwich"
                ) {
                    for (var i = 0; i < leaveDetails[j].dates.length; i++) {
                        if (
                            leaveDetails[j].dates[i].leaveFor === "Second Half" ||
                            leaveDetails[j].dates[i].leaveFor === "First Half"
                        ) {
                            if (leaveIsPaid.isPaid) {
                                leaveDetail.paidLeaves += 0.5;
                            } else {
                                leaveDetail.unsanctionedLeave += 0.5;
                            }
                        } else {
                            if (leaveIsPaid.isPaid) {
                                leaveDetail.paidLeaves += 1;
                            } else {
                                leaveDetail.unsanctionedLeave += 1;
                            }
                        }
                    }
                } else {
                    continue;
                }
            }
            return leaveDetail;
        } else {
            return leaveDetail;
        }
    } catch (err) {
        return err;
    }
}

// delete Dependencies
async function deleteDependencies(
    collectionName,
    parameterName,
    deleteId,
    dependenciesOf
) {
    try {
        var query = {};
        query[parameterName] = ObjectID(deleteId);

        var bulk = collectionName.collection.initializeUnorderedBulkOp();
        bulk.find(query).remove();
        bulk.execute(function(err, result) {
            if (err) {
                throw new Error(`There is Error in Deleting ${dependenciesOf}`);
            }
        });
    } catch (err) {
        return err;
    }
}

// Get TL Details
module.exports.getCompanyTl = async function(req, res) {
    try {
        let companyId = req.params.companyId;
        let companyTlDetails = await User.find({
            "employeeProfile.managerId": ObjectID(companyId)
        });
        let returnData = [];
        if (companyTlDetails.length > 0) {
            for (let i = 0; i < companyTlDetails.length; i++) {
                let tlDetails = {
                    _id: companyTlDetails[i]._id,
                    name: await User.getDisplayName(companyTlDetails[i]._id)
                };
                returnData.push(tlDetails);
            }
        } else {
            returnData = [];
        }
        return res.send({
            status: "success",
            message: "Tl List",
            data: returnData
        });
    } catch (err) {
        console.log(err);
    }
};

// Change Employee Status
module.exports.changeEmployeeStatus = async function(req, res) {
    try {
        const employeeId = req.params.employeeId;
        var status;
        if (req.params.status === "Active") {
            status = true;
        } else {
            status = false;
        }

        const employeeStatus = await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { isActive: status }, { new: true });
        if (employeeStatus.isActive === status) {
            return res.send({
                status: "success",
                message: "Employee Status Changed SuccessFully"
            });
        } else {
            return res.send({
                status: "error",
                message: "There is Problem in Changing Employee Status"
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

module.exports.uploadCompanyLogo = async function(req, res) {
    try {
        if (req.params.type !== 'Update ReportLogo' && req.params.type !== 'Add CompanyLogo' && req.params.type !== 'Update CompanyLogo') {
            return res.send({ status: 'error', message: 'Type is not defined correctly' });
        }
        var action = req.params.type.substr(0, req.params.type.indexOf(" "));
        var type = req.params.type.substr(req.params.type.indexOf(" ") + 1);

        if (req.params.isCompanyLogo === "true") {
            var storage = multer.diskStorage({
                destination: function(req, file, callback) {
                    if (!fs.existsSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        )) {
                        fs.mkdirSync(
                            path.join(path.resolve(__dirname, "../../server"), "/public")
                        );
                    }
                    if (!fs.existsSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`
                            )
                        )) {
                        fs.mkdirSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`
                            )
                        );
                    }
                    if (!fs.existsSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`,
                                `/${req.params.companyId}`
                            )
                        )) {
                        fs.mkdirSync(
                            path.join(
                                path.resolve(__dirname, "../../server"),
                                `/public/${req.params.companyId}`,
                                `/${req.params.companyId}`
                            )
                        );
                    }
                    callback(null, `./public/${req.params.companyId}/${req.params.companyId}`);
                },
                filename: function(req, file, callback) {
                    callback(
                        null,
                        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
                    );
                }
            });

            const upload = multer({
                storage: storage,
                limits: { fileSize: 2000000 },
                fileFilter: function(req, file, cb) {
                    checkFileType(file, cb);
                }
            }).single("companyLogo");

            // Check File Type
            function checkFileType(file, cb) {
                // Allowed ext
                const filetypes = /jpeg|jpg|png|gif/;
                // Check ext
                const extname = filetypes.test(
                    path.extname(file.originalname).toLowerCase()
                );
                // Check mime
                const mimetype = filetypes.test(file.mimetype);

                if (mimetype && extname) {
                    return cb(null, true);
                } else {
                    cb("Images Only!");
                }
            }
            upload(req, res, async function(err) {
                if (err instanceof multer.MulterError) {
                    return res.send({
                        status: "error",
                        message: `Multer Error While Uploading the Documents ${err}`
                    });
                } else if (err) {
                    return res.send({
                        status: "error",
                        message: err
                    });
                }
                // Update Path in the database
                var alterFilePath = req.file.path.substr(req.file.path.indexOf("/"));
                var updateData = path.join(
                    path.resolve(__dirname, "../../server"),
                    req.file.path
                );
                var defaultLogo = `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
                var existingCompanyDetails = await Company.findById({ _id: ObjectID(req.params.companyId) });
                var responseMessage;

                if (action === 'Add') {
                    if (type === 'CompanyLogo') {
                        await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "logoUrl": updateData, "reportLogo": updateData }, { new: true });
                        responseMessage = 'Company Logo Uploaded Successfully';
                    }
                } else if (action === 'Update') {
                    if (type === 'CompanyLogo') {
                        if (existingCompanyDetails.logoUrl === defaultLogo) {
                            await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "logoUrl": updateData }, { new: true });
                            responseMessage = 'Company Logo Updated Successfully';
                        } else {
                            if (existingCompanyDetails.logoUrl === existingCompanyDetails.reportLogo) {
                                await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "logoUrl": updateData }, { new: true });
                                responseMessage = 'Company Logo Updated Successfully';
                            } else {
                                await unlinkAsync(existingCompanyDetails.logoUrl);
                                await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "logoUrl": updateData }, { new: true });
                                responseMessage = 'Company Logo Updated Successfully';
                            }
                        }
                    } else if (type === 'ReportLogo') {
                        if (existingCompanyDetails.reportLogo === defaultLogo) {
                            await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "reportLogo": updateData }, { new: true });
                            responseMessage = 'Report Logo Updated Successfully';
                        } else {
                            if (existingCompanyDetails.logoUrl === existingCompanyDetails.reportLogo) {
                                await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "reportLogo": updateData }, { new: true });
                                responseMessage = 'Report Logo Updated Successfully';
                            } else {
                                await unlinkAsync(existingCompanyDetails.reportLogo);
                                await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "reportLogo": updateData }, { new: true });
                                responseMessage = 'Report Logo Updated Successfully';
                            }
                        }
                    }
                }
                return res.send({
                    status: "success",
                    message: responseMessage,
                    data: `http://${req.headers.host}${alterFilePath}`
                });
            });
        } else {
            var defaultLogo = `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
            var responseMessage;
            if (action === 'Add') {
                if (type === 'CompanyLogo') {
                    await Company.findOneAndUpdate({ _id: ObjectID(req.params.companyId) }, { "logoUrl": defaultLogo, "reportLogo": defaultLogo }, { new: true });
                    responseMessage = 'Company Logo Uploaded Successfully';
                }
            }
            return res.send({
                status: "success",
                message: responseMessage,
                data: defaultLogo
            });
        }
    } catch (err) {
        return res.send({ status: "error", message: err.message });
    }
};

// Fetch all employees details (Active/Inactive) for individual company
module.exports.employeeCount = async function(req, res) {
    try {
        var employeesDetails = await User.find({ "employeeProfile.companyId": ObjectID(req.params.companyId) });
        return res.send({ status: 'success', message: 'Employee Count', data: employeesDetails.length });
    } catch (error) {
        console.log(error);
    }
}