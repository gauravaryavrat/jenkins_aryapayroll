const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger')(module);
const UiOptions = require('./ui-options');
const MetaData = require('./meta-data');


const compOffSchema = new Schema({

    parentUserId: { type: ObjectId }, //Parent User Id
    metaData: MetaData.schema,
    trno: Number,
    date: Date,
    inTime: Date,
    outTime: Date,
    duration: String,
    description: String,
    status: {
        type: String,
        enum: ["Pending", "Rejected", "Approved"]
    }
});

// /////////////////////////////////
// PROPERTIES
// /////////////////////////////////

compOffSchema.statics.compOffInTime = async function compOffInTime(data) {


    const promise = this.findOne({ 'email': email }).exec();
    return promise.then((foundCompany) => {
            if (foundCompany) {
                throw new Error(`Email Address ${email} already taken`);
            } else {
                const company = mongoose.model('Company', companySchema);
                const newCompany = new company();
                newCompany.metaData = new MetaData();
                // If Sub User Add the Company
                if (data.subUserId) {
                    newCompany.metaData.createdBy = data.subUserId;
                    newCompany.metaData.createdAt = MetaData.dateInfo();
                }
                // If Parent User Wants to Add the Company
                else {
                    newCompany.metaData.createdBy = data.parentUserId;
                    newCompany.metaData.createdAt = MetaData.dateInfo();
                }
                newCompany.userId = data.parentUserId;
                newCompany.name = data.name;
                newCompany.address = data.address;
                newCompany.phone = data.phone;
                newCompany.fax = data.fax;
                newCompany.email = data.email;
                newCompany.outGoingMails = data.outGoingMails;
                newCompany.officialNumber = data.officialNumber;
                newCompany.gstNumber = data.gstNumber;
                newCompany.currency = data.currency;
                newCompany.logoUrl = data.logoUrl;
                newCompany.deleteLogo = data.deleteLogo;
                newCompany.timeZone = data.timeZone;
                newCompany.reportLogo = data.reportLogo;
                newCompany.autoIncreaseDoc = data.autoIncreaseDoc;

                // UI settings
                newCompany.ui = new UiOptions();
                newCompany.ui.nameInList = data.nameInList;
                newCompany.ui.printDialog = data.printDialog;
                newCompany.ui.searchItemList = data.searchItemList;
                newCompany.ui.searchCustomerList = data.searchCustomerList;
                newCompany.ui.searchSupplierList = data.searchSupplierList;
                newCompany.ui.loginTimeOut = data.loginTimeOut;
                // Payroll Settings
                newCompany.payrollSetting.epfNumber = data.epfNumber;
                newCompany.payrollSetting.panNumber = data.panNumber;
                newCompany.payrollSetting.tanNumber = data.tanNumber;
                newCompany.payrollSetting.tdsCircle = data.tdsCircle;
                newCompany.payrollSetting.deductionCycle = data.deductionCycle;

                return (newCompany);
            }
        })
        // save the company details
        .then((newCompany) => {
            return newCompany.save().then((savedCompany) => {
                logger.info('********  COMPANY ADDED SUCCESSFULLY ********', savedCompany.email);
                return ({ company: savedCompany });
            }).catch(function(err) {
                throw new Error(err.message);
            })
        })
};

module.exports = mongoose.model('Company', companySchema);