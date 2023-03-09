const mongoose = require('mongoose');
const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
const logger = require('../utils/logger')(module);
const MetaData = require('./meta-data');
const sanitize = require('mongo-sanitize');
const ObjectID = require('mongodb').ObjectID;
const commonFunction = require('../commonFunctions');
const moment = require('moment');


const holidaySchema = new Schema({
    companyId: ObjectId,
    metaData: MetaData.schema,
    title: {
        type: String,
        required: [true, 'Holiday title must given']
    },
    holidayDate: {
        type: Date,
        required: [true, 'Holiday date must given']
    },
    type: {
        type: String,
        enum: ["NATIONAL", "STATE", "WEEKLY", "FESTIVAL"],
        required: [true, 'Holiday Type Required']
    }
});

// Add Holiday
holidaySchema.statics.addHoliday = function (data) {
    holidayDate = sanitize(data.holidayDate);
    var validateHolidayDate = moment(holidayDate, 'YYYY-MM-DD', true).isValid();
    if(!validateHolidayDate){
        throw new Error(`Invaild Date ${holidayDate}`);
    }
    return this.find({ 'companyId': ObjectID(data.companyId), 'holidayDate': holidayDate }).then((foundHoliday) => {
        if(foundHoliday){
            for(var i = 0; i<foundHoliday.length; i++){
                if((foundHoliday[i].title).toLowerCase() === (data.title).toLowerCase()){
                    throw new Error (`Holiday Title ${data.title} With Date ${data.holidayDate} Already Taken`);
                }else{
                    continue
                }
            }
            var Holiday = mongoose.model('Holiday', holidaySchema);
                var newHoliday = new Holiday();
                newHoliday.metaData = new MetaData();
                // Add holiday metaData details
                newHoliday.metaData.createdBy = data.companyId;
                newHoliday.metaData.createdAt = MetaData.dateInfo();
                // Add Job Profile Details
                newHoliday.companyId = data.companyId;
                newHoliday.title = data.title;
                newHoliday.holidayDate = data.holidayDate;
                newHoliday.type = data.type;
                return (newHoliday)
        }
    })// save holiday
    .then((newHoliday) => {
            return newHoliday.save().then((savedHoliday) => {
                logger.info('********  HOLIDAY ADDED SUCCESSFULLY ********', savedHoliday.title);
                return ({ holiday: savedHoliday });
            })
        })
}
module.exports = mongoose.model('Holiday', holidaySchema);
