const Holiday = require('../models/holiday');
const commonFunction = require('../commonFunctions');
const ObjectID = require('mongodb').ObjectID;
const MetaData = require('../models/meta-data');
const moment = require('moment');

// Add Company Holiday
module.exports.addHoliday = async function(req,res){
    try{
        if( (!req.body.title) || (!req.body.holidayDate) ){
            return res.send({ status: 'error', message:'Missing Title or Holiday Date ' });
        }
        var addData = req.body;
        addData.companyId = req.params.companyId;

        const newHoliday = await Holiday.addHoliday(addData);
        if(newHoliday){
            var returnHoliday = {
                jobProfile:{
                    _id: newHoliday.holiday._id,
                    title: newHoliday.holiday.postionName
                }
            }
            return res.send({ status: 'success', message: 'Holiday Added Successfully',data: returnHoliday });

        }else{
            return res.send({ status:'error', message:'Unable To Add  Holiday' });
        }
    }catch(err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Update Company Holiday
module.exports.updateHoliday = async function(req,res){
    try{
        if(!req.body.holidayDate){
            throw new Error('Holiday Date Must Given');
        }
        var validateHolidayDate = moment(req.body.holidayDate, 'YYYY-MM-DD', true).isValid();
        if(!validateHolidayDate){
            throw new Error(`Invaild Date ${req.body.holidayDate}`);
        }
        const holidayId = req.params.holidayId;
        const companyId = req.params.companyId;
        var updateData = req.body;

        // check whether the update data is empty or not
        if(!commonFunction.isEmpty(updateData)){
                // Return promise for holiday title is already exists for the same company
                return await Holiday.findOne( { "companyId": ObjectID(companyId), "title": updateData.title, "holidayDate":req.body.holidayDate}).then( async (foundHoliday) => {
                    if(foundHoliday){
                        if(foundHoliday._id != holidayId){
                            throw new Error(`Holiday Title ${updateData.title} already exists on date ${req.body.holidayDate}`);
                        }
                    }
                    // update holiday
                        return await Holiday.findOneAndUpdate( {"companyId": ObjectID(companyId), _id: ObjectID(holidayId)}, updateData, {new:true} ).then((updatedHoliday) => {
                            // save update holiday meta data
                            updatedHoliday.metaData.updatedBy = updatedHoliday.companyId;
                            updatedHoliday.metaData.updatedAt = MetaData.dateInfo();
                            return updatedHoliday.save().then((holiday) => {
                            return res.send({status: 'success', message: "Holiday Update Successfully",data: holiday});
                            })
                        })
                })
            }else{
                return res.send({status: 'error', message:"Please update the value of given fields to see a change"});
            }
}catch(err){
    return res.send({status: "error", message: err.message});
}
}


// List all holidays of an individual company
module.exports.listAllholidays = async function(req,res){
    try{
        const holidays = await Holiday.find({companyId: req.params.companyId});
        res.send( {status: 'success', message: "Holidays List Success", data: holidays });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}
//filter holiday all holidays of an individual company
module.exports.filterHolidays = async function(req,res){
    try{
        console.log(req.body,req.params);
        const query = {};
        query['companyId'] = ObjectID(req.params.companyId)
        if (req.body.filterYear.trim().length > 0) {
            currentDate = new Date(req.body.filterYear);
            previousDate = new Date(moment(currentDate).add(364, 'days'));
            console.log(currentDate,previousDate);
            query['holidayDate'] = { $gte: new Date(currentDate), $lte: new Date(previousDate) }; 
        }
        const holidays = await Holiday.aggregate([
            {$match:query},
            {
                $project:{
                    "_id": "$_id",
                    "type": "$type",
                    "holidayDate": "$holidayDate",
                    "title": "$title",
                    "companyId": "$companyId",
                    "metaData":"$metaData"
                }
            }
        ])
        res.send( {status: 'success', message: "Holidays List Success", data: holidays });
    }catch(err){
        res.send({ status: 'error', message: err.message });
    }
}

// Delete the holiday
module.exports.deleteHoliday = async function(req,res){
    const holidayId = req.params.holidayId;
   try{
       const deletedHoliday = await Holiday.deleteOne( {_id: ObjectID(holidayId) });
       if(deletedHoliday.deletedCount === 0){
           res.send({ status: 'error', message: "No Holiday To Delete Please Make Sure You Enter a Valid Holiday Id" });
       }else{
        res.send({status: 'success', message: "Holiday Deleted Successfully"});
       }
   }catch(err){
       res.send({status: 'error', message: err.message});
   }
}

//List Individual Holiday Details
module.exports.holidayDetails= async function(req,res){
    try{
        var holidayDetails = await Holiday.findById({_id: ObjectID(req.params.holidayId)});
        return res.send({ status: 'success', message: 'Individual holiday list success', data: holidayDetails });
    }catch(err){
        return res.send({ status:'error', message: err.message });
    }
}