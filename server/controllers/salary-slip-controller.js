const Company = require("../models/company");
const User = require("../models/user");
const JobProfile = require("../models/job-profile");
const GradeRule = require("../models/grade-rule");
const PaymentHeads = require("../models/payment-head");
const ObjectID = require("mongodb").ObjectID;
const Document = require('../models/documents');
const sanitize = require('mongo-sanitize');
const Leave = require('../models/leave');
const LeaveType = require('../models/leaves-type');
const commonFunction = require('../commonFunctions');
const moment = require('moment');
const numberConverter = require('number-to-words');

module.exports.salarySlip = async function(req, res) {
    try {
        const companyId = req.params.companyId;
        const month = req.body.month;
        const year = sanitize(req.body.year);
        var document = [];
        for (var i = 0; i < req.body.employeeIdArray.length; i++) {
            var foundSalarySlip = await Document.findOne({ "employeeId": ObjectID(req.body.employeeIdArray[i]), "month": month, "year": year });
            if (!foundSalarySlip) {
                var check, newDocumnet;
                check = await generateSalarySlip(req.body.employeeIdArray[i], month, year);
                newDocumnet = new Document();
                newDocumnet.employeeId = req.body.employeeIdArray[i];
                newDocumnet.companyId = companyId;
                newDocumnet.gradeRule = check.gradeRule;
                newDocumnet.month = month;
                newDocumnet.year = year;
                newDocumnet.employeeDetails = check.employeeDetails;
                newDocumnet.earnings = check.earnings;
                newDocumnet.deductions = check.deductions;
                newDocumnet.gross = check.gross;
                newDocumnet.totalDeduction = check.totalDeduction;
                newDocumnet.netSalary = check.netSalary;
                let generatedSalaryInfo = await newDocumnet.save();
                document.push(generatedSalaryInfo._id);
            }
        }
        return res.send({ status: 'success', message: 'Salary Slip Generated For All Employees', data: document });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
};

// Generate Salary Slip
async function generateSalarySlip(employeeId, month, year) {
    try {
        var salarySlip = {};
        salarySlip.employeeDetails = {};
        // Employee Details
        var employeeDetails = await User.findById({ _id: ObjectID(employeeId) });
        salarySlip.employeeDetails.employeeName = await User.getDisplayName(
            employeeDetails._id
        );
        salarySlip.gradeRule = employeeDetails.employeeProfile.payroll.gradeRule;
        salarySlip.employeeDetails.imageUrl = employeeDetails.profile.imageUrl;
        salarySlip.employeeDetails.accountNum = employeeDetails.employeeProfile.bankDetails.official.accountNum;
        // Company Details
        var companyDetails = await Company.findById({
            _id: ObjectID(employeeDetails.employeeProfile.companyId)
        });
        salarySlip.employeeDetails.companyName = companyDetails.name;
        // Job Profile Details
        var jobProfileDetails = await JobProfile.findById({
            _id: ObjectID(employeeDetails.employeeProfile.jobProfileId)
        });
        // Get Leave Details
        var leaveDetails = await employeePresence(employeeId, month, year);
        salarySlip.employeeDetails.monthDays = leaveDetails.monthDays;
        salarySlip.employeeDetails.designation = jobProfileDetails.positionName;
        salarySlip.employeeDetails.present = leaveDetails.monthDays - (leaveDetails.unsanctionedLeave + leaveDetails.paidLeaves);
        // Get Leave Settings
        var updatedEmployeeDetails = await leaveSettingsDetails(employeeDetails, month, year, leaveDetails, 'Generate');
        salarySlip.employeeDetails.earnedLeaves = employeeDetails.employeeProfile.payroll.earnedLeaveBalance;
        salarySlip.employeeDetails.esic = "NA";
        salarySlip.employeeDetails.pf = "NA";
        salarySlip.employeeDetails.unsanctionedLeave = leaveDetails.unsanctionedLeave;


        // Employee CTC Configure
        const ctc = parseFloat(employeeDetails.employeeProfile.payroll.ctc);
        salarySlip.employeeDetails.monthlyctc = (ctc / 12).toFixed(2).toString();
        salarySlip.employeeDetails.annuallyctc = ctc.toFixed(2).toString();

        // Grade Rule Configure
        var basicPay = parseFloat(employeeDetails.employeeProfile.payroll.basicPay);
        var everyDaySalary = parseFloat(basicPay / leaveDetails.monthDays);
        salarySlip.employeeDetails.everyDaySalary = everyDaySalary;

        // Calculate payDays
        if (leaveDetails.unsanctionedLeave > 0) {
            var updatedPaidLeaveBalance = parseFloat(updatedEmployeeDetails.employeeProfile.payroll.paidLeaveBalance);
            var updatedEarnedLeaveBalance = parseFloat(updatedEmployeeDetails.employeeProfile.payroll.earnedLeaveBalance);
            var totalBalance = (updatedPaidLeaveBalance + updatedEarnedLeaveBalance) - leaveDetails.unsanctionedLeave;
            if (totalBalance < 0) {
                salarySlip.employeeDetails.payDays = leaveDetails.monthDays + totalBalance;
                salarySlip.employeeDetails.adjustLeave = updatedPaidLeaveBalance === 0 && updatedEarnedLeaveBalance === 0 ? "0" : (updatedPaidLeaveBalance + updatedEarnedLeaveBalance).toString();
                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.paidLeaveBalance": 0, "employeeProfile.payroll.earnedLeaveBalance": 0 });
            } else {
                var earnedLeaveBalance = updatedEarnedLeaveBalance - leaveDetails.unsanctionedLeave;
                salarySlip.employeeDetails.adjustLeave = (leaveDetails.unsanctionedLeave).toString();
                if (earnedLeaveBalance < 0) {
                    var paidLeaveBalance = updatedPaidLeaveBalance + earnedLeaveBalance;
                    earnedLeaveBalance = 0;
                    await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.paidLeaveBalance": paidLeaveBalance, "employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance });
                } else {
                    await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance });
                }
                salarySlip.employeeDetails.payDays = leaveDetails.monthDays;
                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
            }
        } else {
            salarySlip.employeeDetails.adjustLeave = '0';
            salarySlip.employeeDetails.payDays = leaveDetails.monthDays - leaveDetails.unsanctionedLeave;
            basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
        }

        var gross = 0,
            totalDeduction = 0;
        var gradeRuleDetails = await GradeRule.findById({
            _id: ObjectID(employeeDetails.employeeProfile.payroll.gradeRule)
        });
        if (gradeRuleDetails) {
            if (gradeRuleDetails.paymentHeads.length > 0) {
                salarySlip.earnings = [{
                    label: "Basic Salary",
                    amt: basicPay.toFixed(2).toString()
                }];
                salarySlip.deductions = [];

                for (var i = 0; i < gradeRuleDetails.paymentHeads.length; i++) {
                    var paymentHeadsDetails = await PaymentHeads.findById({
                        _id: ObjectID(gradeRuleDetails.paymentHeads[i].paymentHeadId)
                    });
                    if (paymentHeadsDetails.type === "Addition") { // Additions
                        if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = basicPay * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(2).toString()
                                };
                                gross += percentValue;
                            }

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                var percentOfDetails;
                                gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                    if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                        percentOfDetails = gradeRule;
                                    }
                                })
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(2).toString()
                                };
                                gross += percentValue;
                            }

                        } else {
                            var fixedValue = (parseFloat(
                                gradeRuleDetails.paymentHeads[i].value
                            ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;

                            var gradeRuleDetail = {
                                label: paymentHeadsDetails.title,
                                amt: fixedValue.toFixed(2).toString()
                            };
                            gross += fixedValue;
                        }
                        salarySlip.earnings.push(gradeRuleDetail);
                    } else { // Deductions
                        if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = basicPay * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(2).toString()
                                };
                                totalDeduction += percentValue;
                            }

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                var percentOfDetails;
                                gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                    if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                        percentOfDetails = gradeRule;
                                    }
                                })
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(2).toString()
                                };
                                totalDeduction += percentValue;
                            }
                        } else {
                            var fixedValue = (parseFloat(
                                gradeRuleDetails.paymentHeads[i].value
                            ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;
                            var gradeRuleDetail = {
                                label: paymentHeadsDetails.title,
                                amt: fixedValue.toFixed(2).toString()
                            };
                            totalDeduction += fixedValue;
                        }
                        salarySlip.deductions.push(gradeRuleDetail);
                    }
                }
                salarySlip.gross = {
                    label: "Gross",
                    amt: (basicPay + gross).toFixed(2).toString()
                };
                salarySlip.totalDeduction = {
                    label: "Total Deduction",
                    amt: totalDeduction.toFixed(2).toString()
                };
                salarySlip.netSalary = {
                    label: "Net Salary",
                    amt: parseFloat((basicPay + gross) - totalDeduction).toFixed(2).toString()
                };

                return salarySlip;
            } else {
                throw new Error("Please Add Grade Rule First");
            }
        } else {
            throw new Error("Please Add Grade Rule First");
        }
    } catch (err) {
        return err;
    }
}

