const GradeRule = require('../models/grade-rule');
const MetaData = require('../models/meta-data');
const ObjectID = require('mongodb').ObjectID;
const Company = require('../models/company');
const PaymentHead = require('../models/payment-head');
const User = require('../models/user');

// Add Grade Rule
module.exports.addGradeRule = async function(req, res) {
    try {
        if (!req.body.title) {
            return res.send({ status: 'error', message: 'Grade Rule Title Must Given' });
        }
        var gradeRuleData = {
            companyId: req.params.companyId,
            title: req.body.title
        }
        var newGradeRule = await GradeRule.addGradeRule(gradeRuleData);
        if (newGradeRule) {
            var returnGradeRule = {
                _id: newGradeRule.gradeRule._id,
                title: newGradeRule.gradeRule.title
            }
            if (req.body.paymentHead) {
                var updateData = {
                    paymentHeadId: req.body.paymentHead.paymentHeadId,
                    type: req.body.paymentHead.type,
                    value: req.body.paymentHead.value,
                    metaData: new MetaData(),
                    trno: MetaData.getCurrentTrno()
                }

                if (req.body.paymentHead.fixedPercentOfName.length > 0) {
                    updateData.fixedPercentOfName = req.body.paymentHead.fixedPercentOfName;
                }

                if (req.body.paymentHead.fixedPercentOfId.length > 0) {
                    updateData.fixedPercentOfId = req.body.paymentHead.fixedPercentOfId;
                }

                updateData.metaData.createdBy = req.params.companyId;
                updateData.metaData.createdAt = MetaData.dateInfo();

                return GradeRule.findOneAndUpdate({ _id: ObjectID(newGradeRule.gradeRule._id) }, { $push: { "paymentHeads": updateData } }, { new: true }).then((updatedGradeRules) => {
                    return res.send({ status: 'success', message: 'Grade Rule Added With Payment Head Successfully', data: updatedGradeRules });
                })
            } else {
                return res.send({ status: 'success', message: 'Grade Rule Added Successfully', data: returnGradeRule });
            }

        } else {
            return res.send({ status: 'error', message: 'Unable To Add Grade Rule' });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Add Grade Rule Payment Head
module.exports.addGradeRulePaymentHead = async function(req, res) {
    try {
        if (req.body.paymentHead) {
            var updateData = {
                paymentHeadId: req.body.paymentHead.paymentHeadId,
                type: req.body.paymentHead.type,
                value: req.body.paymentHead.value,
                metaData: new MetaData(),
                trno: MetaData.getCurrentTrno()
            }

            if (req.body.paymentHead.fixedPercentOfName) {
                updateData.fixedPercentOfName = req.body.paymentHead.fixedPercentOfName;
            }

            if (req.body.paymentHead.fixedPercentOfId) {
                updateData.fixedPercentOfId = req.body.paymentHead.fixedPercentOfId;
            }

            updateData.metaData.createdBy = req.params.companyId;
            updateData.metaData.createdAt = MetaData.dateInfo();

            // Check If The Payment Head is Already Added
            var paymentHeadDetails = await GradeRule.findById({ _id: ObjectID(req.params.gradeRuleId) });
            if (paymentHeadDetails.paymentHeads.length > 0) {
                paymentHeadDetails.paymentHeads.forEach((items) => {
                    if (req.body.paymentHead.paymentHeadId == items.paymentHeadId) {
                        throw new Error('Grade Rule With Payment Head Already Added');
                    } else {
                        return;
                    }
                })
                return GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId) }, { $push: { "paymentHeads": updateData } }, { new: true }).then((updatedGradeRules) => {
                    return res.send({ status: 'success', message: 'Grade Rule Added With Payment Head Successfully', data: updatedGradeRules });
                })
            } else {
                return GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId) }, { $push: { "paymentHeads": updateData } }, { new: true }).then((updatedGradeRules) => {
                    return res.send({ status: 'success', message: 'Grade Rule Added With Payment Head Successfully', data: updatedGradeRules });
                })
            }

        } else {
            throw new Error("There Is Nothing To Update");
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// List Grade Rules
module.exports.listGradeRules = async function(req, res) {
    try {
        returnGradeRule = {}
        var gradeRuleDetails = await GradeRule.findById({ _id: ObjectID(req.params.gradeRuleId) });
        returnGradeRule.title = gradeRuleDetails.title;
        returnGradeRule.companyId = gradeRuleDetails.companyId;
        var companyDetails = await Company.findById({ _id: ObjectID(gradeRuleDetails.companyId) });
        returnGradeRule.companyName = companyDetails.name;
        if (gradeRuleDetails.paymentHeads.length > 0) {
            returnGradeRule.paymentHeads = [];
            for (var i = 0; i < gradeRuleDetails.paymentHeads.length; i++) {
                var paymentHeadDetails = await PaymentHead.findById({ _id: ObjectID(gradeRuleDetails.paymentHeads[i].paymentHeadId) });
                var paymentHead = {
                    _id: gradeRuleDetails.paymentHeads[i]._id,
                    paymentHeadId: gradeRuleDetails.paymentHeads[i].paymentHeadId,
                    paymentHeadName: paymentHeadDetails.title,
                    type: gradeRuleDetails.paymentHeads[i].type,
                    value: gradeRuleDetails.paymentHeads[i].value,
                    metaData: gradeRuleDetails.paymentHeads[i].metaData,
                }

                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfId) {
                    paymentHead['percentOfValue'] = gradeRuleDetails.paymentHeads[i].fixedPercentOfId;
                }
                if (gradeRuleDetails.paymentHeads[i].fixedPercentOfName) {
                    paymentHead['percentOfValue'] = gradeRuleDetails.paymentHeads[i].fixedPercentOfName
                }

                returnGradeRule.paymentHeads.push(paymentHead);
            }
        } else {
            returnGradeRule.paymentHeads = [];
        }
        return res.send({ status: 'success', message: 'Grade Rule List Successfull', data: returnGradeRule });
    } catch (err) {
        console.log(err.message);
        return res.send({ status: 'error', message: err.message });
    }
}

