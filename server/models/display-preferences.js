var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var displayPrefsSchema = new Schema({
    userId: {type: ObjectId},
    decimalPlaces:{
        price: {
            type: String,
            enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            default: '2',
        },
        quantities: {
            type: String,
            enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            default: '2',
        },
        exchangeRates: {
            type: String,
            enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            default: '4',
        },
        percentage: {
            type: String,
            enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            default: '1',
        },
    },
    dateFormatAndSeparator: {
        dateFormat: {
            type: String,
            enum: ['MMDDYYYY', 'DDMMYYYY', 'YYYYMMDD', 'MmmDDYYYY', 'DDMmmYYYY', 'YYYYMmmDD'],
            default: 'DDMMYYYY',
        },
        dateSeparator: {
            type: String,
            enum: [ '/',  '.',  '-'],
            default: '.',
        },
        thousandSeparator: {
            type: String,
            enum: [ ',' ,  '.',],
            default: ',',
        },
        decimalSeparator: {
            type: String,
            enum: [ ',' ,  '.',],
            default: '.',            
        },
        datePicker: {
            type: Boolean,
            default: true,
        },
    },
    reports: {
        saveReport: {
            type: String,
        },
        defaultReportDest: {
            type: String,
            enum: ['PDF/Printer', 'Excel'],
            default: 'PDF/Printer',
        },
        defaultReportOrient: {
            type: String,
            enum: ['Portrait', 'Landscape'],
            default: 'Portrait',
        },
    },
    miscellaneous: {
        showHintToNewUser: {
            type: Boolean,
            default: true,
        },
        showGlInfo: {
            type: Boolean,
            default: true,
        },
        itemCodes: {
            type: Boolean,
            default: false,
        },
        theme: {
            type: String,
            enum: ['default', 'flat', 'shinee'],
            default: 'default',
        },
        pageSize: {
            type: String,
            enum: ['Letter', 'A4'],
            default: 'Letter',
        },
        startTab: {
            type: String,
            enum: ['Sales', 'Purchases', 'Items and Inventory', 'Manufacturing', 'Fixed Assets', 'Dimensions', 'Banking and General Ledger', 'Human Resource', 'Projects', 'Point Of Sales', 'Setup' ],
            default: 'Sales',
        },
        printProfile: {
            type: String,
            enum: ['Browser Printing Support', 'Central', 'Out Of Office', 'Sales Department'],
            default: 'Browser Printing Support',
        },
        popWindowReports: {
            type: Boolean,
            default: true,
        },
        iconsInsteadTextLinks: {
            type: Boolean,
            default: true,
        },
        lastDocDate: {
            type: Boolean,
            default: false,
        },
        queryPageSize: {
            type: Number,
            default: 1,
        },
        transDays: {
            type: Number,
            default: 30,
        },
    },
    language: {
        type: String,
        enum: ['Hindi', 'English', 'French'],
        default: 'English'
    },
});

module.exports = mongoose.model('DisplayPrefs',displayPrefsSchema);