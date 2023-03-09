const Currency = require('../models/currency');
const ObjectID = require('mongodb').ObjectID;

// Add Currency
module.exports.addCurrency = async function(req,res){
    if( (!req.body.name) || (!req.body.code) ){
        return res.send( {status:'error', message:"Missing Currency Name or Code"} );
    }
    try{
        var currencyData = {};
        currencyData = req.body;
        currencyData.code = (currencyData.code).toUpperCase();
        currencyData.userId = req.params.userId;

        const newCurrency = await Currency.addCurrency(currencyData);
        if(newCurrency){
            const returnDepartment = {
                _id: newCurrency.currency._id,
            };
            return res.send({status:'success',message:'Currency Added Successfully',department: returnDepartment});
        }else{
            return res.send({ status: 'error', message: "Unable to Add Currency" });
        }
    }catch (err){
        return res.send({ status: 'error', message: err.message });
    }
};

// Delete Currency
module.exports.deleteCurrency = async function(req,res){
     var currencyId = req.params.currencyId;
    try{
        await Currency.deleteOne( {_id: ObjectID(currencyId) });
        res.send({status: 'success', message: "Currency Deleted Successfully"});
    }catch(err){
        res.send({status: 'error', message: err.message});
    }
}

// List all the Currency
module.exports.listAllCurrency = async function(req,res){
    try{
        var currency = await Currency.find({"userId":ObjectID(req.params.userId)});
        return res.send({status:'success', message:'Currency List Success', data: currency});
    } catch(err){
        return res.send({status: 'error', message: err.message});
    }
}