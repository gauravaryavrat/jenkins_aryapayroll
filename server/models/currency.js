const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const sanitize = require('mongo-sanitize');
const MetaData = require('./meta-data');
const logger = require('../utils/logger')(module);
const ObjectID = require('mongodb').ObjectID;

const currencySchema = new Schema({
    userId: ObjectId,
    name: {
        type: String,
        required: [true, "Currency Name is required"],
    },
    code: {
        type: String,
    },
    metaData: MetaData.schema,
});

// Add Currency Name
currencySchema.statics.addCurrency = function(data){
name = sanitize(data.name);
code = sanitize(data.code);

    const promise = this.findOne({"userId":ObjectID(data.userId),'name': { $regex:  name, $options: 'i'},'code': { $regex:  code, $options: 'i'}});
    return promise.then((foundCurrency) => {
        if(foundCurrency){
            if(foundCurrency.name === name){
                throw new Error(`Currency ${name} is already taken`);
            } else {
                throw new Error(`Currency ${code} is already taken`);
            }
        }else{
            const Currency = mongoose.model('Currency',currencySchema);
            const newCurrency = new Currency();
            newCurrency.metaData = new MetaData();
            newCurrency.metaData.createdBy = data.userId;
            newCurrency.metaData.createdAt = MetaData.dateInfo();
            newCurrency.userId = data.userId;
            newCurrency.name = data.name;
            newCurrency.code = data.code;
            return (newCurrency);
        }
    })
    //save Currency Details
    .then((newCurrency) => {
        return newCurrency.save().then((savedCurrency) => {
            logger.info('********  CURRENCY ADDED SUCCESSFULLY ********', savedCurrency.code);
            return ({currency: savedCurrency});
        }).catch(function(err){
            return err;
        });
    });
};
module.exports = mongoose.model("Currency",currencySchema);