// List Salary Slips
module.exports.listAllSalarySlips = async function(req, res) {
    try {
        const month = sanitize(req.body.month.toLowerCase());
        const year = sanitize(req.body.year.toLowerCase());
        const companyId = req.params.companyId;
        const returnSalarySlip = [];
        var salarySlipDetails = await Document.find({ "companyId": ObjectID(companyId), "month": month, "year": year });
        if (salarySlipDetails.length > 0) {
            for (var i = 0; i < salarySlipDetails.length; i++) {
                const salarySlip = {
                    _id: salarySlipDetails[i]._id,
                    employeeId: salarySlipDetails[i].employeeId,
                    companyId: salarySlipDetails[i].companyId,
                    month: salarySlipDetails[i].month,
                    year: salarySlipDetails[i].year,
                    employeeDetails: salarySlipDetails[i].employeeDetails,
                    earnings: salarySlipDetails[i].earnings,
                    deductions: salarySlipDetails[i].deductions,
                    gross: salarySlipDetails[i].gross,
                    totalDeduction: salarySlipDetails[i].totalDeduction,
                    netSalary: salarySlipDetails[i].netSalary
                }
                returnSalarySlip.push(salarySlip);
            }
            return res.send({ status: 'success', message: 'Salary Slip List Successfully', data: returnSalarySlip });
        } else {
            return res.send({ status: 'success', message: 'Salary Slip List Successfully', data: returnSalarySlip });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Bank Statement
module.exports.salaryStatementDetails = async function(req, res) {
    try {
        var month = sanitize(req.body.month.toLowerCase());
        var year = sanitize(req.body.year.toLowerCase());

        let salaryDetails = req.body.statementType === 'Bank' ?
            await bankStatement(month, year, req.params.companyId) :
            req.body.statementType === 'Cash' ? await cashStatement(month, year, req.params.companyId) :
            await chequeStatement(month, year, req.params.companyId);

        return res.send({ status: 'success', message: 'Bank Statement List Success', data: salaryDetails });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Check employee presence in company
async function employeePresence(employeeId, month, year) {
    try {
        var begin = new Date(`${year}-${month}-01`);
        var currentDate = new Date();
        var monthEndDate = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
        var end = new Date(`${year}-${month}-${monthEndDate}`);


        // Leave Taken by an Employee
        var leaveDetails = await Leave.find({ "userId": ObjectID(employeeId), $and: [{ "fromDate": { $gte: begin, $lte: end } }] });
        var leaveDetail = {
            paidLeaves: 0,
            unsanctionedLeave: 0,
            monthDays: monthEndDate,
            // Upto Date
            todayDate: (moment(begin).isBefore(currentDate, 'months')) ? monthEndDate : currentDate.getDate()
        };
        if (leaveDetails.length > 0) {
            for (var j = 0; j < leaveDetails.length; j++) {
                var leaveIsPaid = await LeaveType.findById({ _id: ObjectID(leaveDetails[j].leaveTypeId) });
                if (leaveDetails[j].status === "Approved" || leaveDetails[j].status === "Unsanctioned" || leaveDetails[j].status === "Sandwich") {
                    for (var i = 0; i < leaveDetails[j].dates.length; i++) {
                        if (leaveDetails[j].dates[i].leaveFor === "Second Half" || leaveDetails[j].dates[i].leaveFor === "First Half") {
                            if (leaveIsPaid.isPaid) {
                                leaveDetail.paidLeaves += .5;
                            } else {
                                leaveDetail.unsanctionedLeave += .5;
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

// Return Leave Settings Details
async function leaveSettingsDetails(employeeDetails, month, year, leaveDetails, type) {
    try {
        var updatedEmployeeDetails;
        var paidLeave = parseFloat(employeeDetails.employeeProfile.payroll.paidLeaveBalance);
        if (employeeDetails.employeeProfile.leaveSettings.length > 0) {
            for (var i = 0; i < employeeDetails.employeeProfile.leaveSettings.length; i++) {
                var savedStartDate = commonFunction.dateFormatAlter(employeeDetails.employeeProfile.leaveSettings[i].startDate);
                var savedEndDate = commonFunction.dateFormatAlter(employeeDetails.employeeProfile.leaveSettings[i].endDate);
                if (moment(`${year}-${month}-${leaveDetails.monthDays}`).isBetween(savedStartDate, savedEndDate, '[]')) {
                    paidLeave += parseFloat(employeeDetails.employeeProfile.leaveSettings[i].leavePerMonth);
                    if (type === 'Generate') {
                        updatedEmployeeDetails = await User.findOneAndUpdate({ _id: ObjectID(employeeDetails._id) }, { "employeeProfile.payroll.paidLeaveBalance": paidLeave }, { new: true });
                        break;
                    } else if (type === 'List') {
                        updatedEmployeeDetails = {
                            paidLeaveBalance: paidLeave
                        }
                        break;
                    }
                } else {
                    continue;
                }
            }

            updatedEmployeeDetails === undefined ? updatedEmployeeDetails = { paidLeaveBalance: 0 } : '';

            return updatedEmployeeDetails;
        } else {
            return { paidLeaveBalance: 0 };
        }

    } catch (err) {
        return err;
    }
}

// List Salary Slip Details
module.exports.salarySlipDetails = async function(req, res) {
    try {
        var salarySlipDetail = await Document.findById({ _id: ObjectID(req.params.salarySlipId) }).lean();
        console.log("------------------------", salarySlipDetail);
        var companyDetails = await Company.findById({ _id: ObjectID(salarySlipDetail.companyId) });
        salarySlipDetails = {
            _id: salarySlipDetail._id,
            year: salarySlipDetail.year,
            month: salarySlipDetail.month,
            companyId: salarySlipDetail.companyId,
            employeeId: salarySlipDetail.employeeId,
            netSalary: salarySlipDetail.netSalary,
            totalDeduction: salarySlipDetail.totalDeduction,
            gross: salarySlipDetail.gross,
            deductions: salarySlipDetail.deductions,
            earnings: salarySlipDetail.earnings,
            employeeDetails: salarySlipDetail.employeeDetails,
        }
        if (companyDetails.logoUrl === `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`) {
            salarySlipDetails.companyImageUrl = `http://${req.headers.host}/assets/images/aryavrat-infotech-squarelogo-1533534321648.png`;
        } else {
            salarySlipDetails.companyImageUrl = `http://${req.headers.host}${companyDetails.logoUrl.substring(companyDetails.logoUrl.indexOf('public') + 6)}`;
        }
        return res.send({ status: 'success', message: 'Salary Slip Generated Successfully', data: salarySlipDetails });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Filter Employee Salary Slip accroding to there payement mode
module.exports.filterPaymentMode = async function(req, res) {
    try {
        var employeeDetails = await User.find({ "employeeProfile.companyId": req.params.companyId, "employeeProfile.payroll.mode": req.params.modeType, 'isActive': true });
        var salarySlipEmployeeDetails = [];
        for (var i = 0; i < employeeDetails.length; i++) {
            var salarySlipDetail = await Document.find({ employeeId: ObjectID(employeeDetails[i]._id), 'year': req.params.year, 'month': req.params.month });
            if (salarySlipDetail.length > 0) {
                salarySlipDetails = {
                    _id: salarySlipDetail[0]._id,
                    year: salarySlipDetail[0].year,
                    month: salarySlipDetail[0].month,
                    companyId: salarySlipDetail[0].companyId,
                    employeeId: salarySlipDetail[0].employeeId,
                    netSalary: salarySlipDetail[0].netSalary,
                    totalDeduction: salarySlipDetail[0].totalDeduction,
                    gross: salarySlipDetail[0].gross,
                    deductions: salarySlipDetail[0].deductions,
                    earnings: salarySlipDetail[0].earnings,
                    employeeDetails: salarySlipDetail[0].employeeDetails,
                    isGenerated: true
                }
                salarySlipEmployeeDetails.push(salarySlipDetails);
            } else {
                continue;
            }
        }
        return res.send({ status: 'success', message: 'Salary Slip Successfully', data: salarySlipEmployeeDetails });
    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}

// Filter Individual Employee Salary Slip
module.exports.individualSalarySlipDetails = async function(req, res) {
    try {
        var salarySlipDetail = await Document.find({ employeeId: ObjectID(req.params.employeeId), 'year': req.params.year, 'month': req.params.month });
        return res.send({ status: 'success', message: 'Employee Individual Salary Slip list Successfully', data: salarySlipDetail });
    } catch (error) {
        return res.send({ status: 'error', message: error.message })
    }
}

module.exports.currentMonthSlip = async function(req, res) {
    try {
        var document = [];
        // If user salary slip is not generated for the current month
        if (req.params.type === 'Generate') {
            var userSalarySlip = await currentMonthSalarySlip(req.body.employeeIdArray[req.body.employeeIdArray.length - 1], req.params.month, req.params.year);
            var newDocumnet = new Document();
            newDocumnet.employeeId = req.body.employeeIdArray[req.body.employeeIdArray.length - 1];
            newDocumnet.companyId = req.params.companyId;
            newDocumnet.gradeRule = userSalarySlip.gradeRule;
            newDocumnet.month = req.params.month;
            newDocumnet.year = req.params.year;
            newDocumnet.employeeDetails = userSalarySlip.employeeDetails;
            newDocumnet.earnings = userSalarySlip.earnings;
            newDocumnet.deductions = userSalarySlip.deductions;
            newDocumnet.gross = userSalarySlip.gross;
            newDocumnet.totalDeduction = userSalarySlip.totalDeduction;
            newDocumnet.netSalary = userSalarySlip.netSalary;
            await newDocumnet.save();
            // Update the user Value
            // Update deduction value
            var deductions = [],
                earnings = [],
                totalDeduction = {},
                gross = {},
                netSalary = {},
                netDeduction = 0,
                netGross = 0;
            for (var key in req.body.deductions.deductions) {
                netDeduction += parseFloat(req.body.deductions.deductions[key])
                var deductionObject = {
                    label: key,
                    amt: req.body.deductions.deductions[key]
                }
                deductions.push(deductionObject);
            }
            totalDeduction.label = 'Total Deduction';
            totalDeduction.amt = netDeduction.toFixed(2).toString();


            // Update earnings value
            for (var key in req.body.earnings.earnings) {
                netGross += parseFloat(req.body.earnings.earnings[key]);
                var earningsobject = {
                    label: key,
                    amt: req.body.earnings.earnings[key]
                }
                earnings.push(earningsobject);
            }
            gross.label = 'Gross';
            gross.amt = netGross.toFixed(2).toString();

            // net Salary
            var totalGross = (netGross - netDeduction).toFixed(2).toString();
            netSalary.label = 'Net Salary';
            netSalary.amt = totalGross;

            // Update the Salary Slip Document
            await Document.findOneAndUpdate({ _id: ObjectID(newDocumnet._id) }, {
                $set: {
                    "employeeDetails.present": req.body.employeeDetails.present,
                    "employeeDetails.payDays": req.body.employeeDetails.payDays,
                    "deductions": deductions,
                    "earnings": earnings,
                    "gross": gross,
                    "totalDeduction": totalDeduction,
                    "netSalary": netSalary
                }
            }, { new: true });
        }

        // While the salary Slip is already generated and User want to update the salary slip of current month
        if (req.params.type === 'Update') {
            // Update the user Value
            // Update deduction value
            var deductions = [],
                earnings = [],
                totalDeduction = {},
                gross = {},
                netSalary = {},
                netDeduction = 0,
                netGross = 0;
            for (var key in req.body.deductions.deductions) {
                netDeduction += parseFloat(req.body.deductions.deductions[key])
                var deductionObject = {
                    label: key,
                    amt: req.body.deductions.deductions[key]
                }
                deductions.push(deductionObject);
            }
            totalDeduction.label = 'Total Deduction';
            totalDeduction.amt = netDeduction.toFixed(2).toString();


            // Update earnings value
            for (var key in req.body.earnings.earnings) {
                netGross += parseFloat(req.body.earnings.earnings[key]);
                var earningsobject = {
                    label: key,
                    amt: req.body.earnings.earnings[key]
                }
                earnings.push(earningsobject);
            }
            gross.label = 'Gross';
            gross.amt = netGross.toFixed(2).toString();

            // net Salary
            var totalGross = (netGross - netDeduction).toFixed(2).toString();
            netSalary.label = 'Net Salary';
            netSalary.amt = totalGross;

            // Update the Salary Slip Document
            await Document.findOneAndUpdate({ _id: ObjectID(req.body.employeeIdArray[req.body.employeeIdArray.length - 1]) }, {
                $set: {
                    "employeeDetails.present": req.body.employeeDetails.present,
                    "employeeDetails.payDays": req.body.employeeDetails.payDays,
                    "deductions": deductions,
                    "earnings": earnings,
                    "gross": gross,
                    "totalDeduction": totalDeduction,
                    "netSalary": netSalary
                }
            }, { new: true });
        }

        // Generate bunch of salarySlip
        if (req.params.type === 'multipleGenerate') {
            for (var i = 0; i < req.body.employeeIdArray.length; i++) {
                var userSalarySlip = await currentMonthSalarySlip(req.body.employeeIdArray[i], req.params.month, req.params.year);
                var newDocumnet = new Document();
                newDocumnet.employeeId = req.body.employeeIdArray[i];
                newDocumnet.companyId = req.params.companyId;
                newDocumnet.gradeRule = userSalarySlip.gradeRule;
                newDocumnet.month = req.params.month;
                newDocumnet.year = req.params.year;
                newDocumnet.employeeDetails = userSalarySlip.employeeDetails;
                newDocumnet.earnings = userSalarySlip.earnings;
                newDocumnet.deductions = userSalarySlip.deductions;
                newDocumnet.gross = userSalarySlip.gross;
                newDocumnet.totalDeduction = userSalarySlip.totalDeduction;
                newDocumnet.netSalary = userSalarySlip.netSalary;
                var savedDocment = await newDocumnet.save();
                document.push(savedDocment._id);
            }
        }
        return res.send({ status: 'success', message: 'Salary Slip Generated Successfully', data: document });
    } catch (error) {
        return res.send({ staus: 'error', message: error.message });
    }
}

// Generate Current Month Salary Slip
async function currentMonthSalarySlip(employeeId, month, year) {
    try {

        var salarySlip = {};
        salarySlip.employeeDetails = {};

        let requestDate = new Date(`${year}-${month}-01`);

        // Employee Details
        var employeeDetails = await User.findById({ _id: ObjectID(employeeId) });
        salarySlip.employeeDetails.employeeName = await User.getDisplayName(
            employeeDetails._id
        );
        salarySlip.gradeRule = employeeDetails.employeeProfile.payroll.gradeRule;
        salarySlip.employeeDetails.imageUrl = employeeDetails.profile.imageUrl;
        salarySlip.employeeDetails.accountNum = employeeDetails.employeeProfile.bankDetails.official.accountNum;
        // Company Details
        var companyDetails = await Company.findById({
            _id: ObjectID(employeeDetails.employeeProfile.companyId)
        });
        salarySlip.employeeDetails.companyName = companyDetails.name;
        // Job Profile Details
        var jobProfileDetails = await JobProfile.findById({
            _id: ObjectID(employeeDetails.employeeProfile.jobProfileId)
        });
        // Get Leave Details
        var leaveDetails = await employeePresence(employeeId, month, year);

        if (moment(requestDate).isSame(employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate, 'months') &&
            moment(requestDate).isSame(employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate, 'years')) {
            if (employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate.getDate() > 1) {
                leaveDetails.todayDate = leaveDetails.todayDate - (employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate.getDate());
            }
        }

        salarySlip.employeeDetails.monthDays = leaveDetails.monthDays;
        salarySlip.employeeDetails.designation = jobProfileDetails.positionName;
        salarySlip.employeeDetails.present = leaveDetails.todayDate - (leaveDetails.unsanctionedLeave + leaveDetails.paidLeaves);
        // Get Leave Settings
        var updatedEmployeeDetails = await leaveSettingsDetails(employeeDetails, month, year, leaveDetails, 'Generate');
        salarySlip.employeeDetails.earnedLeaves = employeeDetails.employeeProfile.payroll.earnedLeaveBalance;
        salarySlip.employeeDetails.esic = "NA";
        salarySlip.employeeDetails.pf = "NA";
        salarySlip.employeeDetails.unsanctionedLeave = leaveDetails.unsanctionedLeave;


        // Employee CTC Configure
        const ctc = parseFloat(employeeDetails.employeeProfile.payroll.ctc);
        salarySlip.employeeDetails.monthlyctc = (ctc / 12).toFixed(0).toString();
        salarySlip.employeeDetails.annuallyctc = ctc.toFixed(0).toString();

        // Grade Rule Configure
        var basicPay = parseFloat(employeeDetails.employeeProfile.payroll.basicPay);
        var everyDaySalary = parseFloat(basicPay / leaveDetails.monthDays);
        salarySlip.employeeDetails.everyDaySalary = everyDaySalary;
        // Calculate payDays
        if (leaveDetails.unsanctionedLeave > 0) {
            var updatedPaidLeaveBalance = parseFloat(updatedEmployeeDetails.employeeProfile.payroll.paidLeaveBalance);
            var updatedEarnedLeaveBalance = parseFloat(updatedEmployeeDetails.employeeProfile.payroll.earnedLeaveBalance);
            var totalBalance = (updatedPaidLeaveBalance + updatedEarnedLeaveBalance) - leaveDetails.unsanctionedLeave;
            if (totalBalance < 0) {
                salarySlip.employeeDetails.payDays = leaveDetails.todayDate + totalBalance;
                salarySlip.employeeDetails.adjustLeave = updatedPaidLeaveBalance === 0 && updatedEarnedLeaveBalance === 0 ? "0" : (updatedPaidLeaveBalance + updatedEarnedLeaveBalance).toString();
                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.paidLeaveBalance": 0, "employeeProfile.payroll.earnedLeaveBalance": 0 });
            } else {
                var earnedLeaveBalance = updatedEarnedLeaveBalance - leaveDetails.unsanctionedLeave;
                salarySlip.employeeDetails.adjustLeave = (leaveDetails.unsanctionedLeave).toString();
                if (earnedLeaveBalance < 0) {
                    var paidLeaveBalance = updatedPaidLeaveBalance + earnedLeaveBalance;
                    earnedLeaveBalance = 0;
                    await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.paidLeaveBalance": paidLeaveBalance, "employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance });
                } else {
                    await User.findOneAndUpdate({ _id: ObjectID(employeeId) }, { "employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance });
                }
                salarySlip.employeeDetails.payDays = leaveDetails.todayDate;
                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
            }
        } else {
            salarySlip.employeeDetails.adjustLeave = '0';
            salarySlip.employeeDetails.payDays = leaveDetails.todayDate - leaveDetails.unsanctionedLeave;
            basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
        }

        var gross = 0,
            totalDeduction = 0;
        var gradeRuleDetails = await GradeRule.findById({
            _id: ObjectID(employeeDetails.employeeProfile.payroll.gradeRule)
        });
        if (gradeRuleDetails) { // Additions
            if (gradeRuleDetails.paymentHeads.length > 0) {
                salarySlip.earnings = [{
                    label: "Basic Salary",
                    amt: basicPay.toFixed(0).toString()
                }];
                salarySlip.deductions = [];

                for (var i = 0; i < gradeRuleDetails.paymentHeads.length; i++) {
                    var paymentHeadsDetails = await PaymentHeads.findById({
                        _id: ObjectID(gradeRuleDetails.paymentHeads[i].paymentHeadId)
                    });
                    if (paymentHeadsDetails.type === "Addition") {
                        if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = basicPay * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(0).toString()
                                };
                                gross += percentValue;
                            }

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                var percentOfDetails;
                                gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                    if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                        percentOfDetails = gradeRule;
                                    }
                                })
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(0).toString()
                                };
                                gross += percentValue;
                            }

                        } else {
                            var fixedValue = (parseFloat(
                                gradeRuleDetails.paymentHeads[i].value
                            ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;
                            var gradeRuleDetail = {
                                label: paymentHeadsDetails.title,
                                amt: fixedValue.toFixed(0).toString()
                            };
                            gross += fixedValue;
                        }
                        salarySlip.earnings.push(gradeRuleDetail);

                    } else { // Deductions
                        if (gradeRuleDetails.paymentHeads[i].type === "Percent") {
                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = basicPay * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(0).toString()
                                };
                                totalDeduction += percentValue;
                            }

                            if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                var percentOfDetails;
                                gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                    if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                        percentOfDetails = gradeRule;
                                    }
                                })
                                var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                var gradeRuleDetail = {
                                    label: paymentHeadsDetails.title,
                                    amt: percentValue.toFixed(0).toString()
                                };
                                totalDeduction += percentValue;
                            }
                        } else {
                            var fixedValue = (parseFloat(
                                gradeRuleDetails.paymentHeads[i].value
                            ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;

                            var gradeRuleDetail = {
                                label: paymentHeadsDetails.title,
                                amt: fixedValue.toFixed(0).toString()
                            };
                            totalDeduction += fixedValue;
                        }
                        salarySlip.deductions.push(gradeRuleDetail);
                    }
                }
                salarySlip.gross = {
                    label: "Gross",
                    amt: (basicPay + gross).toFixed(0).toString()
                };
                salarySlip.totalDeduction = {
                    label: "Total Deduction",
                    amt: totalDeduction.toFixed(0).toString()
                };
                salarySlip.netSalary = {
                    label: "Net Salary",
                    amt: parseFloat((basicPay + gross) - totalDeduction).toFixed(0).toString()
                };

                return salarySlip;
            } else {
                throw new Error("Please Add Grade Rule First");
            }
        } else {
            throw new Error("Please Add Grade Rule First");
        }
    } catch (error) {
        return error;
    }
}

// Generate Current Month Salary Slip
module.exports.listCurrentMonthSalarySlip = function(req, res) {
    try {
        const companyId = req.params.companyId;
        const month = req.params.month;
        const year = sanitize(req.params.year);

        let requestDate = new Date(`${year}-${month}-01`);

        var employeeSalarySlipDetails = [];
        return User.find({
                "employeeProfile.companyId": companyId,
                'employeeProfile.payroll.ctcEffectiveFromDate': { $exists: true },
                'employeeProfile.payroll.ctcEffectiveToDate': { $exists: true },
                'isActive': true
            })
            .then(async(foundUser) => {

                if (foundUser.length > 0) {
                    for (var k = 0; k < foundUser.length; k++) {
                        var salarySlip = {};

                        salarySlip.month = month;
                        salarySlip.year = year;

                        if (!moment(requestDate).isSameOrAfter(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'months') &&
                            moment(requestDate).isSameOrAfter(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'years')) continue;


                        var foundSalarySlip = await Document.findOne({ 'employeeId': ObjectID(foundUser[k]._id), 'month': req.params.month, 'year': req.params.year });

                        if (!foundSalarySlip) {

                            salarySlip.employeeDetails = {};
                            salarySlip.isGenerated = false;

                            // Employee Details
                            var employeeDetails = await User.findById({ _id: ObjectID(foundUser[k]._id) });
                            salarySlip._id = employeeDetails._id;
                            salarySlip.employeeDetails.employeeName = await User.getDisplayName(
                                employeeDetails._id
                            );

                            // salarySlip.employeeDetails.imageUrl = employeeDetails.profile.imageUrl;
                            salarySlip.employeeDetails.accountNum = employeeDetails.employeeProfile.bankDetails.official.accountNum;

                            // Company Details
                            var companyDetails = await Company.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.companyId)
                            });
                            salarySlip.employeeDetails.companyName = companyDetails.name;

                            // Job Profile Details
                            var jobProfileDetails = await JobProfile.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.jobProfileId)
                            });

                            // Get Leave Details
                            var leaveDetails = await employeePresence(employeeDetails._id, month, year);
                            if (moment(requestDate).isSame(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'months') &&
                                moment(requestDate).isSame(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'years')) {
                                if (foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate.getDate() > 1) {
                                    leaveDetails.todayDate = leaveDetails.todayDate - (foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate.getDate());
                                }
                            }

                            salarySlip.employeeDetails.monthDays = leaveDetails.monthDays;
                            salarySlip.employeeDetails.designation = jobProfileDetails.positionName;
                            salarySlip.employeeDetails.present = leaveDetails.todayDate - (leaveDetails.unsanctionedLeave + leaveDetails.paidLeaves);

                            // Get Leave Settings
                            var updatedEmployeeDetails = await leaveSettingsDetails(employeeDetails, month, year, leaveDetails, 'List');
                            salarySlip.employeeDetails.earnedLeaves = employeeDetails.employeeProfile.payroll.earnedLeaveBalance;
                            salarySlip.employeeDetails.esic = "NA";
                            salarySlip.employeeDetails.pf = "NA";
                            salarySlip.employeeDetails.unsanctionedLeave = leaveDetails.unsanctionedLeave;


                            // Employee CTC Configure
                            const ctc = parseFloat(employeeDetails.employeeProfile.payroll.ctc);
                            salarySlip.employeeDetails.monthlyctc = (ctc / 12).toFixed(2).toString();
                            salarySlip.employeeDetails.annuallyctc = ctc.toFixed(2).toString();
                            console.log("901 Ctc Configured", ctc, salarySlip.employeeDetails.monthlyctc, salarySlip.employeeDetails.annuallyctc);
                            // Grade Rule Configure
                            var basicPay = parseFloat(employeeDetails.employeeProfile.payroll.basicPay);
                            var everyDaySalary = parseFloat(basicPay / leaveDetails.monthDays);
                            console.log("905 Grade Rule", basicPay, everyDaySalary);
                            // Calculate payDays
                            if (leaveDetails.unsanctionedLeave > 0) {
                                var updatedPaidLeaveBalance = parseFloat(updatedEmployeeDetails.paidLeaveBalance);
                                var updatedEarnedLeaveBalance = parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
                                var totalBalance = (updatedPaidLeaveBalance + updatedEarnedLeaveBalance) - leaveDetails.unsanctionedLeave;

                                if (totalBalance < 0) {
                                    salarySlip.employeeDetails.payDays = leaveDetails.todayDate + totalBalance;
                                    basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                                    // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.paidLeaveBalance": 0,"employeeProfile.payroll.earnedLeaveBalance": 0});
                                } else {
                                    var earnedLeaveBalance = updatedEarnedLeaveBalance - leaveDetails.unsanctionedLeave;
                                    if (earnedLeaveBalance < 0) {
                                        var paidLeaveBalance = updatedPaidLeaveBalance + earnedLeaveBalance;
                                        earnedLeaveBalance = 0;
                                        // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.paidLeaveBalance": paidLeaveBalance,"employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance});
                                    } else {
                                        // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance});
                                    }
                                    salarySlip.employeeDetails.payDays = leaveDetails.todayDate;
                                    basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                                }
                            } else {
                                salarySlip.employeeDetails.payDays = leaveDetails.todayDate - leaveDetails.unsanctionedLeave;
                                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                            }
                            console.log("932 Pay Days", basicPay, salarySlip.employeeDetails.payDays);
                            // Payment Heads Calculations
                            var gross = 0,
                                totalDeduction = 0;

                            var gradeRuleDetails = await GradeRule.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.payroll.gradeRule)
                            }).lean();
                            console.log("940 gradeRuleDetails", gradeRuleDetails);
                            if (gradeRuleDetails) {
                                if (gradeRuleDetails.paymentHeads.length > 0) {

                                    salarySlip.earnings = [{
                                        label: "Basic Salary",
                                        amt: basicPay.toFixed(2).toString()
                                    }];

                                    salarySlip.deductions = [];

                                    for (var i = 0; i < gradeRuleDetails.paymentHeads.length; i++) {
                                        var paymentHeadsDetails = await PaymentHeads.findById({
                                            _id: ObjectID(gradeRuleDetails.paymentHeads[i].paymentHeadId)
                                        });

                                        if (paymentHeadsDetails.type === "Addition") {
                                            if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = basicPay * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    gross += percentValue;
                                                }

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                                    var percentOfDetails;
                                                    gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                                        if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                                            percentOfDetails = gradeRule;
                                                        }
                                                    })
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    gross += percentValue;
                                                }
                                            } else {
                                                var fixedValue = (parseFloat(
                                                    gradeRuleDetails.paymentHeads[i].value
                                                ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;
                                                var gradeRuleDetail = {
                                                    label: paymentHeadsDetails.title,
                                                    amt: fixedValue.toFixed(2).toString()
                                                };
                                                gross += fixedValue;
                                            }
                                            salarySlip.earnings.push(gradeRuleDetail);
                                        } else {
                                            if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = basicPay * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    totalDeduction += percentValue;
                                                }

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                                    var percentOfDetails;
                                                    gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                                        if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                                            percentOfDetails = gradeRule;
                                                        }
                                                    })
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    totalDeduction += percentValue;
                                                }

                                            } else {
                                                var fixedValue = (parseFloat(
                                                    gradeRuleDetails.paymentHeads[i].value
                                                ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;

                                                var gradeRuleDetail = {
                                                    label: paymentHeadsDetails.title,
                                                    amt: fixedValue.toFixed(2).toString()
                                                };
                                                totalDeduction += fixedValue;
                                            }
                                            salarySlip.deductions.push(gradeRuleDetail);
                                        }
                                    }

                                    salarySlip.gross = {
                                        label: "Gross",
                                        amt: (basicPay + gross).toFixed(2).toString()
                                    };
                                    salarySlip.totalDeduction = {
                                        label: "Total Deduction",
                                        amt: totalDeduction.toFixed(2).toString()
                                    };
                                    salarySlip.netSalary = {
                                        label: "Net Salary",
                                        amt: parseFloat((basicPay + gross) - totalDeduction).toFixed(2).toString()
                                    };
                                    employeeSalarySlipDetails.push(salarySlip);
                                } else {
                                    throw new Error("Please Add Grade Rule First");
                                }
                            } else {
                                throw new Error("Please Add Grade Rule First");
                            }
                            console.log("1058 salarySlip.deductions", salarySlip.deductions);
                        } else {
                            var salarySlipDetail = await Document.findById({ _id: ObjectID(foundSalarySlip._id) }).lean();
                            salarySlip = {
                                month: month,
                                year: year,
                                _id: salarySlipDetail._id,
                                isGenerated: true,
                                year: salarySlipDetail.year,
                                month: salarySlipDetail.month,
                                companyId: salarySlipDetail.companyId,
                                employeeId: salarySlipDetail.employeeId,
                                netSalary: salarySlipDetail.netSalary,
                                totalDeduction: salarySlipDetail.totalDeduction,
                                gross: salarySlipDetail.gross,
                                deductions: salarySlipDetail.deductions,
                                earnings: salarySlipDetail.earnings,
                                employeeDetails: salarySlipDetail.employeeDetails,
                            }
                            employeeSalarySlipDetails.push(salarySlip);
                        }
                    }
                    console.log("1080 employee Salary", salarySlip);
                    return res.send({ status: 'success', message: 'Monthly List Successfully', data: employeeSalarySlipDetails })
                } else {
                    return res.send({ status: 'success', message: 'Monthly List Successfully', data: [] })
                }
            })
    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}

