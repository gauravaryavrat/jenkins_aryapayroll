const Branch = require('../models/branch');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const commonFunction = require('../commonFunctions');
const User = require('../models/user');
const Department = require('../models/department');
const mongoose = require('mongoose');

// Add Branch
module.exports.addBranch = async function(req, res) {
    if ((!req.body.name) || (!req.body.address) || (!req.body.email) || (!req.body.officialNumber)) {
        return res.send({ status: 'error', message: "Missing name,address,email or officialNumber" });
    }

    try {
        var branchData = {};
        branchData = req.body;
        branchData.companyParentId = req.params.companyParentId;

        const newBranch = await Branch.addCompanyBranch(branchData, res);
        if (newBranch) {
            const returnBranchData = {
                _id: newBranch.branch._id,
            };
            return res.send({ status: 'success', message: 'Branch Added Successfully', companyBranch: returnBranchData });
        } else {
            return res.send({ status: 'error', message: "Unable To Add Branch" });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
};

// update Branch
module.exports.updateBranch = async function(req, res) {
    const companyParentId = req.params.companyParentId;
    const branchId = req.params.branchId;
    const updateData = {};
    updateData.bankDetails = {};

    // (req.body.name)?updateData.name = req.body.name:"";
    // (req.body.address)?updateData.address = req.body.address:"";
    // (req.body.phone)?updateData.phone = req.body.phone:"";
    // (req.body.fax)?updateData.fax = req.body.fax:"";
    // (req.body.officialNumber)?updateData.officialNumber = req.body.officialNumber:"";
    // (req.body.gstNumber)?updateData.gstNumber = req.body.gstNumber:"";
    // (req.body.currency)?updateData.currency = req.body.currency:"";

    updateData.name = req.body.name;
    updateData.address = req.body.address;
    updateData.phone = req.body.phone;
    updateData.fax = req.body.fax;
    updateData.officialNumber = req.body.officialNumber;
    updateData.gstNumber = req.body.gstNumber;
    updateData.currency = req.body.currency;
    updateData.bankDetails.bankName = req.body.bankName;
    updateData.bankDetails.bankAccNum = req.body.bankAccNum;
    updateData.bankDetails.bankType = req.body.bankType;

    try {
        if (!commonFunction.isEmpty(updateData)) {
            await Branch.findOneAndUpdate({ "metaData.createdBy": ObjectID(companyParentId), _id: ObjectID(branchId) }, updateData).exec();
            await Branch.findById(branchId).exec().then((branch) => {
                branch.metaData.updatedBy = companyParentId;
                branch.metaData.updatedAt = MetaData.dateInfo();
                branch.save();
                return res.send({ status: 'success', message: "Branch Info Updated Successfully", branch: branch });
            });
        } else {
            return res.send({ status: 'error', message: "Please Update the value too see changes" });
        }
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}

// Delete Branch
module.exports.deleteBranch = async function(req, res) {
    var branchId = req.params.branchId;
    try {
        var employeeExist = await User.find({ "employeeProfile.branchId": ObjectID(branchId) });
        var departmentExist = await Department.find({ 'userId': ObjectID(branchId) });
        if (employeeExist.length > 0 && departmentExist.length > 0) {
            throw new Error(`You can't delete the Branch as Branch linked with some Employees as well as with Departments`);
        }
        if (employeeExist.length > 0) {
            throw new Error(`You can't delete the Branch as Branch linked with some Employees`);
        }
        if (departmentExist.length > 0) {
            throw new Error(`You can't delete the Branch as Branch linked with some Departments`);
        }
        await Branch.deleteOne({ _id: ObjectID(branchId) });
        res.send({ status: 'success', message: "Branch Deleted Successfully" });
    } catch (err) {
        res.send({ status: 'error', message: err.message });
    }
}

// List all the branches for an individual company
module.exports.listAllBranches = async function(req, res) {
    try {
        const branchList = await Branch.find({ companyId: req.params.companyParentId });
        let returnData = [];
        if (branchList.length > 0) {
            for (var i = 0; i < branchList.length; i++) {
                let countryDetails = await mongoose.connection.collection("countries_infos").find({ _id: ObjectID(branchList[i].countryInfoId) }).toArray();
                let branchDetails = {
                    _id: branchList[i]._id,
                    name: branchList[i].name,
                    address: branchList[i].address,
                    officialNumber: branchList[i].officialNumber,
                    fax: branchList[i].fax,
                    email: branchList[i].email,
                    countryName: countryDetails[countryDetails.length - 1].country_name,
                    currency: countryDetails[countryDetails.length - 1].currency_code,
                    countryState: branchList[i].countryState,
                    taxationNumber: branchList[i].taxationNumber,
                    panNumber: branchList[i].panNumber,
                    outGoingMails: branchList[i].outGoingMails,
                    bankName: branchList[i].bankDetails.bankName,
                    bankAccNum: branchList[i].bankDetails.bankAccNum,
                    bankType: branchList[i].bankDetails.bankType,
                }
                returnData.push(branchDetails)
            }
        } else {
            returnData = [];
        }
        res.send({ status: 'success', message: "Branch List Success", branch: returnData });
    } catch (err) {
        res.send({ status: 'error', message: err.message });
    }
}

// List Individual Company Branch List
module.exports.branchDetails = async function(req, res) {
    try {
        var branchDetails = await Branch.findById({ _id: ObjectID(req.params.branchId) });
        return res.send({ status: 'success', message: 'Individual Branch list success', data: branchDetails });
    } catch (err) {
        return res.send({ status: 'error', message: err.message });
    }
}