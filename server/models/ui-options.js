var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var uiOptionsSchema = new Schema({

    nameInList: {
        type: Boolean,
        default: false,
    },
    printDialog: {
        type: Boolean,
        default: false,
    },
    searchItemList: {
        type: Boolean,
        default: false,
    },
    searchCustomerList: {
        type: Boolean,
        default: false,
    },
    searchSupplierList: {
        type: Boolean,
        default: false,
    },
    loginTimeOut: {
        type: String,
    },
});

module.exports = mongoose.model('UiOptions',uiOptionsSchema);