// Generate Current Month Salary Slip
module.exports.filterCurrentMonthSalarySlip = function(req, res) {
    try {
        const companyId = req.params.companyId;
        const month = req.params.month;
        const year = sanitize(req.params.year);

        let requestDate = new Date(`${year}-${month}-01`);

        var employeeSalarySlipDetails = [];

        return User.find({
                "employeeProfile.companyId": companyId,
                "employeeProfile.payroll.mode": req.params.modeType,
                'employeeProfile.payroll.ctcEffectiveFromDate': { $exists: true },
                'employeeProfile.payroll.ctcEffectiveToDate': { $exists: true },
                'isActive': true,
            })
            .then(async(foundUser) => {
                if (foundUser.length > 0) {
                    for (var k = 0; k < foundUser.length; k++) {
                        var salarySlip = {};

                        salarySlip.month = month;
                        salarySlip.year = year;

                        if (!moment(requestDate).isSameOrAfter(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'months') &&
                            moment(requestDate).isSameOrAfter(foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate, 'years')) continue;

                        var foundSalarySlip = await Document.findOne({ 'employeeId': ObjectID(foundUser[k]._id), 'month': req.params.month, 'year': req.params.year });
                        if (!foundSalarySlip) {
                            salarySlip.employeeDetails = {};
                            salarySlip.isGenerated = false;

                            // Employee Details
                            var employeeDetails = await User.findById({ _id: ObjectID(foundUser[k]._id) });
                            salarySlip._id = employeeDetails._id;
                            salarySlip.employeeDetails.employeeName = await User.getDisplayName(
                                employeeDetails._id
                            );

                            // salarySlip.employeeDetails.imageUrl = employeeDetails.profile.imageUrl;
                            salarySlip.employeeDetails.accountNum = employeeDetails.employeeProfile.bankDetails.official.accountNum;

                            // Company Details
                            var companyDetails = await Company.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.companyId)
                            });
                            salarySlip.employeeDetails.companyName = companyDetails.name;

                            // Job Profile Details
                            var jobProfileDetails = await JobProfile.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.jobProfileId)
                            });

                            // Get Leave Details
                            var leaveDetails = await employeePresence(employeeDetails._id, month, year);

                            if (moment(requestDate).isSame(employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate, 'months') &&
                                moment(requestDate).isSame(employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate, 'years')) {
                                if (employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate.getDate() > 1) {
                                    leaveDetails.todayDate = leaveDetails.todayDate - (foundUser[k].employeeProfile.payroll.ctcEffectiveFromDate.getDate());
                                }
                            }

                            salarySlip.employeeDetails.monthDays = leaveDetails.monthDays;
                            salarySlip.employeeDetails.designation = jobProfileDetails.positionName;
                            salarySlip.employeeDetails.present = leaveDetails.todayDate - (leaveDetails.unsanctionedLeave + leaveDetails.paidLeaves);

                            // Get Leave Settings
                            var updatedEmployeeDetails = await leaveSettingsDetails(employeeDetails, month, year, leaveDetails, 'List');
                            salarySlip.employeeDetails.earnedLeaves = employeeDetails.employeeProfile.payroll.earnedLeaveBalance;
                            salarySlip.employeeDetails.esic = "NA";
                            salarySlip.employeeDetails.pf = "NA";
                            salarySlip.employeeDetails.unsanctionedLeave = leaveDetails.unsanctionedLeave;


                            // Employee CTC Configure
                            const ctc = parseFloat(employeeDetails.employeeProfile.payroll.ctc);
                            salarySlip.employeeDetails.monthlyctc = (ctc / 12).toFixed(2).toString();
                            salarySlip.employeeDetails.annuallyctc = ctc.toFixed(2).toString();

                            // Grade Rule Configure
                            var basicPay = parseFloat(employeeDetails.employeeProfile.payroll.basicPay);
                            var everyDaySalary = parseFloat(basicPay / leaveDetails.monthDays);

                            // Calculate payDays
                            if (leaveDetails.unsanctionedLeave > 0) {
                                var updatedPaidLeaveBalance = parseFloat(updatedEmployeeDetails.paidLeaveBalance);
                                var updatedEarnedLeaveBalance = parseFloat(employeeDetails.employeeProfile.payroll.earnedLeaveBalance);
                                var totalBalance = (updatedPaidLeaveBalance + updatedEarnedLeaveBalance) - leaveDetails.unsanctionedLeave;

                                if (totalBalance < 0) {
                                    salarySlip.employeeDetails.payDays = leaveDetails.todayDate + totalBalance;
                                    basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                                    // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.paidLeaveBalance": 0,"employeeProfile.payroll.earnedLeaveBalance": 0});
                                } else {
                                    var earnedLeaveBalance = updatedEarnedLeaveBalance - leaveDetails.unsanctionedLeave;
                                    if (earnedLeaveBalance < 0) {
                                        var paidLeaveBalance = updatedPaidLeaveBalance + earnedLeaveBalance;
                                        earnedLeaveBalance = 0;
                                        // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.paidLeaveBalance": paidLeaveBalance,"employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance});
                                    } else {
                                        // await User.findOneAndUpdate({_id: ObjectID(employeeId)},{"employeeProfile.payroll.earnedLeaveBalance": earnedLeaveBalance});
                                    }
                                    salarySlip.employeeDetails.payDays = leaveDetails.todayDate;
                                    basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                                }
                            } else {
                                salarySlip.employeeDetails.payDays = leaveDetails.todayDate - leaveDetails.unsanctionedLeave;
                                basicPay = everyDaySalary * salarySlip.employeeDetails.payDays;
                            }

                            // Payment Heads Calculations
                            var gross = 0,
                                totalDeduction = 0;

                            var gradeRuleDetails = await GradeRule.findById({
                                _id: ObjectID(employeeDetails.employeeProfile.payroll.gradeRule)
                            });

                            if (gradeRuleDetails) {
                                if (gradeRuleDetails.paymentHeads.length > 0) {

                                    salarySlip.earnings = [{
                                        label: "Basic Salary",
                                        amt: basicPay.toFixed(2).toString()
                                    }];

                                    salarySlip.deductions = [];

                                    for (var i = 0; i < gradeRuleDetails.paymentHeads.length; i++) {
                                        var paymentHeadsDetails = await PaymentHeads.findById({
                                            _id: ObjectID(gradeRuleDetails.paymentHeads[i].paymentHeadId)
                                        });

                                        if (paymentHeadsDetails.type === "Addition") {
                                            if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = basicPay * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    gross += percentValue;
                                                }

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                                    var percentOfDetails;
                                                    gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                                        if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                                            percentOfDetails = gradeRule;
                                                        }
                                                    })
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    gross += percentValue;
                                                }
                                            } else {
                                                var fixedValue = (parseFloat(
                                                    gradeRuleDetails.paymentHeads[i].value
                                                ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;
                                                var gradeRuleDetail = {
                                                    label: paymentHeadsDetails.title,
                                                    amt: fixedValue.toFixed(2).toString()
                                                };
                                                gross += fixedValue;
                                            }
                                            salarySlip.earnings.push(gradeRuleDetail);
                                        } else {
                                            if (gradeRuleDetails.paymentHeads[i].type === "Percent") {

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = basicPay * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    totalDeduction += percentValue;
                                                }

                                                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                                                    var percentOfDetails;
                                                    gradeRuleDetails.paymentHeads.find((gradeRule) => {
                                                        if ((gradeRule._id).toString() == (gradeRuleDetails.paymentHeads[i].fixedPercentOfId).toString()) {
                                                            percentOfDetails = gradeRule;
                                                        }
                                                    })
                                                    var percent = parseFloat(gradeRuleDetails.paymentHeads[i].value);
                                                    var percentValue = parseFloat(percentOfDetails.value) * (percent / 100);
                                                    var gradeRuleDetail = {
                                                        label: paymentHeadsDetails.title,
                                                        amt: percentValue.toFixed(2).toString()
                                                    };
                                                    totalDeduction += percentValue;
                                                }

                                            } else {
                                                var fixedValue = (parseFloat(
                                                    gradeRuleDetails.paymentHeads[i].value
                                                ) / salarySlip.employeeDetails.monthDays) * salarySlip.employeeDetails.payDays;

                                                var gradeRuleDetail = {
                                                    label: paymentHeadsDetails.title,
                                                    amt: fixedValue.toFixed(2).toString()
                                                };
                                                totalDeduction += fixedValue;
                                            }
                                            salarySlip.deductions.push(gradeRuleDetail);
                                        }
                                    }

                                    salarySlip.gross = {
                                        label: "Gross",
                                        amt: (basicPay + gross).toFixed(2).toString()
                                    };
                                    salarySlip.totalDeduction = {
                                        label: "Total Deduction",
                                        amt: totalDeduction.toFixed(2).toString()
                                    };
                                    salarySlip.netSalary = {
                                        label: "Net Salary",
                                        amt: parseFloat((basicPay + gross) - totalDeduction).toFixed(2).toString()
                                    };
                                    employeeSalarySlipDetails.push(salarySlip);
                                } else {
                                    throw new Error("Please Add Grade Rule First");
                                }
                            } else {
                                throw new Error("Please Add Grade Rule First");
                            }
                        } else {
                            // No Worries
                        }
                    }
                    return res.send({ status: 'success', message: 'Filter List Successfully', data: employeeSalarySlipDetails })
                } else {
                    return res.send({ status: 'success', message: 'Filter List Successfully', data: [] })
                }
            })
    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}

