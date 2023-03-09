const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const documnetSchema = new Schema({
    employeeId: ObjectId,
    companyId: ObjectId,
    gradeRule: ObjectId,
    month: String,
    year: String,
    employeeDetails: {
        employeeName: String,
        imageUrl: String,
        accountNum: String,
        companyName: String,
        designation: String,
        present: String,
        earnedLeaves: String,
        esic: String,
        pf: String,
        unsanctionedLeave: String,
        payDays: String,
        monthlyctc: String,
        annuallyctc: String,
        adjustLeave: String,
        everyDaySalary: String
    },
    earnings: Array,
    deductions: Array,
    gross: {
        label: String,
        amt: String
    },
    totalDeduction: {
        label: String,
        amt: String
    },
    netSalary: {
        label: String,
        amt: String
    },
    chequeDetails: {
        number: String,
        issueDate: Date,
        bankName: String
    }
});

module.exports = mongoose.model('Documnets',documnetSchema);