// Update Grade Rules
module.exports.updateGradeRule = async function(req, res) {
    try {
        var foundGradeRule = await GradeRule.findOne({ "companyId": ObjectID(req.params.companyId), 'title': req.body.title });
        if (foundGradeRule) {
            if (foundGradeRule._id == req.params.gradeRuleId) {
                var updatedGradeRule = await GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId) }, { "companyId": req.params.companyId, "title": req.body.title }, { new: true });
                return res.send({ status: 'success', message: "Grade Rule Updated Successfully", data: updatedGradeRule.title });
            } else {
                return res.send({ status: 'error', message: `Grade Rule Title ${req.body.title} Already Taken` });
            }
        } else {
            var updatedGradeRule = await GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId) }, { "companyId": req.params.companyId, "title": req.body.title }, { new: true });
            return res.send({ status: 'success', message: "Grade Rule Updated Successfully", data: updatedGradeRule.title });
        }

    } catch (err) {
        res.send({ status: 'error', message: err.message });
    }
}

// Update Grade Rule Payment Head
module.exports.updateGradeRulePaymentHead = function(req, res) {
    try {
        if (req.body.paymentHead) {
            return GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId), "paymentHeads._id": ObjectID(req.params.paymentHeadsId) }, {
                $set: {
                    "paymentHeads.$.paymentHeadId": req.body.paymentHead.paymentHeadId,
                    "paymentHeads.$.type": req.body.paymentHead.type,
                    "paymentHeads.$.value": req.body.paymentHead.value,
                    "paymentHeads.$.metaData.createdAt": MetaData.dateInfo(),
                    "paymentHeads.$.trno": MetaData.getCurrentTrno(),
                    "paymentHeads.$.fixedPercentOfId": req.body.fixedPercentOfId,
                    "paymentHeads.$.fixedPercentOfName": req.body.fixedPercentOfName
                }
            }, { new: true }).then((updatedGradeRules) => {
                return res.send({ status: 'success', message: 'Grade Rule Updated Successfully', data: updatedGradeRules })
            })
        } else {
            res.send({ status: 'error', message: 'Please update values to see changes' });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Delte Grade Rule Payment Head
module.exports.deleteGradeRulePaymentHead = function(req, res) {
    try {
        if (!req.params.paymentHeadsId || !req.params.gradeRuleId) {
            return res.send({
                status: "error",
                message: "Missing Payment Head Id or Grade Rule Id"
            });
        }
        return GradeRule.findOneAndUpdate({ _id: ObjectID(req.params.gradeRuleId) }, {
                $pull: {
                    "paymentHeads": {
                        _id: ObjectID(req.params.paymentHeadsId)
                    }
                }
            }, { new: true },
            function(err, data) {
                if (err) {
                    return res.send({
                        status: "error",
                        message: "Problem in deleting Grade Rule Payment Head"
                    });
                }
                return res.send({
                    status: "success",
                    message: "Grade Rule Payment Head Deleted Successfully"
                });
            }
        );
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Delete Grade Rule
module.exports.deleteGradeRule = async function(req, res) {
    try {
        const employeeLength = await User.find({ 'employeeProfile.payroll.gradeRule': ObjectID(req.params.gradeRuleId) });
        if (employeeLength.length > 0) {
            return res.send({ status: 'error', message: 'This grade rule cannot be deleted because the employees having this grade rule' });
        }
        const deletedGradeRule = await GradeRule.deleteOne({ _id: ObjectID(req.params.gradeRuleId) });
        if (deletedGradeRule.deletedCount === 0) {
            return res.send({ status: 'error', message: "No Grade Rule To Delete. Please Check Your Grade Rule Id" });
        } else {
            return res.send({ status: 'success', message: "Grade Rule Deleted Successfully" });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// List All Grade Rule in a company
module.exports.listAllGradeRule = async function(req, res) {
    try {
        const gradeRule = await GradeRule.find({ "companyId": ObjectID(req.params.companyId) });
        return res.send({ status: 'success', message: 'Grade Rule List Successfully', data: gradeRule });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Fixed Payment heads details
module.exports.fixedPaymentHeads = async function(req, res) {
    try {
        if (req.params.gradeRuleId === 'undefined') {
            let returnData = [{
                name: 'Basic Salary',
                value: 'basicSalary'
            }]
            return res.send({ status: 'success', message: 'Fixed Payment Heads list Successfully', data: returnData });
        } else {
            let returnData = [];
            let fixedHeadsDetails = await GradeRule.findById({ _id: ObjectID(req.params.gradeRuleId) });
            for (let i = 0; i < fixedHeadsDetails.paymentHeads.length; i++) {
                if (fixedHeadsDetails.paymentHeads[i].type === 'Fixed') {
                    let paymentHeadsDetail = await PaymentHead.findById({ _id: ObjectID(fixedHeadsDetails.paymentHeads[i].paymentHeadId) });
                    let returnFixedPayment = {
                        name: paymentHeadsDetail.title,
                        value: fixedHeadsDetails.paymentHeads[i]._id
                    }
                    returnData.push(returnFixedPayment);
                }
            }
            let returnFixedPayment = {
                name: 'Basic Salary',
                value: 'basicSalary'
            }
            returnData.push(returnFixedPayment);
            return res.send({ status: 'success', message: 'Fixed Payment Heads list Successfully', data: returnData })
        }


    } catch (error) {
        return res.send({ status: 'error', message: error.message });
    }
}