// module.exports.excelSheetData = async function excelSheetData(req,res) {
//   try {

//     if(!req.params.month || !req.params.year || !req.params.companyId) {
//       return res.send({status: 'error', message: 'Missing Required Values'});
//     }

//     let month = req.params.month.trim();
//     let year = req.params.year.trim();
//     let workingDays = moment(`${year}-${month}`,'YYYY-MM').daysInMonth();
//     let companySheetDetails = await Document.find({"year": year, 'month': month, companyId: ObjectID(req.params.companyId), gradeRule: ObjectID(req.params.gradeRuleId)});
//     let employeeAndCompSheetDetails = {
//       companyExpen: {},
//       gradeRuleInfo: await gradeRuleDetails(req.params.gradeRuleId),
//       employeeSheetDetails: [],
//       footerTotal: {},
//       year: req.params.year.trim(),
//       month: commonFunction.changeNumberMonth(req.params.month.trim())
//     };

//     let companyDetails = await Company.findById({_id: ObjectID(req.params.companyId)});

//     let compnayExpenditure = {
//       name: companyDetails.name,
//       cash: 0,
//       cheque: 0,
//       bankTransfer: 0
//     }

//     let everyHeaderTotal = {};

//     for(let sheet of companySheetDetails) {
//       let employeeDetails = await User.findById({"_id": ObjectID(sheet.employeeId)});
//       let employeeSheetDetails = {
//         name: sheet.employeeDetails.employeeName,
//         doj: employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate,
//         eoj: employeeDetails.employeeProfile.payroll.ctcEffectiveToDate,
//         inHand: sheet.netSalary.amt,
//         bonus: '0',
//         incentives: '0',
//         gross: sheet.gross.amt,
//         presentDays: sheet.employeeDetails.present,
//         adjustLeave: sheet.employeeDetails.adjustLeave,
//         absentDays: sheet.employeeDetails.unsanctionedLeave,
//         workingDays: workingDays,
//         everyDaySalary: (parseFloat(sheet.employeeDetails.everyDaySalary).toFixed(0)).toString(),
//         netSalary: sheet.netSalary.amt,
//         deductions: sheet.deductions,
//         earnings: sheet.earnings,
//         payMode: employeeDetails.employeeProfile.payroll.mode,
//         totalEarnings: 0,
//         totalDeductions: 0
//       }

