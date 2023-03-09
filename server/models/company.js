const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const logger = require('../utils/logger')(module);
const UiOptions = require('./ui-options');
const MetaData = require('./meta-data');


const companySchema = new Schema({

    userId: { type: ObjectId }, //Parent User Id
    metaData: MetaData.schema,
    name: {
        type: String,
        required: [true, "Name Which is Appear On Reports Should be Given"],
    },
    address: {
        type: String,
        required: [true, 'Address must be given'],
    },
    countryInfoId: ObjectId,
    countryState: String,
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    domicile: String,
    fax: String,
    email: {
        type: String,
        lowercase: true,
        unique: true,
        validate: {
            isAsync: false,
            validator: validator.isEmail,
            message: '{VALUE} is not a Valid Mail',
        },
        required: [true, "Company Email is Neccessary"],
    },
    outGoingMails: {
        type: String,
        default: ""
    },
    officialNumber: {
        type: String,
        required: [true, 'Official Number is neccesary'],
    },
    logoUrl: {
        type: String
    },
    newLogoUrl: {
        type: String,
        default: "",
    },
    deleteLogo: {
        type: Boolean,
        default: false,
    },
    timeZone: {
        type: String,
        default: "",
    },
    reportLogo: {
        type: String
    },
    autoIncreaseDoc: {
        type: Boolean,
        default: false,
    },
    ui: UiOptions.schema,
    payrollSetting: {
        epfNumber: {
            type: String,
        },
        taxationNumber: String,
        panNumber: {
            type: String,
        },
        tanNumber: {
            type: String
        },
        tdsCircle: {
            type: String
        },
        deductionCycle: {
            type: String,
            enum: ['Monthly', 'Quarterly', 'Yearly'],
        },
    },
    bankDetails: {
        bankName: String,
        bankAccNum: String,
        bankType: String
    }
});

// /////////////////////////////////
// PROPERTIES
// /////////////////////////////////

companySchema.virtual('fullName').get(function() {
    return this.name;
});


companySchema.statics.addCompany = async function addCompany(data) {
    email = sanitize(data.email.toLowerCase());

    const promise = this.findOne({ 'email': email }).exec();

    return promise.then(async(foundCompany) => {
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

                // Add Country Info
                if (data.countryName) {
                    let results = await mongoose.connection.collection("countries_infos").find({ "country_name": data.countryName }).toArray();
                    newCompany.countryInfoId = results[results.length - 1]._id;
                }



                newCompany.userId = data.parentUserId;
                newCompany.name = data.name;
                newCompany.status = data.status;
                newCompany.address = data.address;
                newCompany.countryState = data.stateName;
                newCompany.fax = data.fax;
                newCompany.email = data.email;
                newCompany.outGoingMails = data.outGoingMails;
                newCompany.officialNumber = data.officialNumber;
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
                newCompany.payrollSetting.taxationNumber = data.taxationNumber;
                newCompany.payrollSetting.deductionCycle = data.deductionCycle;
                // Bank Details
                newCompany.bankDetails.bankName = data.bankName;
                newCompany.bankDetails.bankAccNum = data.bankAccNum;
                newCompany.bankDetails.bankType = data.bankType;

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