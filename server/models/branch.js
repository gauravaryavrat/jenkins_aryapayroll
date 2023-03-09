const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const validator = require('validator');
const sanitize = require('mongo-sanitize');
const ObjectID = require('mongodb').ObjectID;
const logger = require('../utils/logger')(module);
const MetaData = require('./meta-data');

const branchSchema = new Schema({
    companyId: { type: ObjectId },
    metaData: MetaData.schema,
    countryInfoId: ObjectId,
    countryState: String,
    name: {
        type: String,
        required: [true, "Name must me given"],
    },
    address: {
        type: String,
        required: [true, "Banch Address is Must"],
    },
    fax: {
        type: String,
        default: "",
    },
    email: {
        type: String,
        lowercase: true,
        validate: {
            isAsync: false,
            validator: validator.isEmail,
            message: `{VALUE} is not a valid address`,
        },
        required: [true, "Email Must Be Given"],
    },
    outGoingMails: String,
    officialNumber: {
        type: String,
        required: [true, "Official Number must be given"],
    },
    taxationNumber: String,
    panNumber: String,
    bankDetails: {
        bankName: String,
        bankAccNum: String,
        bankType: String
    }
});

// Add Company Branch
branchSchema.statics.addCompanyBranch = function(data, res) {
    email = sanitize(data.email.toLowerCase());

    const promise = this.findOne({ "companyId": ObjectID(data.companyParentId), 'email': email }).exec();
    return promise.then(async(foundBranch) => {
            if (foundBranch) {
                throw new Error(`Email Address ${email} is already taken.`);
            } else {

                const Branch = mongoose.model('Branch', branchSchema);
                const newBranch = new Branch();
                newBranch.metaData = new MetaData();
                newBranch.metaData.createdBy = data.companyParentId;
                newBranch.metaData.createdAt = MetaData.dateInfo();

                // Add Country Details
                if (data.countryName) {
                    let results = await mongoose.connection.collection("countries_infos").find({ "country_name": data.countryName }).toArray();
                    newBranch.countryInfoId = results[results.length - 1]._id;
                }
                newBranch.countryState = data.countryState;
                newBranch.companyId = data.companyParentId;
                newBranch.name = data.name;
                newBranch.address = data.address;
                newBranch.fax = data.fax;
                newBranch.email = data.email;
                newBranch.outGoingMails = data.outGoingMails;
                newBranch.officialNumber = data.officialNumber;
                newBranch.taxationNumber = data.taxationNumber;
                newBranch.panNumber = data.panNumber;
                // Add Bank Details
                newBranch.bankDetails.bankName = data.bankName;
                newBranch.bankDetails.bankType = data.bankType;
                newBranch.bankDetails.bankAccNum = data.bankAccNum;

                return (newBranch);
            }
        })
        //save the Company Branch Details
        .then((newBranch) => {
            // Save the details about who create the company
            return newBranch.save().then((savedBranch) => {
                logger.info('********  COMPANY BRANCH ADDED SUCCESSFULLY ********', savedBranch.email);
                return ({ branch: savedBranch });
            }).catch(function(err) {
                return res.send({ status: 'error', message: err.message });
            });
        });
};

module.exports = mongoose.model('Branch', branchSchema);