//       if(employeeDetails.employeeProfile.payroll.mode === 'Cash') {
//         compnayExpenditure.cash += (parseFloat(sheet.netSalary.amt));
//       }

//       if(employeeDetails.employeeProfile.payroll.mode === 'Cheque') {
//         compnayExpenditure.cheque += parseFloat(sheet.netSalary.amt);
//       }

//       if(employeeDetails.employeeProfile.payroll.mode === 'Tansfer to Bank Account') {
//         compnayExpenditure.bankTransfer += parseFloat(sheet.netSalary.amt);
//       }

//       // Total Footer Deductions
//       for(let deduct of sheet.deductions) {
//         !everyHeaderTotal[deduct.label] ? everyHeaderTotal[deduct.label] = 0 : '';
//         !everyHeaderTotal['totalDeduction'] ? everyHeaderTotal['totalDeduction'] = 0 : '';
//         everyHeaderTotal[deduct.label] += parseFloat(deduct.amt);
//         everyHeaderTotal['totalDeduction'] += parseFloat(deduct.amt);
//         employeeSheetDetails.totalDeductions += parseFloat(deduct.amt);
//       }

//       // Total Footer Earnings
//       for(let earn of sheet.earnings) {
//         !everyHeaderTotal[earn.label] ? everyHeaderTotal[earn.label] = 0 : '';
//         !everyHeaderTotal['totalEarnings'] ? everyHeaderTotal['totalEarnings'] = 0 : '';
//         everyHeaderTotal[earn.label] += parseFloat(earn.amt);
//         everyHeaderTotal['totalEarnings'] += parseFloat(earn.amt);
//         employeeSheetDetails.totalEarnings += parseFloat(earn.amt);
//       }

//       !everyHeaderTotal['totalGross'] ? everyHeaderTotal['totalGross'] = 0 : '';
//       !everyHeaderTotal['totalInHand'] ? everyHeaderTotal['totalInHand'] = 0 : '';
//       !everyHeaderTotal['totalPerDaySalary'] ? everyHeaderTotal['totalPerDaySalary'] = 0 : '';
//       !everyHeaderTotal['totalNetSalary'] ? everyHeaderTotal['totalNetSalary'] = 0 : '';

//       everyHeaderTotal['totalGross'] += parseFloat(sheet.gross.amt);
//       everyHeaderTotal['totalInHand'] += parseFloat(sheet.netSalary.amt);
//       everyHeaderTotal['totalPerDaySalary'] += parseFloat(sheet.employeeDetails.everyDaySalary);
//       everyHeaderTotal['totalNetSalary'] += parseFloat(sheet.netSalary.amt);

//       employeeSheetDetails.totalEarnings = employeeSheetDetails.totalEarnings.toFixed(0).toString();
//       employeeSheetDetails.totalDeductions = employeeSheetDetails.totalDeductions.toFixed(0).toString();

//       employeeSheetDetails.deductions.push({
//         amt: employeeSheetDetails.totalDeductions,
//         label: 'Total Deductions'
//       });

//       employeeSheetDetails.earnings.push({
//         amt: employeeSheetDetails.totalEarnings,
//         label: 'Total Earnings'
//       });

//       employeeAndCompSheetDetails.employeeSheetDetails.push(employeeSheetDetails);
//     }
//     employeeAndCompSheetDetails.companyExpen = compnayExpenditure;
//     employeeAndCompSheetDetails.footerTotal = everyHeaderTotal;

//     for(let footer in employeeAndCompSheetDetails.footerTotal) {
//       employeeAndCompSheetDetails.footerTotal[footer] = employeeAndCompSheetDetails.footerTotal[footer].toFixed(0).toString();
//     }

//     employeeAndCompSheetDetails.gradeRuleInfo.deductionInfo.push({
//       name: 'Total Deductions',
//       value: '',
//       type: '',
//       dependsOn: ''
//     });

//     employeeAndCompSheetDetails.gradeRuleInfo.earningsInfo.push({
//       name: 'Total Earnings',
//       value: '',
//       type: '',
//       dependsOn: ''
//     });

//     return res.send({status: 'success' ,message: 'Excel Sheet Details Successfully', data: employeeAndCompSheetDetails})

//   } catch (error) {
//     return res.send({status: 'error', message: error.message});
//   }
// }

async function gradeRuleDetails(gradeRuleId) {
    let gradeRuleDetails = await GradeRule.findById({ _id: ObjectID(gradeRuleId) });

    let returnGradeRuleDetails = {
        gradeRuleName: gradeRuleDetails.title,
        deductionInfo: [],
        earningsInfo: []
    }

    for (let grade of gradeRuleDetails.paymentHeads) {
        let paymentHeadDetails = await PaymentHeads.findById({ _id: ObjectID(grade.paymentHeadId) })

        let gradeRuleDetail = {
            name: paymentHeadDetails.title,
            value: grade.value,
            type: grade.type
        }

        if (grade.type === 'Percent') {

            if (grade.fixedPercentOfName) {
                gradeRuleDetail.dependsOn = 'Basic Salary';
            }

            if (grade.fixedPercentOfId) {

                let indexGradePayment = gradeRuleDetails.paymentHeads.map((paymentHeads) => {
                    return (paymentHeads._id).toString();
                }).indexOf((grade.fixedPercentOfId).toString());

                let indiPaymentHeadDetails = await PaymentHeads.findById({ _id: ObjectID(gradeRuleDetails.paymentHeads[indexGradePayment].paymentHeadId) })
                gradeRuleDetail.dependsOn = indiPaymentHeadDetails.title;
            }

        } else {
            gradeRuleDetail.dependsOn = 'Basic Salary';
        }

        if (paymentHeadDetails.type === 'Addition') {
            returnGradeRuleDetails.earningsInfo.push(gradeRuleDetail)
        } else {
            returnGradeRuleDetails.deductionInfo.push(gradeRuleDetail)
        }

    }

    return returnGradeRuleDetails;
}

// Return Bank Statement
async function bankStatement(month, year, companyId) {
    try {

        var bankStatementDetails = {
            totalAmoutPaid: 0,
            month: '',
            year: ''
        };

        bankStatementDetails.currentDate = commonFunction.dateFormat(new Date());
        bankStatementDetails.bankStatement = [];
        var salarySlipDetails = await Document.find({ "companyId": ObjectID(companyId), "month": month, "year": year });

        if (salarySlipDetails.length > 0) {

            bankStatementDetails.month = commonFunction.changeNumberMonth(salarySlipDetails[0].month);
            bankStatementDetails.year = salarySlipDetails[0].year;

            bankStatementDetails.subject = `Sub: Salary Transfer for the Month of ${commonFunction.changeNumberMonth(salarySlipDetails[0].month)} ${salarySlipDetails[0].year}`;
            bankStatementDetails.headerDetails = [
                "Sr.No.", "Name", "Account Number", "Amount", `Salary for the month of ${commonFunction.changeNumberMonth(salarySlipDetails[0].month)} ${salarySlipDetails[0].year}`
            ];

            for (var i = 0; i < salarySlipDetails.length; i++) {
                let employeeBankDetails = await User.findById({ _id: ObjectID(salarySlipDetails[i].employeeId) });

                if (employeeBankDetails.employeeProfile.bankDetails &&
                    employeeBankDetails.employeeProfile.bankDetails.official &&
                    employeeBankDetails.employeeProfile.bankDetails.official.accountNum &&
                    employeeBankDetails.employeeProfile.payroll.mode === 'Tansfer to Bank Account') {

                    var bankStatementDetail = {

                        name: (await User.getDisplayName(salarySlipDetails[i].employeeId)).trim(),
                        accountNum: employeeBankDetails.employeeProfile.bankDetails.official.accountNum,
                        amount: salarySlipDetails[i].netSalary.amt,
                        salaryMonthYear: `${commonFunction.changeNumberMonth(salarySlipDetails[i].month)} ${salarySlipDetails[i].year}`

                    }

                    bankStatementDetails.totalAmoutPaid += parseFloat(salarySlipDetails[i].netSalary.amt);

                } else {
                    continue;
                }
                bankStatementDetails.bankStatement.push(bankStatementDetail);
            }
            bankStatementDetails.totalAmoutPaid = bankStatementDetails.totalAmoutPaid.toFixed(0).toString();
            bankStatementDetails.totalAmoutPaidWords = numberConverter.toWords(bankStatementDetails.totalAmoutPaid);
        } else {
            bankStatementDetails.headerDetails = [];
        }

        return bankStatementDetails;

    } catch (error) {
        throw new Error(error.message)
    }
}

// Return Salary Statement
async function cashStatement(month, year, companyId) {
    try {
        var salaryStatementDetails = {
            totalCashAmtPaid: 0,
            month: '',
            year: ''
        };

        let companyDetails = await Company.findById({ _id: ObjectID(companyId) })
        salaryStatementDetails.currentDate = commonFunction.dateFormat(new Date());
        salaryStatementDetails.bankStatement = [];

        var salarySlipDetails = await Document.find({ "companyId": ObjectID(companyId), "month": month, "year": year });

        if (salarySlipDetails.length > 0) {

            salaryStatementDetails.month = commonFunction.changeNumberMonth(salarySlipDetails[0].month);
            salaryStatementDetails.year = salarySlipDetails[0].year;
            salaryStatementDetails.companyName = companyDetails.name;

            salaryStatementDetails.headerDetails = [
                "Sr.No.", "Employee Name", "Cash Amt. (₹)", "Cash Collect Date", "Signature"
            ];

            for (let salarySlip of salarySlipDetails) {
                let employeeDetails = await User.findById({ _id: ObjectID(salarySlip.employeeId) });

                if (employeeDetails.employeeProfile.payroll.mode === 'Cash') { // Employee With Cash Salary

                    let salaryStatement = {
                        name: await User.getDisplayName(employeeDetails._id),
                        cashAmt: salarySlip.netSalary.amt,
                        salaryType: 'cash'
                    }

                    salaryStatementDetails.totalCashAmtPaid += parseFloat(salarySlip.netSalary.amt);
                    salaryStatementDetails.bankStatement.push(salaryStatement);

                }
            }

            salaryStatementDetails.totalCashAmtPaid = salaryStatementDetails.totalCashAmtPaid.toFixed(0).toString();
        }

        return salaryStatementDetails;

    } catch (error) {
        throw new Error(error.message)
    }
}

// Return Salary Statement
async function chequeStatement(month, year, companyId) {
    try {
        var salaryStatementDetails = {
            totalChequeAmtPaid: 0,
            month: '',
            year: ''
        };

        let companyDetails = await Company.findById({ _id: ObjectID(companyId) })
        salaryStatementDetails.currentDate = commonFunction.dateFormat(new Date());
        salaryStatementDetails.bankStatement = [];

        var salarySlipDetails = await Document.find({ "companyId": ObjectID(companyId), "month": month, "year": year });

        if (salarySlipDetails.length > 0) {

            salaryStatementDetails.month = commonFunction.changeNumberMonth(salarySlipDetails[0].month);
            salaryStatementDetails.year = salarySlipDetails[0].year;
            salaryStatementDetails.companyName = companyDetails.name;

            salaryStatementDetails.headerDetails = [
                "Sr.No.", "Employee Name", "Cheque  Amt. (₹)", `Cheque No.`, "Cheque Collect Date", "Signature"
            ];

            for (let salarySlip of salarySlipDetails) {

                let employeeDetails = await User.findById({ _id: ObjectID(salarySlip.employeeId) });

                if (employeeDetails.employeeProfile.payroll.mode === 'Cheque') { // // Employee With Cheque Salary
                    let salaryStatement = {
                        name: await User.getDisplayName(employeeDetails._id),
                        chequeAmt: salarySlip.netSalary.amt,
                        chequeNum: Object.keys(salarySlip.chequeDetails).length === 0 ? salarySlip.chequeDetails.number : 'N/A',
                        salaryType: 'cheque'
                    }

                    salaryStatementDetails.totalChequeAmtPaid += parseFloat(salarySlip.netSalary.amt);
                    salaryStatementDetails.bankStatement.push(salaryStatement);

                }
            }

            salaryStatementDetails.totalChequeAmtPaid = salaryStatementDetails.totalChequeAmtPaid.toFixed(0).toString();
        }

        return salaryStatementDetails;

    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports.updateChequeDetails = async function updateChequeDetails(req, res) {
    try {
        if (!req.body.checkNum || !req.params.salaryId) return res.send({ status: 'error', message: 'Missing Required Fields' });

        await Document.findByIdAndUpdate({ _id: ObjectID(req.params.salaryId) }, {
            'chequeDetails.number': req.body.checkNum,
            'chequeDetails.issueDate': new Date(),
        });

        return res.send({ status: 'success', message: 'Cheque Number Added Successfully' });
    } catch (error) {
        return res.send({ status: 'error', message: error.message })
    }
}

module.exports.getChequeDetails = async function getChequeDetails(req, res) {
    try {

        if (!req.params.salaryId) return res.send({ status: 'error', message: 'Missing Required Fields' });

        let salaryDetails = await Document.findById({ _id: ObjectID(req.params.salaryId) }),
            returnSalaryDetails = {};

        if (salaryDetails) {
            returnSalaryDetails._id = salaryDetails._id;
            returnSalaryDetails.chequeNum = salaryDetails.chequeDetails ? salaryDetails.chequeDetails.number : '';
        }

        return res.send({ status: 'success', data: returnSalaryDetails });

    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}

module.exports.excelSheetData = async function excelSheetData(req, res) {
    try {

        if (!req.params.startDate || !req.params.endDate || !req.params.companyId || !req.params.gradeRuleId) {
            return res.send({ status: 'error', message: 'Missing Required Values' });
        }

        let monthDiff = moment(req.params.endDate.trim()).diff(req.params.startDate.trim(), 'months'),
            returnMonthDetails = [],
            sortingValue = [];

        for (let i = 0; i <= monthDiff; i++) {
            let individualMonthDetails = await companyExcelSheet(moment(req.params.startDate.trim()).add(i, 'months'), req.params.companyId, req.params.gradeRuleId);
            if (individualMonthDetails.employeeSheetDetails.length > 0) {
                returnMonthDetails.push(individualMonthDetails);

                let sortingObject = { // Sorting Mechanism
                    sortingMonthValue: individualMonthDetails.sortingMonthValue,
                    showYear: individualMonthDetails.showYear,
                    showMonthName: individualMonthDetails.showMonthName,
                    sortingId: individualMonthDetails.sheetId
                }
                sortingValue.push(sortingObject);

            } else { continue; }
        }

        return res.send({ status: 'success', message: 'Company Excel Sheet Details Successfully', data: returnMonthDetails, sortingCriteria: sortingValue })

    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}

// Company Excel Sheet
async function companyExcelSheet(date, companyId, gradeRuleId) {
    try {

        let month = `${moment(date).get('months') + 1}`.padStart(2, '0');
        let year = `${moment(date).get('years')}`;
        let workingDays = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
        let companySheetDetails = await Document.find({ "year": year, 'month': month, companyId: ObjectID(companyId), gradeRule: ObjectID(gradeRuleId) });
        let employeeAndCompSheetDetails = {
            companyExpen: {},
            gradeRuleInfo: await gradeRuleDetails(gradeRuleId),
            employeeSheetDetails: [],
            footerTotal: {},
            year: year,
            month: commonFunction.changeNumberMonth(month),
            sortingMonthValue: parseInt(month),
            showYear: year,
            showMonthName: commonFunction.changeNumberMonth(month),
            sheetId: `${Date.now()}`
        };

        let companyDetails = await Company.findById({ _id: ObjectID(companyId) });

        let compnayExpenditure = {
            name: companyDetails.name,
            cash: 0,
            cheque: 0,
            bankTransfer: 0
        }

        let everyHeaderTotal = {};

        for (let sheet of companySheetDetails) {
            let employeeDetails = await User.findById({ "_id": ObjectID(sheet.employeeId) });
            let employeeSheetDetails = {
                name: sheet.employeeDetails.employeeName,
                doj: employeeDetails.employeeProfile.payroll.ctcEffectiveFromDate,
                eoj: employeeDetails.employeeProfile.payroll.ctcEffectiveToDate,
                inHand: sheet.netSalary.amt,
                bonus: '0',
                incentives: '0',
                gross: sheet.gross.amt,
                presentDays: sheet.employeeDetails.present,
                adjustLeave: sheet.employeeDetails.adjustLeave,
                absentDays: sheet.employeeDetails.unsanctionedLeave,
                workingDays: workingDays,
                everyDaySalary: (parseFloat(sheet.employeeDetails.everyDaySalary).toFixed(0)).toString(),
                netSalary: sheet.netSalary.amt,
                deductions: sheet.deductions,
                earnings: sheet.earnings,
                payMode: employeeDetails.employeeProfile.payroll.mode === 'Tansfer to Bank Account' ?
                    'Transfer to Bank Account' : employeeDetails.employeeProfile.payroll.mode,
                totalEarnings: 0,
                totalDeductions: 0
            }

            if (employeeDetails.employeeProfile.payroll.mode === 'Cash') {
                compnayExpenditure.cash += (parseFloat(sheet.netSalary.amt));
            }

            if (employeeDetails.employeeProfile.payroll.mode === 'Cheque') {
                compnayExpenditure.cheque += parseFloat(sheet.netSalary.amt);
            }

            if (employeeDetails.employeeProfile.payroll.mode === 'Tansfer to Bank Account') {
                compnayExpenditure.bankTransfer += parseFloat(sheet.netSalary.amt);
            }

            // Total Footer Deductions
            for (let deduct of sheet.deductions) {
                !everyHeaderTotal[deduct.label] ? everyHeaderTotal[deduct.label] = 0 : '';
                !everyHeaderTotal['totalDeduction'] ? everyHeaderTotal['totalDeduction'] = 0 : '';
                everyHeaderTotal[deduct.label] += parseFloat(deduct.amt);
                everyHeaderTotal['totalDeduction'] += parseFloat(deduct.amt);
                employeeSheetDetails.totalDeductions += parseFloat(deduct.amt);
            }

            // Total Footer Earnings
            for (let earn of sheet.earnings) {
                !everyHeaderTotal[earn.label] ? everyHeaderTotal[earn.label] = 0 : '';
                !everyHeaderTotal['totalEarnings'] ? everyHeaderTotal['totalEarnings'] = 0 : '';
                everyHeaderTotal[earn.label] += parseFloat(earn.amt);
                everyHeaderTotal['totalEarnings'] += parseFloat(earn.amt);
                employeeSheetDetails.totalEarnings += parseFloat(earn.amt);
            }

            !everyHeaderTotal['totalGross'] ? everyHeaderTotal['totalGross'] = 0 : '';
            !everyHeaderTotal['totalInHand'] ? everyHeaderTotal['totalInHand'] = 0 : '';
            !everyHeaderTotal['totalPerDaySalary'] ? everyHeaderTotal['totalPerDaySalary'] = 0 : '';
            !everyHeaderTotal['totalNetSalary'] ? everyHeaderTotal['totalNetSalary'] = 0 : '';

            everyHeaderTotal['totalGross'] += parseFloat(sheet.gross.amt);
            everyHeaderTotal['totalInHand'] += parseFloat(sheet.netSalary.amt);
            everyHeaderTotal['totalPerDaySalary'] += parseFloat(sheet.employeeDetails.everyDaySalary);
            everyHeaderTotal['totalNetSalary'] += parseFloat(sheet.netSalary.amt);

            employeeSheetDetails.totalEarnings = employeeSheetDetails.totalEarnings.toFixed(0).toString();
            employeeSheetDetails.totalDeductions = employeeSheetDetails.totalDeductions.toFixed(0).toString();

            employeeSheetDetails.deductions.push({
                amt: employeeSheetDetails.totalDeductions,
                label: 'Total Deductions'
            });

            employeeSheetDetails.earnings.push({
                amt: employeeSheetDetails.totalEarnings,
                label: 'Total Earnings'
            });

            employeeAndCompSheetDetails.employeeSheetDetails.push(employeeSheetDetails);
        }
        employeeAndCompSheetDetails.companyExpen = compnayExpenditure;
        employeeAndCompSheetDetails.footerTotal = everyHeaderTotal;

        for (let footer in employeeAndCompSheetDetails.footerTotal) {
            employeeAndCompSheetDetails.footerTotal[footer] = employeeAndCompSheetDetails.footerTotal[footer].toFixed(0).toString();
        }

        employeeAndCompSheetDetails.gradeRuleInfo.deductionInfo.push({
            name: 'Total Deductions',
            value: '',
            type: '',
            dependsOn: ''
        });

        employeeAndCompSheetDetails.gradeRuleInfo.earningsInfo.push({
            name: 'Total Earnings',
            value: '',
            type: '',
            dependsOn: ''
        });

        return employeeAndCompSheetDetails

    } catch (error) {
        throw new Error(error.message);
    }
}